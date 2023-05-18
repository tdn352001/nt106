import cx from 'classnames';
import { Message, MessageType } from 'main/chat-client/types';
import moment from 'moment';
import { staticServer } from 'renderer/configs/contants';
import { useAppSelector } from 'renderer/hooks/use-app-selector';
import { userIdSelector } from 'renderer/store/slices/global';

interface MesssageItemProps {
  message: Message;
}

const MessageItem = ({ message }: MesssageItemProps) => {
  const userId = useAppSelector(userIdSelector);

  const isOwner = (function () {
    const senderId = message.sender._id;

    return userId === senderId;
  })();

  const sendAt = (function () {
    const now = moment();
    const messageTime = moment(message.createdAt);

    return now.diff(messageTime, 'days') === 0
      ? messageTime.format('h:mm A')
      : messageTime.format('MMM DD');
  })();

  return (
    <div
      className={cx('w-auto max-w-[500px]', {
        'self-end': isOwner,
        'self-start': !isOwner,
      })}
    >
      <div>
        {message.type === MessageType.IMAGE ? (
          <img
            className={cx('w-auto max-w-[400px] h-auto rounded-lg shadow-md')}
            src={`${staticServer}${message.content}`}
          />
        ) : (
          <>
            {message.type === MessageType.VIDEO ? (
              <>
                <video
                  className={cx(
                    'w-auto max-w-[400px] h-auto rounded-lg shadow-md'
                  )}
                  controls
                  muted
                  src={`${staticServer}${message.content}`}
                />
              </>
            ) : (
              <p
                className={cx('px-6 py-3 rounded-2xl font-medium shadow-sm', {
                  'bg-[#5B96F7] text-white': isOwner,
                  'bg-white text-black': !isOwner,
                })}
              >
                {message.content}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
