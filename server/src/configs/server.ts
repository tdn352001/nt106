import net from 'net'
import util from 'util'
import { authService } from '../services/auth-service'
import { chatService } from '../services/chat-service'
import { conversationService } from '../services/conversation-service'
import { userService } from '../services/user-service'
import { PORT } from './environment'
import { RequestType } from './types'

const connectedClients = new Map<string, net.Socket>()

export const createServer = () => {
  const server = net.createServer((connection) => {
    let userId: string | null = null
    console.log('client connected', connection.remoteAddress, connection.remotePort)

    let receivedData = ''

    connection.on('data', (data) => {
      try {
        receivedData += data.toString()
        const requestData = JSON.parse(receivedData)
        const type = requestData.type as RequestType
        receivedData = ''
        console.log(
          util.inspect(
            {
              userId,
              type,
              data: requestData,
            },
            { depth: null, colors: true }
          )
        )

        switch (type) {
          case RequestType.LOGIN:
            authService.login(connection, requestData, (_userId) => {
              userId = _userId
              connectedClients.set(_userId, connection)
            })
            break

          case RequestType.REGISTER:
            authService.register(connection, requestData, (_userId) => {
              userId = _userId
              connectedClients.set(_userId, connection)
            })
            break
          case RequestType.CHECK_AUTH:
            authService.checkAuth(connection, requestData, (_userId) => {
              userId = _userId
              connectedClients.set(_userId, connection)
            })
            break

          case RequestType.FIND_USER:
            if (userId) {
              userService.findUsers(connection, userId, requestData)
            }
            break
          case RequestType.GET_CONVERSATIONS:
            if (userId) {
              conversationService.getConversations(connection, userId)
            }
            break
          case RequestType.GET_CONVERSATION_BY_ID:
            if (userId) {
              conversationService.getConversationById(
                connection,
                connectedClients,
                userId,
                requestData.id
              )
            }
            break
          case RequestType.SEND_TEXT_MESSAGE:
            if (userId) {
              chatService.setTextMessage(
                connection,
                connectedClients,
                userId as string,
                requestData
              )
            }
            break
          case RequestType.SEND_FILE_MESSAGE:
            if (userId) {
              chatService.sendFileMessage(
                connection,
                connectedClients,
                userId as string,
                requestData
              )
            }
            break
          case RequestType.NEW_PRIVATE_CONVERSATION:
            if (userId) {
              conversationService.createNewPrivateConversation(
                connection,
                connectedClients,
                userId as string,
                requestData
              )
            }
            break
          case RequestType.NEW_GROUP_CONVERSATION:
            if (userId) {
              conversationService.createGroupConversation(
                connection,
                connectedClients,
                userId as string,
                requestData
              )
            }
            break
        }
      } catch (err) {
        console.log({ err })
        connection.write(
          JSON.stringify({
            success: false,
            status: 404,
            message: err.message ?? 'Invalid request',
            err,
          })
        )
      }
    })

    connection.on('error', (err) => {
      console.error(err)
    })

    connection.on('close', () => {
      if (userId) {
        connectedClients.delete(userId)
      }
    })
  })

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}
