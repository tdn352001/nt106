import mongoose from 'mongoose'
import { MessageType } from '../configs/types'

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    readed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    type: { type: String, enum: Object.values(MessageType), default: MessageType.TEXT },
  },
  {
    timestamps: true,
  }
)

export const Messages = mongoose.model('Messages', MessageSchema)
