import { JwtPayload, verify } from 'jsonwebtoken'
import { JWT_ACCESS_TOKEN_SECRET } from '../configs/environment'
import Users from '../models/Users'

export type AuthPayload = JwtPayload & { userId: string }

export const verifyToken = async (
  token: string | undefined,
  callback?: (user: InstanceType<typeof Users>) => void
) => {
  if (!token) {
    throw Error('Token not found')
  }

  const decoded = verify(token, JWT_ACCESS_TOKEN_SECRET) as AuthPayload

  const user = await Users.findById(decoded.userId)

  if (!user) {
    throw Error('User not found')
  }

  if (callback) {
    callback(user)
  }

  return user
}
