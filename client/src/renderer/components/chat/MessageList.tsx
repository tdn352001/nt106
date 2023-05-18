import cx from 'classnames';
import { useEffect, useRef } from 'react';
import MessageItem from 'renderer/components/chat/MessageItem';
import { useShallowEqualSelector } from 'renderer/hooks/use-app-selector';
import { conversationMessageSelector } from 'renderer/store/slices/conversation';

interface MessageListProps {}

const MessageList = ({}: MessageListProps) => {
  const messages = useShallowEqualSelector(conversationMessageSelector);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollBehavior = useRef<ScrollBehavior>('auto');

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'auto',
      });

      if (scrollBehavior.current === 'auto') {
        scrollBehavior.current = 'smooth';
      }
    }
  }, [messages]);

  return (
    <div
      id="id1"
      ref={containerRef}
      className={cx('flex-1 w-full py-4 overflow-auto bg-[#F0F4FA]')}
    >
      {messages.length > 0 ? (
        <div
          id="id2"
          className={cx(
            'w-full min-h-full flex flex-col-reverse gap-3 justify-end px-4'
          )}
        >
          {messages.map((item) => (
            <MessageItem key={item._id} message={item} />
          ))}
        </div>
      ) : (
        <div>
          <p>No message founded</p>
        </div>
      )}
    </div>
  );
};

export default MessageList;
