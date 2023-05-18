import cx from 'classnames';
import { ConversationType } from 'main/chat-client/types';
import { useMemo } from 'react';
import { Images } from 'renderer/assets/images';
import {
  useAppSelector,
  useShallowEqualSelector,
} from 'renderer/hooks/use-app-selector';
import { conversationInfoSelector } from 'renderer/store/slices/conversation';
import { userIdSelector } from 'renderer/store/slices/global';

const ChatHeading = () => {
  const conversation = useShallowEqualSelector(conversationInfoSelector);
  const userId = useAppSelector(userIdSelector);

  const { name, thumbnail, isOnline } = useMemo(() => {
    let name = 'Conversation';
    let thumbnail: any = Images.userJpg;
    let isOnline = false;
    console.log({ conversation });

    if (conversation) {
      if (conversation.type === ConversationType.PRIVATE) {
        const otherUser = conversation.members.find(
          (member) => member._id != userId
        );
        if (otherUser) {
          name = otherUser.username;
          thumbnail = otherUser.thumbnail ?? thumbnail;
        }
      } else {
        name = conversation.name ?? `Bạn và ${conversation.members.length - 1}`;
      }

      isOnline = conversation.members.some(
        (member) => member._id !== userId && member.isOnline
      );
    }

    return {
      name,
      thumbnail,
      isOnline,
    };
  }, [conversation]);
  return (
    <div className="w-full flex items-center px-8 py-4 bg-[#F8FAFF] shadow">
      <div className={cx('w-12 h-12 relative flex-shrink-0')}>
        <img
          className={cx('w-full h-full object-center rounded-full')}
          src={thumbnail}
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

      <div className={cx('flex-1 px-4 max-w-[calc(100%-88px)]')}>
        <h3
          className={cx(
            'leading-[22px] font-bold',
            'w-full whitespace-nowrap text-ellipsis overflow-hidden text-black'
          )}
        >
          {name}
        </h3>
        <p
          className={cx(
            'text-sm font-medium mt-0.5 text-[#3a3a3a]',
            'w-full whitespace-nowrap text-ellipsis overflow-hidden'
          )}
        >
          {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>

      <div className={cx('flex items-center gap-4')}>
        <button
          className={cx(
            'text-24px text-primary hover:text-[#005ff8] transition-colors p-2 rounded-full'
          )}
        >
          <i className={cx('ico-video', 'text-[24px] leading-none block')} />
        </button>
        <button
          className={cx(
            'text-24px text-primary hover:text-[#005ff8] transition-colors p-2 rounded-full'
          )}
        >
          <i className={cx('ico-phone', 'text-[24px] leading-none block')} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeading;
