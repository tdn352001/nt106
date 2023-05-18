import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { ConnectState } from 'main/chat-client/types';
import { Videos } from 'renderer/assets/videos';
import Button from 'renderer/common/Button';
import { useAppSelector } from 'renderer/hooks/use-app-selector';
import { connectStateSelector } from 'renderer/store/slices/global';

const ConnectErrorModal = () => {
  const connectState = useAppSelector(connectStateSelector);

  const handleReconnect = () => {
    window.server.reconnect();
  };
  return (
    <AnimatePresence>
      {connectState !== ConnectState.CONNECTED && (
        <motion.div
          initial={{
            opacity: 0,
            // translateX: '-100%',
          }}
          animate={{
            opacity: 1,
            // translateX: '0%',
          }}
          exit={{
            opacity: 0,
            // translateX: '-100%',
          }}
          transition={{
            duration: 0.6,
          }}
          className={cx(
            'fixed inset-0 bg-black/75 p-16 flex items-center justify-center'
          )}
        >
          <div
            className={cx(
              'w-full h-full max-w-[800px] p-6 bg-white rounded-xl',
              'flex flex-col items-center'
            )}
          >
            <video
              className={cx('w-[300px]')}
              src={Videos.connectErrorMp4}
              autoPlay
              muted
              loop
            />
            <h1 className={cx('text-2xl text-black font-bold')}>
              Không thể kết nối tới máy chủ
            </h1>
            <p
              className={cx(
                'text-lg text-black/90 font-medium text-center max-w-[440px] mt-2'
              )}
            >
              Oops! Kết nối đến máy chủ thất bại. Vui lòng kiểm tra kết nối mạng
              và thử lại.
            </p>

            <Button className="mt-6" onClick={handleReconnect}>
              Kết nối lại
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectErrorModal;
