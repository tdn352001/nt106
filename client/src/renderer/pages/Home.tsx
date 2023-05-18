import NoneConversationSelected from 'renderer/components/NoneConversationSelected';
import Chat from 'renderer/components/chat/Chat';
import NewChat from 'renderer/components/new-chat/NewChat';
import { useAppSelector } from 'renderer/hooks/use-app-selector';
import { selectedConversationIdSelector } from 'renderer/store/slices/conversation';
import {} from 'renderer/store/slices/global';

const Home = () => {
  const selectedConvId = useAppSelector(selectedConversationIdSelector);
  return (
    <div>
      {selectedConvId ? <Chat /> : <NoneConversationSelected />}
      <NewChat />
    </div>
  );
};

export default Home;
