import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { ConnectState, User } from 'main/chat-client/types';
import { RootState } from 'renderer/store';

export interface GlobalState {
  selectedTab: number;
  connectState: ConnectState;
  newChatModal?: 'private' | 'group';
  user?: User;
}

const initialState: GlobalState = {
  selectedTab: 0,
  connectState: ConnectState.IDLE,
};

const name = 'global';

export const globalSlice = createSlice({
  name,
  initialState,
  reducers: {
    setSelectedTab: (state, action: PayloadAction<number>) => {
      state.selectedTab = action.payload;
    },
    setConnectState: (state, action: PayloadAction<ConnectState>) => {
      state.connectState = action.payload;
    },
    setUser: (state, action: PayloadAction<User | undefined>) => {
      state.user = action.payload;
    },
    setNewChatModal: (
      state,
      action: PayloadAction<GlobalState['newChatModal']>
    ) => {
      state.newChatModal = action.payload;
    },
  },
});

export const { setSelectedTab, setConnectState, setUser, setNewChatModal } =
  globalSlice.actions;

export const selectedTabSelector = (state: RootState) =>
  state.global.selectedTab;

export const connectStateSelector = (state: RootState) =>
  state.global.connectState;

export const userSelector = (state: RootState) => state.global.user;
export const userIdSelector = (state: RootState) =>
  state.global.user ? state.global.user._id : '';
export const newChatModalSelector = (state: RootState) =>
  state.global.newChatModal;
