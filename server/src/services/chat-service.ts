import fs from 'fs'
import mongoose from 'mongoose'
import net from 'net'
import path from 'path'
import { MessageType, ResponseType } from '../configs/types'
import { Conversations, Messages, Users } from '../models'

class ChatService {
  async setTextMessage(
    sender: net.Socket,
    clients: Map<string, net.Socket>,
    userId: string,
    data: any
  ) {
    const { conversationId, content } = data

    if (!conversationId) {
      return sender.write(
        JSON.stringify({
          type: ResponseType.NEW_MESSAGE,
          success: false,
          message: 'Không tìm thấy cuộc trò chuyện',
        })
      )
    }

    let conversation = await Conversations.findById(conversationId)
    console.log({ conversation })
    if (!conversation) {
      console.log('cant find conversation')
      sender.write(
        JSON.stringify({
          type: ResponseType.NEW_MESSAGE,
          success: false,
          message: 'Không tìm thấy cuộc trò chuyện',
        })
      )
      return false
    }

    const newMessage = await Messages.create({
      conversationId: conversation._id,
      senderId: new mongoose.Types.ObjectId(userId),
      content,
      type: MessageType.TEXT,
      readed: [new mongoose.Types.ObjectId(userId)],
    })

    console.log({ newMessage })

    conversation.messages.push(newMessage._id)

    await conversation.save()

    const user = await Users.findById(userId)

    conversation.members.forEach((item) => {
      const memberId = item.toString()
      const socket = clients.get(memberId)

      if (socket) {
        socket.write(
          JSON.stringify({
            type: ResponseType.NEW_MESSAGE,
            success: true,
            data: {
              message: {
                ...newMessage.toObject(),
                sender: user,
                readed: [user],
              },
            },
          })
        )
      }
    })
    return true
  }

  async sendFileMessage(
    sender: net.Socket,
    clients: Map<string, net.Socket>,
    userId: string,
    data: any
  ) {
    const { conversationId, file: fileData, ext } = data

    if (!conversationId) {
      return sender.write(
        JSON.stringify({
          type: ResponseType.NEW_MESSAGE,
          success: false,
          message: 'Không tìm thấy cuộc trò chuyện',
        })
      )
    }

    let conversation = await Conversations.findById(conversationId)
    console.log({ conversation })
    if (!conversation) {
      console.log('cant find conversation')
      sender.write(
        JSON.stringify({
          type: ResponseType.NEW_MESSAGE,
          success: false,
          message: 'Không tìm thấy cuộc trò chuyện',
        })
      )
      return false
    }

    const messageType = (function () {
      const extenstion = ext as string
      if (extenstion.includes('mp4')) {
        return MessageType.VIDEO
      }

      const images = ['.jpeg', '.png', '.jpg']
      if (images.includes(extenstion)) {
        return MessageType.IMAGE
      }

      return MessageType.TEXT
    })()
    console.log({ messageType, ext })

    const newMessage = await Messages.create({
      conversationId: conversation._id,
      senderId: new mongoose.Types.ObjectId(userId),
      content: 'hello',
      type: messageType,
      readed: [new mongoose.Types.ObjectId(userId)],
    })

    const fileName = `${newMessage._id.toString()}${ext}`

    const saveDirectory = path.resolve(__dirname, '..', '..', 'public')
    const savePath = path.join(saveDirectory, fileName)
    fs.writeFile(savePath, Buffer.from(fileData), (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('File written successfully\n')
        console.log('The written has the following contents:')
      }
    })

    newMessage.content = fileName
    await newMessage.save()
    conversation.messages.push(newMessage._id)

    await conversation.save()

    const user = await Users.findById(userId)

    conversation.members.forEach((item) => {
      const memberId = item.toString()
      const socket = clients.get(memberId)

      if (socket) {
        socket.write(
          JSON.stringify({
            type: ResponseType.NEW_MESSAGE,
            success: true,
            data: {
              message: {
                ...newMessage.toObject(),
                sender: user,
                readed: [user],
              },
            },
          })
        )
      }
    })

    return true
  }
}

export const chatService = new ChatService()
