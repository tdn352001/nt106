import net from 'net'
import { ResponseType } from '../configs/types'
import { Users } from '../models'

const findUsers = async (clientSocket: net.Socket, userId: string, req: any) => {
  const name = req.name ?? ''
  const users = await Users.find({
    _id: { $ne: userId },
    username: {
      $regex: name,
      $options: 'i',
    },
  })

  return clientSocket.write(
    JSON.stringify({
      type: ResponseType.FIND_USER,
      success: true,
      data: {
        users,
      },
    })
  )
}

export const userService = {
  findUsers,
}
