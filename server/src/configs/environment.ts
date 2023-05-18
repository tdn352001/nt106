import * as dotenv from 'dotenv'
dotenv.config()

export const PORT = process.env.PORT || 4000
export const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING as string
export const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET as string
