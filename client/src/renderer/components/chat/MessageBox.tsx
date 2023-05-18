import cx from 'classnames';
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'react-toastify';
import { useAppSelector } from 'renderer/hooks/use-app-selector';
import { selectedConversationIdSelector } from 'renderer/store/slices/conversation';

const MessageBox = () => {
  const [message, setMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const conversationId = useAppSelector(selectedConversationIdSelector);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const message = e.target.value;
    setMessage(message);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message && message.trim()) {
      window.conversation.sendTextMessage({
        conversationId,
        content: message.trim(),
      });
      setMessage('');
    }
  };

  const handleSendFile = () => {
    window.conversation.sendFileMessage(conversationId).then(({ err }) => {
      if (err && err.message) {
        toast.error(err.message);
      }
    });
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div
      className={cx(
        'w-full px-4 py-2 flex items-center gap-4 bg-[#F7F9FD] shadow'
      )}
    >
      <button onClick={handleSendFile}>
        <i className={cx('ico-link text-icon block text-primary')} />
      </button>

      <form
        ref={formRef}
        className={cx('flex-1 flex items-center gap-4')}
        onSubmit={handleSubmit}
      >
        <div className={cx('flex-1 relative')}>
          <TextareaAutosize
            className={cx(
              'w-full  bg-[#EAF2FE] px-4 py-2 rounded-3xl',
              'text-[#709CE6] leading-[22px] font-semibold',
              'focus:font-medium focus:outline-none resize-none'
            )}
            ref={textareaRef}
            placeholder="Type a message..."
            onKeyDown={handleKeyDown}
            maxRows={3}
            value={message}
            onChange={handleOnChange}
          />
        </div>
        <button>
          <i className={cx('ico-telegram text-icon block text-primary')} />
        </button>
      </form>
    </div>
  );
};

export default MessageBox;
