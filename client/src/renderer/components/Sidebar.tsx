import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import ConversationItem from 'renderer/components/ConversationItem';
import { useAppDispatch } from 'renderer/hooks/use-app-dispatch';
import { useAppSelector } from 'renderer/hooks/use-app-selector';
import {
  addNewConversation,
  conversationsSelector,
  readConversation,
  selectedConversationIdSelector,
  updateConversationMessage,
} from 'renderer/store/slices/conversation';
import { setNewChatModal, userIdSelector } from 'renderer/store/slices/global';

const Sidebar = () => {
  const [keyword, setKeyword] = useState('');
  const [togglePopup, setTogglePopup] = useState(false);
  const conversations = useAppSelector(conversationsSelector);
  const selectedConvId = useAppSelector(selectedConversationIdSelector);
  const userId = useAppSelector(userIdSelector);
  const dispatch = useAppDispatch();

  const handleKeywordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value as string);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    console.log(keyword);
    setKeyword('');
  };

  const handleNewChat = () => {
    setTogglePopup(false);
    dispatch(setNewChatModal('private'));
  };

  const handleNewGroup = () => {
    setTogglePopup(false);
    dispatch(setNewChatModal('group'));
  };

  useEffect(() => {
    const listener = window.conversation.onReadedMessage((res) => {
      dispatch(readConversation(res));
      console.log(res);
    });

    return listener;
  }, [dispatch]);

  useEffect(() => {
    const listener = window.conversation.onNewMessage((res) => {
      if (res.data?.message) {
        dispatch(
          updateConversationMessage({ message: res.data.message, userId })
        );
      }
    });

    return listener;
  }, [dispatch]);

  useEffect(() => {
    const listener = window.conversation.onCreateNewPrivateConversation(
      (res) => {
        console.log({ res });
        if (res.data && res.data.conversation) {
          dispatch(addNewConversation(res.data.conversation));
        }
      }
    );

    return listener;
  }, [dispatch]);

  useEffect(() => {
    const listener = window.conversation.onCreateGroupConversation((res) => {
      if (res.data && res.data.conversation) {
        dispatch(addNewConversation(res.data.conversation));
      }
    });

    return listener;
  }, [dispatch]);

  return (
    <div
      className={cx('w-[360px] h-screen', 'pt-9 pb-10', 'bg-[#F8FAFF] shadow')}
    >
      <div
        className={cx('w-full flex justify-between items-center px-4 relative')}
      >
        <h1 className={cx('text-3xl text-black font-bold')}>Chats</h1>
        <button
          className="text-[#676667] hover:text-primary"
          onClick={setTogglePopup.bind(this, !togglePopup)}
        >
          <i className={cx('ico-circle-dashed', 'text-icon')} />
        </button>
        <AnimatePresence>
          {togglePopup && (
            <motion.div
              initial={{ opacity: 0, originX: 1, originY: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0 }}
              className={cx(
                'absolute top-full right-[20px] bg-white shadow-lg z-30 rounded-lg overflow-hidden',
                'flex flex-col'
              )}
            >
              <button
                className={cx(
                  'px-6 py-3 leading-[22px] text-left font-semibold hover:bg-indigo-200 transition-colors'
                )}
                onClick={handleNewChat}
              >
                Tin nhắn mới
              </button>
              <button
                className={cx(
                  'px-6 py-3 leading-[22px] text-left font-semibold hover:bg-indigo-200 transition-colors'
                )}
                onClick={handleNewGroup}
              >
                Nhóm mới
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={cx('mt-7 w-full relative px-4')}>
        <label
          className={cx(
            'absolute top-1/2 left-8 -translate-y-1/2 text-[#709CE6]'
          )}
          htmlFor="search"
        >
          <i className="ico-search text-icon block" />
        </label>
        <form onSubmit={handleSearch}>
          <input
            className={cx(
              'w-full bg-[#EAF2FE] px-[54px] py-[12px] rounded-3xl',
              'text-[#709CE6] leading-[22px] font-semibold',
              'focus:font-medium focus:outline-cyan-800'
            )}
            type="text"
            id="search"
            value={keyword}
            onChange={handleKeywordChange}
            placeholder="Search"
          />
        </form>
      </div>

      <div className={cx('mt-8 pl-4 ')}>
        <p className={cx('leading-[22px] font-bold text-[#676667]')}>
          All chats
        </p>
        <div
          className={cx(
            'w-full max-h-[calc(100vh-240px)] mt-3 pr-3',
            'overflow-x-hidden overflow-y-auto',
            'flex flex-col items-stretch gap-3'
          )}
        >
          {conversations.map((item) => (
            <ConversationItem
              key={item._id}
              conversation={item}
              selected={item._id === selectedConvId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
