import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import net from 'net'
import { JWT_ACCESS_TOKEN_SECRET } from '../configs/environment'
import { RequestType } from '../configs/types'
import Users from '../models/Users'
import { verifyToken } from '../utils/verify-token'

class AuthService {
  async login(socket: net.Socket, data: any, callback: (userId: string) => void) {
    try {
      const { username, password } = data

      if (!username || !password) {
        return socket.write(
          JSON.stringify({
            type: RequestType.LOGIN,
            status: 401,
            message: 'Missing username or password',
          })
        )
      }

      const user = await Users.findOne({ username })

      if (user) {
        const isPasswordValid = await argon2.verify(user.password!, password)

        if (isPasswordValid) {
          const accessToken = jwt.sign({ userId: user._id }, JWT_ACCESS_TOKEN_SECRET)
          callback(user._id.toString())

          return socket.write(
            JSON.stringify({
              type: RequestType.LOGIN,
              success: true,
              status: 200,
              message: 'Login Successfully',
              data: {
                accessToken,
                user,
              },
            })
          )
        }
      }
      return socket.write(
        JSON.stringify({
          type: RequestType.LOGIN,
          status: 401,
          message: 'Incorrect username or password',
        })
      )
    } catch (error) {
      return socket.write(
        JSON.stringify({
          type: RequestType.LOGIN,
          status: 401,
          message: error.message ?? 'Incorrect username or password',
        })
      )
    }
  }

  async register(socket: net.Socket, data: any, callback: (userId: string) => void) {
    try {
      const { username, password } = data

      if (!username || !password) {
        return socket.write(
          JSON.stringify({
            type: RequestType.REGISTER,
            status: 401,
            message: 'Missing username or password',
          })
        )
      }

      const user = await Users.findOne({ username })

      if (user) {
        return socket.write(
          JSON.stringify({
            type: RequestType.REGISTER,
            status: 401,
            message: 'Username already exists',
          })
        )
      }

      const hashedPassword = await argon2.hash(password)
      const newUser = new Users({
        username,
        password: hashedPassword,
      })
      await newUser.save()

      const accessToken = jwt.sign({ userId: newUser._id }, JWT_ACCESS_TOKEN_SECRET)

      callback(newUser._id.toString())

      return socket.write(
        JSON.stringify({
          type: RequestType.REGISTER,
          status: 201,
          success: true,
          message: 'Register Successfully',
          data: {
            accessToken,
          },
        })
      )
    } catch (err) {
      return socket.write(
        JSON.stringify({
          type: RequestType.REGISTER,
          status: 500,
          message: err.message ?? 'Internal server error',
        })
      )
    }
  }

  async checkAuth(socket: net.Socket, data: any, callback: (userId: string) => void) {
    try {
      const token = data.token
      const user = await verifyToken(token)
      callback(user._id.toString())
      return socket.write(
        JSON.stringify({
          type: RequestType.CHECK_AUTH,
          success: true,
          status: 200,
          data: {
            accessToken: token,
            user,
          },
        })
      )
    } catch (err) {
      return socket.write(
        JSON.stringify({
          type: RequestType.CHECK_AUTH,
          status: 500,
          message: err.message ?? 'Internal server error',
        })
      )
    }
  }
}

export const authService = new AuthService()
