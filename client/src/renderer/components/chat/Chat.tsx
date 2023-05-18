import { ConnectState } from 'main/chat-client/types';
import { useEffect } from 'react';
import Heading from 'renderer/components/chat/Heading';
import MessageBox from 'renderer/components/chat/MessageBox';
import MessageList from 'renderer/components/chat/MessageList';
import { useAppDispatch } from 'renderer/hooks/use-app-dispatch';
import { useAppSelector } from 'renderer/hooks/use-app-selector';
import {
  selectedConversationIdSelector,
  setConversationDetail,
  updateConversationDetailMessage,
} from 'renderer/store/slices/conversation';
import { connectStateSelector } from 'renderer/store/slices/global';

const Chat = () => {
  const conversationId = useAppSelector(selectedConversationIdSelector);
  const connectState = useAppSelector(connectStateSelector);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (conversationId && connectState === ConnectState.CONNECTED) {
      window.conversation.getConversationById(conversationId);
    }

    const listener = window.conversation.onGetConversationByIdResponse(
      (res) => {
        dispatch(setConversationDetail(res.data?.conversation));
      }
    );

    return listener;
  }, [conversationId, connectState, dispatch]);

  useEffect(() => {
    const listener = window.conversation.onNewMessage((res) => {
      if (res.data?.message) {
        dispatch(updateConversationDetailMessage(res.data.message));
      }
    });

    return listener;
  }, [dispatch]);

  return (
    <div className="pl-0.5 w-full h-screen flex flex-col">
      <Heading />
      <MessageList />
      <MessageBox />
    </div>
  );
};

export default Chat;
