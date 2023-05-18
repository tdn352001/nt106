import mongoose from 'mongoose'
import { DB_CONNECTION_STRING } from '../configs/environment'

export const connectDatabase = async () => {
  console.log('Connecting to mongodb: ', DB_CONNECTION_STRING)
  return mongoose
    .connect(DB_CONNECTION_STRING)
    .then(() => {
      console.log('Database connected.')
    })
    .catch((err) => {
      console.log('Database connect failed.', err.message)
      console.error(err)
    })
}
