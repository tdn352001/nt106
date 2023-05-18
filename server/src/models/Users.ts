import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    thumbnail: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

export const Users = mongoose.model('Users', UserSchema)
export type UsersInstance = InstanceType<typeof Users>

export default Users
