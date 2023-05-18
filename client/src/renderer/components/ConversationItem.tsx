import cx from 'classnames';
import {
  Conversation,
  ConversationType,
  MessageType,
} from 'main/chat-client/types';
import moment from 'moment';
import { memo } from 'react';
import { Images } from 'renderer/assets/images';
import { useAppDispatch } from 'renderer/hooks/use-app-dispatch';
import { useAppSelector } from 'renderer/hooks/use-app-selector';
import { setSelectedConversation } from 'renderer/store/slices/conversation';
import { userIdSelector } from 'renderer/store/slices/global';
interface ConversationItemProps {
  conversation: Conversation;
  selected: boolean;
}

const ConversationItem = ({
  conversation,
  selected,
}: ConversationItemProps) => {
  const userId = useAppSelector(userIdSelector);

  const dispatch = useAppDispatch();

  const conversationName = (function () {
    if (conversation.type === ConversationType.PRIVATE) {
      const otherUser = conversation.members.find(
        (member) => member._id !== userId
      );
      return otherUser?.username ?? 'Người dùng Chatty';
    }

    return conversation.name ?? `Bạn và ${conversation.members.length - 1}`;
  })();

  const message = (function () {
    const message = conversation.message;
    if (message.type === MessageType.IMAGE) {
      const sender =
        message.sender._id === userId ? 'Bạn' : message.sender.username;
      return `${sender} đã gửi một ảnh`;
    }

    if (message.type === MessageType.VIDEO) {
      const sender =
        message.sender._id === userId ? 'Bạn' : message.sender.username;
      return `${sender} đã gửi một video`;
    }

    return message.content;
  })();

  const isOnline = (function () {
    return conversation.members.some(
      (member) => member._id !== userId && member.isOnline
    );
  })();

  const sendAt = (function () {
    const now = moment();
    const messageTime = moment(conversation.message.createdAt);

    return now.diff(messageTime, 'days') === 0
      ? messageTime.format('h:mm A')
      : messageTime.format('MMM DD');
  })();

  const unreadCount = conversation.unreadMessages;

  const isOwner = (function () {
    const senderId = conversation.message.sender._id;
    return userId === senderId;
  })();

  const isReaded = conversation.message.readed.some(
    (item) => item._id !== userId
  );

  const handleSetSelectedConversation = () => {
    dispatch(setSelectedConversation(conversation._id));
  };

  return (
    <div
      className={cx(
        'w-full p-4 flex items-center rounded-2xl',
        'cursor-pointer transition-colors relative',
        {
          'bg-white hover:bg-[#EAF2FE]': !selected,
          'bg-[#5B96F7]': selected,
        }
      )}
      onClick={handleSetSelectedConversation}
    >
      <div className={cx('w-12 h-12 relative flex-shrink-0')}>
        <img
          className={cx('w-full h-full object-center rounded-full')}
          src={Images.userJpg}
        />

        {isOnline && (
          <div
            className={cx(
              'absolute right-1 bottom-0 ',
              'w-2.5 h-2.5 rounded-full bg-[#76D45E]'
            )}
          />
        )}
      </div>
      <div className={cx('flex-1 pl-4 pr-4 max-w-[calc(100%-88px)]')}>
        <h3
          className={cx(
            'leading-[22px] font-bold',
            'w-full whitespace-nowrap text-ellipsis overflow-hidden',
            {
              'text-white': selected,
              'text-[#030303]': !selected,
            }
          )}
        >
          {conversationName}
        </h3>
        <p
          className={cx(
            'text-sm font-medium mt-1',
            'w-full whitespace-nowrap text-ellipsis overflow-hidden',
            {
              'text-white': selected,
              'text-[#7C7C7D]': !selected && !unreadCount,
              'font-semibold text-[#030303]': !selected && unreadCount,
            }
          )}
        >
          {message}
        </p>
      </div>
      <div className={cx('self-start pt-2 min-w-[40px] text-right')}>
        <p
          className={cx('text-[12px] leading-[16px] font-medium ', {
            'text-white': selected,
            'text-[#686768]': !selected,
          })}
        >
          {sendAt}
        </p>
      </div>

      {!isOwner && unreadCount && !selected ? (
        <div
          className={cx(
            'w-4 h-4 bg-[#5B96F7] rounded-full absolute right-4 bottom-4'
          )}
        >
          <p
            className={cx(
              'font-semibold text-white text-[10px]',
              'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
            )}
          >
            {unreadCount < 10 ? unreadCount : '9+'}
          </p>
        </div>
      ) : null}

      {isOwner && isReaded ? (
        <div className={cx('w-4 h-4 absolute right-4 bottom-4')}>
          <img
            className={cx('w-full h-full object-center rounded-full')}
            src={Images.userJpg}
          />
        </div>
      ) : null}
    </div>
  );
};

export default memo(ConversationItem);
