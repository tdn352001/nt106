import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import {
  Conversation,
  Message,
  ReadedMessageResponse,
} from 'main/chat-client/types';
import { RootState } from 'renderer/store';
import { ConversationDetail } from './../../../main/chat-client/types';

export interface ConversationState {
  selectedId?: string;
  selectedDetail?: ConversationDetail;
  conversations: Conversation[];
}

const initialState: ConversationState = {
  selectedId: undefined,
  selectedDetail: undefined,
  conversations: [],
};

const name = 'conversation';

export const conversationSlice = createSlice({
  name,
  initialState,
  reducers: {
    setSelectedConversation: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      const id = action.payload;
      state.selectedId = id;

      if (id && state.conversations) {
        const convIndex = state.conversations.findIndex(
          (item) => item._id === id
        );
        if (convIndex !== -1) {
          state.conversations[convIndex].unreadMessages = 0;
        }
      }
    },
    setConversationDetail: (
      state,
      action: PayloadAction<ConversationDetail | undefined>
    ) => {
      state.selectedDetail = action.payload;
    },
    setConversation: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    readConversation: (state, action: PayloadAction<ReadedMessageResponse>) => {
      const res = action.payload.data;
      if (
        res &&
        res.conversationId &&
        res.messages &&
        res.messages.length > 0
      ) {
        console.log({ id: res.conversationId });
        const convId = state.conversations.findIndex(
          (item) => item._id === res.conversationId
        );
        console.log(convId);

        if (convId !== -1) {
          const conversation = state.conversations[convId];
          const message = res.messages.find(
            (message) => message._id === conversation.message._id
          );
          console.log({ message, conversation: conversation.message });
          if (message) {
            state.conversations[convId].message = message;
            console.log('setmessage');
          }
        }
      }
    },
    updateConversationDetailMessage: (
      state,
      action: PayloadAction<Message>
    ) => {
      if (state.selectedDetail) {
        const selectedConvId = state.selectedDetail._id;
        const message = action.payload;
        console.log({ message });
        if (selectedConvId && selectedConvId === message.conversationId) {
          const messageIndex = state.selectedDetail.messages.findIndex(
            (item) => item._id === message._id
          );
          if (messageIndex === -1) {
            state.selectedDetail.messages.unshift(message);
          }
        }
      }
    },
    updateConversationMessage: (
      state,
      action: PayloadAction<{ message: Message; userId: string }>
    ) => {
      const userId = action.payload.userId;
      const message = action.payload.message;
      const convIndex = state.conversations.findIndex(
        (item) => item._id === message.conversationId
      );
      if (convIndex != -1) {
        const conversation = state.conversations[convIndex];
        if (conversation.message.sender._id === userId) {
          conversation.unreadMessages = 0;
        } else {
          conversation.unreadMessages += 1;
        }
        conversation.message = message;

        state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conversation);
      }
    },
    addNewConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.unshift(action.payload);
    },
  },
});

export const {
  setConversation,
  setSelectedConversation,
  setConversationDetail,
  readConversation,
  updateConversationDetailMessage,
  updateConversationMessage,
  addNewConversation,
} = conversationSlice.actions;

export const selectedConversationIdSelector = (state: RootState) =>
  state.conversation.selectedId ?? '';

export const conversationsSelector = (state: RootState) =>
  state.conversation.conversations;

export const conversationDetailSelector = (state: RootState) =>
  state.conversation.selectedDetail;

export const conversationInfoSelector = (state: RootState) => {
  return state.conversation.selectedDetail;
};

export const conversationMessageSelector = (state: RootState) =>
  state.conversation.selectedDetail?.messages ?? [];
