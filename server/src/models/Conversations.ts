import mongoose from 'mongoose'
import { ConversationType } from '../configs/types'

const ConversationSchema = new mongoose.Schema(
  {
    name: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Messages' }],
    type: {
      type: String,
      enum: ConversationType,
      default: ConversationType.PRIVATE,
    },
  },
  {
    timestamps: true,
  }
)

export const Conversations = mongoose.model('Conversations', ConversationSchema)
export type Conversation = InstanceType<typeof Conversations>
