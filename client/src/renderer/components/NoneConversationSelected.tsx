import cx from 'classnames';
import { Images } from 'renderer/assets/images';

const NoneConversationSelected = () => {
  return (
    <div
      className={cx(
        'w-full h-screen flex flex-col items-center justify-center gap-[48px]'
      )}
    >
      <img className={cx('w-[200px]')} src={Images.callServicePng} />
      <div className="flex items-center justify-center w-full">
        <p className={cx('leading-[22px] font-bold text-black')}>
          Select a conversation or start a&nbsp;
        </p>
        <button className={cx('leading-[22px] font-bold text-primary')}>
          new one
        </button>
      </div>
    </div>
  );
};

export default NoneConversationSelected;
