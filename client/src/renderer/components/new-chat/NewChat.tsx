import { AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import NewGroupChat from 'renderer/components/new-chat/NewGroupChat';
import NewPrivateChat from 'renderer/components/new-chat/NewPrivateChat';
import { newChatModalSelector } from 'renderer/store/slices/global';

const NewChat = () => {
  const newChat = useSelector(newChatModalSelector);
  return (
    <div>
      <AnimatePresence>
        {newChat === 'private' && <NewPrivateChat />}
        {newChat === 'group' && <NewGroupChat />}
      </AnimatePresence>
    </div>
  );
};

export default NewChat;
