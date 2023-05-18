import cx from 'classnames';
import LogoSVG from 'renderer/common/svg/Logo';

import { useAppDispatch } from 'renderer/hooks/use-app-dispatch';
import { useAppSelector } from 'renderer/hooks/use-app-selector';
import {
  selectedTabSelector,
  setSelectedTab,
} from 'renderer/store/slices/global';

const tabs = ['ico-message', 'ico-users', 'ico-phone', 'ico-settins'];

const Tabs = () => {
  const selectedTab = useAppSelector(selectedTabSelector);

  const dispatch = useAppDispatch();

  const handleSelectedTabChange = (index: number) => {
    dispatch(setSelectedTab(index));
  };

  return (
    <div
      className={cx('flex flex-col gap-10', 'px-3 py-8', 'bg-[#F0F4FA] shadow')}
    >
      <LogoSVG className="block w-12 text-[#afbbf7]" />
      {tabs.map((item, index) => (
        <button
          key={index}
          className={cx(
            'w-12 h-12 flex items-center justify-center',
            'rounded-xl transition-colors',
            {
              'text-white bg-[#5B96F7]': index === selectedTab,
              'text-[#080707] hover:text-white hover:bg-[#8eb1eb]':
                index !== selectedTab,
            }
          )}
          onClick={handleSelectedTabChange.bind(this, index)}
        >
          <i className={cx(item, 'text-icon')} />
        </button>
      ))}
    </div>
  );
};

export default Tabs;
