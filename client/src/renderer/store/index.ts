import { configureStore } from '@reduxjs/toolkit';
import { conversationSlice } from 'renderer/store/slices/conversation';
import { counterSlice } from 'renderer/store/slices/couter';
import { globalSlice } from 'renderer/store/slices/global';

export const store = configureStore({
  reducer: {
    [counterSlice.name]: counterSlice.reducer,
    [globalSlice.name]: globalSlice.reducer,
    [conversationSlice.name]: conversationSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
