import mongoose from 'mongoose'
import net from 'net'
import { ConversationType, ResponseType } from '../configs/types'
import { Conversation, Conversations, Messages, Users } from '../models'
import { chatService } from '../services/chat-service'

const getConversations = async (clientSocket: net.Socket, userId: string) => {
  return Conversations.aggregate([
    {
      $match: {
        members: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'members',
        foreignField: '_id',
        as: 'members',
        pipeline: [
          {
            $project: {
              _id: '$_id',
              username: '$username',
              thumbnail: '$thumbnail',
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'messages',
        localField: 'messages',
        foreignField: '_id',
        as: 'messages',
        pipeline: [
          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        unreadMessages: {
          $size: {
            $filter: {
              input: '$messages',
              cond: {
                $not: {
                  $in: [new mongoose.Types.ObjectId(userId), '$$this.readed'],
                },
              },
            },
          },
        },
      },
    },
    { $unwind: '$messages' },
    {
      $lookup: {
        from: 'users',
        localField: 'messages.senderId',
        foreignField: '_id',
        as: 'messages.sender',
        pipeline: [
          {
            $project: {
              _id: '$_id',
              username: '$username',
              thumbnail: '$thumbnail',
            },
          },
        ],
      },
    },
    {
      $set: {
        'messages.sender': {
          $arrayElemAt: ['$messages.sender', 0],
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'messages.readed',
        foreignField: '_id',
        as: 'messages.readed',
        pipeline: [
          {
            $project: {
              _id: '$_id',
              username: '$username',
              thumbnail: '$thumbnail',
            },
          },
        ],
      },
    },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        members: { $first: '$members' },
        message: { $push: '$messages' },
        type: { $first: '$type' },
        unreadMessages: { $first: '$unreadMessages' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
      },
    },
    {
      $set: {
        message: {
          $first: '$message',
        },
      },
    },
    {
      $sort: {
        'message.createdAt': -1,
      },
    },
  ]).then((conversations) => {
    clientSocket.write(
      JSON.stringify({
        type: ResponseType.GET_CONVERSATIONS,
        status: 200,
        success: true,
        data: {
          conversations,
        },
      })
    )
  })
}

const getConversationById = async (
  clientSocket: net.Socket,
  clients: Map<string, net.Socket>,
  userId: string,
  conversationId: string
) => {
  const conversations: Conversation[] = await Conversations.aggregate([
    {
      $match: {
        members: new mongoose.Types.ObjectId(userId),
        _id: new mongoose.Types.ObjectId(conversationId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'members',
        foreignField: '_id',
        as: 'members',
        pipeline: [
          {
            $project: {
              _id: '$_id',
              username: '$username',
              thumbnail: '$thumbnail',
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'messages',
        localField: 'messages',
        foreignField: '_id',
        as: 'messages',
        pipeline: [
          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
      },
    },
    { $unwind: '$messages' },
    {
      $lookup: {
        from: 'users',
        localField: 'messages.senderId',
        foreignField: '_id',
        as: 'messages.sender',
        pipeline: [
          {
            $project: {
              _id: '$_id',
              username: '$username',
              thumbnail: '$thumbnail',
            },
          },
        ],
      },
    },
    {
      $set: {
        'messages.sender': {
          $arrayElemAt: ['$messages.sender', 0],
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'messages.readed',
        foreignField: '_id',
        as: 'messages.readed',
        pipeline: [
          {
            $project: {
              _id: '$_id',
              username: '$username',
              thumbnail: '$thumbnail',
            },
          },
        ],
      },
    },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        members: { $first: '$members' },
        messages: { $push: '$messages' },
        type: { $first: '$type' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
      },
    },
  ])

  const conversation = conversations ? conversations[0] : undefined

  if (conversation) {
    const messages = await Messages.find({
      conversationId: conversationId,
      readed: { $ne: userId },
    })
    if (messages && messages.length > 0) {
      const messageIds = messages.map((item) => item._id)
      console.log({ messageIds })

      await Messages.updateMany(
        {
          conversationId: conversationId,
          readed: { $ne: userId },
        },
        { $push: { readed: userId } }
      )

      const updatedMessages = await Messages.aggregate([
        {
          $match: {
            _id: {
              $in: messageIds,
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'senderId',
            foreignField: '_id',
            as: 'sender',
            pipeline: [
              {
                $project: {
                  _id: '$_id',
                  username: '$username',
                  thumbnail: '$thumbnail',
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'readed',
            foreignField: '_id',
            as: 'readed',
            pipeline: [
              {
                $project: {
                  _id: '$_id',
                  username: '$username',
                  thumbnail: '$thumbnail',
                },
              },
            ],
          },
        },
        {
          $set: {
            sender: {
              $arrayElemAt: ['$sender', 0],
            },
          },
        },
      ])

      if (updatedMessages) {
        conversation.members.forEach((member) => {
          const memberId = member._id.toString()
          if (memberId !== userId) {
            const memberSocket = clients.get(memberId)
            if (memberSocket) {
              memberSocket.write(
                JSON.stringify({
                  type: ResponseType.READED_MESSAGE,
                  data: {
                    conversationId: conversation._id,
                    messages: updatedMessages,
                  },
                })
              )
            }
          }
        })
      }
    }
  }

  clientSocket.write(
    JSON.stringify({
      type: ResponseType.GET_CONVERSATION_BY_ID,
      status: 200,
      success: true,
      data: {
        conversation,
      },
    })
  )
}

const createNewPrivateConversation = async (
  clientSocket: net.Socket,
  clients: Map<string, net.Socket>,
  userId: string,
  requestData: any
) => {
  const { receiverId, content } = requestData

  let conversation = await Conversations.findOne({
    members: {
      $all: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(receiverId)],
    },
    type: ConversationType.PRIVATE,
  })

  if (conversation) {
    await chatService.setTextMessage(clientSocket, clients, userId, {
      conversationId: conversation._id.toString(),
      content,
    })

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        clientSocket.write(
          JSON.stringify({
            type: ResponseType.NEW_PRIVATE_CONVERSATION,
            data: {
              conversationId: conversation?._id,
              receiverId,
            },
          })
        )
        resolve()
      }, 200)
    })
  } else {
    conversation = await Conversations.create({
      members: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(receiverId)],
      messages: [],
      type: ConversationType.PRIVATE,
    })
    const user = await Users.findById(userId)
    const receiverUser = await Users.findById(receiverId)

    const message = await Messages.create({
      conversationId: conversation._id,
      content,
      senderId: new mongoose.Types.ObjectId(userId),
      readed: [new mongoose.Types.ObjectId(userId)],
    })

    conversation.messages.push(message._id)
    await conversation.save()

    clientSocket.write(
      JSON.stringify({
        type: ResponseType.NEW_PRIVATE_CONVERSATION,
        success: true,
        data: {
          conversation: {
            ...conversation.toObject(),
            members: [user?.toObject(), receiverUser?.toObject()],
            message: {
              ...message.toObject(),
              sender: user?.toObject(),
              readed: [user?.toObject()],
            },
          },
          receiverId,
        },
      })
    )

    const reveiverSocket = clients.get(receiverId)

    if (reveiverSocket) {
      reveiverSocket.write(
        JSON.stringify({
          type: ResponseType.NEW_PRIVATE_CONVERSATION,
          success: true,
          data: {
            conversation: {
              ...conversation.toObject(),
              members: [user?.toObject(), receiverUser?.toObject()],
              message: {
                ...message.toObject(),
                sender: user?.toObject(),
                readed: [user?.toObject()],
              },
              unreadMessages: 1,
            },
            receiverId,
          },
        })
      )
    }
  }
}

const createGroupConversation = async (
  clientSocket: net.Socket,
  clients: Map<string, net.Socket>,
  userId: string,
  requestData: any
) => {
  const { receiverIds, content, name, requestId } = requestData

  const receiverUserIds = receiverIds as string[]

  const members = [
    new mongoose.Types.ObjectId(userId),
    ...receiverUserIds.map((item) => new mongoose.Types.ObjectId(item)),
  ]

  const conversation = await Conversations.create({
    members,
    messages: [],
    type: ConversationType.GROUP,
    name,
  })

  const memberUsers = await Promise.all(members.map((id) => Users.findById(id)))

  const message = await Messages.create({
    conversationId: conversation._id,
    content,
    senderId: new mongoose.Types.ObjectId(userId),
    readed: [new mongoose.Types.ObjectId(userId)],
  })

  conversation.messages.push(message._id)
  await conversation.save()

  const membersObj = memberUsers.map((item) => item?.toObject())

  clientSocket.write(
    JSON.stringify({
      type: ResponseType.NEW_GROUP_CONVERSATION,
      success: true,
      data: {
        conversation: {
          ...conversation.toObject(),
          members: membersObj,
          message: {
            ...message.toObject(),
            sender: membersObj[0],
            readed: [membersObj[0]],
          },
        },
        requestId,
      },
    })
  )

  receiverUserIds.forEach((item) => {
    if (item !== userId) {
      const socket = clients.get(item)
      if (socket) {
        socket.write(
          JSON.stringify({
            type: ResponseType.NEW_GROUP_CONVERSATION,
            success: true,
            data: {
              conversation: {
                ...conversation.toObject(),
                members: membersObj,
                message: {
                  ...message.toObject(),
                  sender: membersObj[0],
                  readed: [membersObj[0]],
                },
                unreadMessages: 1,
              },
            },
          })
        )
      }
    }
  })
}
export const conversationService = {
  getConversations,
  getConversationById,
  createNewPrivateConversation,
  createGroupConversation,
}
