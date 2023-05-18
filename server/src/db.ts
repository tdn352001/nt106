import { faker } from '@faker-js/faker'
import argon2 from 'argon2'
import mongoose from 'mongoose'
import util from 'util'
import { connectDatabase } from './configs/database'
import { ConversationType } from './configs/types'
import { Conversations, Messages, Users } from './models'

async function generateData() {
  await connectDatabase()
  const users: InstanceType<typeof Users>[] = []

  async function createRandomUser() {
    const password = await argon2.hash('123123')
    const user = await Users.create({
      username: faker.internet.userName(),
      password: password,
    })
    await user.save()
    users.push(user)
  }
  for (let i = 0; i < 5; i++) {
    await createRandomUser()
  }

  // tạo conversations và messages cho mỗi user
  for (const user of users) {
    const conversations: InstanceType<typeof Conversations>[] = []

    for (let i = 0; i < 3; i++) {
      const isPrivate = faker.datatype.boolean()
      const members = [user._id]
      let name = ''

      if (isPrivate) {
        // tạo một conversation private với một user khác
        const otherUser = users.find((u) => u._id !== user._id)
        members.push(otherUser!._id)
      } else {
        // tạo một conversation group với ít nhất 2 user
        const otherUsers = users.filter((u) => u._id !== user._id)
        const randomUsers = faker.helpers
          .shuffle(otherUsers)
          .slice(0, faker.datatype.number({ min: 1, max: 3 }))

        for (const otherUser of randomUsers) {
          members.push(otherUser._id)
        }

        name = `${faker.helpers.arrayElement([
          'Team',
          'Group',
          'Club',
          'Squad',
        ])} ${faker.random.word()}`
      }

      const conversation = await Conversations.create({
        name,
        type: isPrivate ? ConversationType.PRIVATE : ConversationType.GROUP,
        members,
      })
      conversations.push(conversation)

      // tạo messages cho conversation
      for (let j = 0; j < 3; j++) {
        const message = await Messages.create({
          conversationId: conversation._id,
          senderId: user._id,
          content: faker.lorem.sentence(),
        })
        conversation.messages.push(message._id)
      }

      await conversation.save()
    }
  }
}

// generateData()

async function getConversations() {
  await connectDatabase()
  const userId = '645bd4d6b02e56891f55cb22'

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
  ]).then((conversations) => {
    console.log(util.inspect(conversations, { depth: null, colors: true }))
  })
}

getConversations()
