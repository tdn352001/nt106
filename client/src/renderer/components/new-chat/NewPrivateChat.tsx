import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { User } from 'main/chat-client/types';
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useState,
} from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Images } from 'renderer/assets/images';
import { useAppDispatch } from 'renderer/hooks/use-app-dispatch';
import { setSelectedConversation } from 'renderer/store/slices/conversation';
import { setNewChatModal } from 'renderer/store/slices/global';
import { useDebouncedCallback } from 'use-debounce';

const NewPrivateChat = () => {
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [isFocus, setIsFocus] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const dispatch = useAppDispatch();

  const handleKeywordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value as string;
    setKeyword(keyword);
    if (keyword) {
      search();
    } else {
      setUsers([]);
    }
  };

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const message = e.target.value;
    setMessage(message);

    if (!keyword) {
    }
  };

  const handleSetSelectedUser = (user: User) => {
    setSelectedUser(user);
    setUsers([]);
    setKeyword('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    search();
  };

  const search = useDebouncedCallback(() => {
    window.conversation.findUsers(keyword);
  }, 1000);

  const handleCreateNewConversation = () => {
    window.conversation.createNewPrivateConversation({
      content: message,
      receiverId: selectedUser?._id ?? '',
    });
  };

  const handleCloseModal = () => {
    dispatch(setNewChatModal(undefined));
  };

  useEffect(() => {
    const findUsersReponseListener = window.conversation.onFindUsersReponse(
      (res) => {
        if (res.data) {
          setUsers(res.data.users);
        }
        console.log(res);
      }
    );

    return findUsersReponseListener;
  }, []);

  useEffect(() => {
    const createNewPrivateConversationListener =
      window.conversation.onCreateNewPrivateConversation((res) => {
        console.log(res);
        if (res.data) {
          if (res.data.receiverId === selectedUser?._id) {
            let conversationId = '';

            if (res.data.conversationId) {
              conversationId = res.data.conversationId;
            } else if (res.data.conversation) {
              conversationId = res.data.conversation._id;
            }

            if (conversationId) {
              dispatch(setNewChatModal(undefined));
              setTimeout(() => {
                dispatch(setSelectedConversation(conversationId));
              }, 200);
            }
          }
        }
      });

    return createNewPrivateConversationListener;
  }, [selectedUser, dispatch]);

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.6,
      }}
      className={cx(
        'fixed inset-0 bg-black/75 z-50 p-16 flex items-center justify-center'
      )}
    >
      <div
        className={cx(
          'w-full max-w-[400px] p-6 bg-white rounded-xl',
          'flex flex-col items-center relative'
        )}
      >
        <button
          className={cx('absolute top-4 right-4')}
          onClick={handleCloseModal}
        >
          Close
        </button>
        <h1 className="text-3xl text-indigo-400 font-bold">Tin nhắn mới</h1>
        <div className={cx('min-h-[50px] w-full mt-7 ')}>
          {selectedUser ? (
            <div
              className={cx('flex items-center gap-1')}
              onClick={setSelectedUser.bind(this, undefined)}
            >
              <p className={cx('font-bold')}>Gửi tới:</p>
              <div
                className={cx(
                  'flex items-center py-1 pl-2 pr-6 gap-4 cursor-pointer',
                  'transition-colors bg-black/20 rounded-full'
                )}
              >
                <img
                  className={cx('w-8 h-8 object-center rounded-full')}
                  src={selectedUser.thumbnail ?? Images.userJpg}
                />
                <p className={cx('font-bold text-[14px]')}>
                  {selectedUser.username}
                </p>
              </div>
            </div>
          ) : (
            <div className={cx('w-full relative')}>
              <label
                className={cx(
                  'absolute top-1/2 left-4 -translate-y-1/2 text-[#709CE6]'
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
                  onFocus={setIsFocus.bind(this, true)}
                  onBlur={setIsFocus.bind(this, false)}
                  onChange={handleKeywordChange}
                  placeholder="Tìm người dùng"
                />
              </form>
              <AnimatePresence>
                {isFocus && keyword && (
                  <div
                    className={cx(
                      'absolute top-full left-0 z-20 w-full shadow-result mt-2 overflow-hidden bg-white rounded-lg'
                    )}
                  >
                    {users && users.length > 0 ? (
                      <div
                        className={cx(
                          'w-full h-auto max-h-[400px] overflow-auto'
                        )}
                      >
                        {users.map((item) => (
                          <div
                            key={item._id}
                            className={cx(
                              'flex items-center py-1 px-4 gap-4 cursor-pointer',
                              'transition-colors hover:bg-indigo-500/50'
                            )}
                            onMouseDown={handleSetSelectedUser.bind(this, item)}
                          >
                            <img
                              className={cx(
                                'w-12 h-12 object-center rounded-full'
                              )}
                              src={item.thumbnail ?? Images.userJpg}
                            />
                            <p className={cx('font-bold')}>{item.username}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={cx('p-4 ')}>
                        <p className={cx('font-bold text-indigo-500')}>
                          Không tìm thấy users
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className={cx('w-full mt-8')}>
          <TextareaAutosize
            className={cx(
              'w-full min-h-[200px]  bg-[#EAF2FE] px-4 py-4 rounded-3xl',
              'text-[#709CE6] leading-[22px] font-semibold',
              'focus:font-medium focus:outline-none resize-none'
            )}
            placeholder="Type a message..."
            onKeyDown={handleKeyDown}
            maxRows={6}
            rows={4}
            value={message}
            onChange={handleMessageChange}
          />
        </div>

        <button
          className={cx(
            'bg-indigo-500 text-gray-100 p-3 mt-8 w-full rounded-full tracking-wide font-semibold font-display',
            'focus:outline-none focus:shadow-outline hover:bg-indigo-600 shadow-lg',
            'disabled:bg-black/40'
          )}
          disabled={!selectedUser || !message}
          onClick={handleCreateNewConversation}
        >
          Gửi
        </button>
      </div>
    </motion.div>
  );
};

export default NewPrivateChat;
