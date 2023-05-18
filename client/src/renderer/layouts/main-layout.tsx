import cx from 'classnames';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from 'renderer/components/Sidebar';
import Tabs from 'renderer/components/Tabs';
import NewChat from 'renderer/components/new-chat/NewChat';
import { useAppDispatch } from 'renderer/hooks/use-app-dispatch';
import { routers } from 'renderer/routers';
import { setConversation } from 'renderer/store/slices/conversation';
import { setUser } from 'renderer/store/slices/global';

const MainLayout = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    const listener = window.auth.onCheckAuthResponse((res) => {
      console.log('Hello');
      window.conversation.getConversations();
      const user = res.data?.user;
      if (!user) {
        dispatch(setUser(undefined));
        navigate(routers.login);
        toast.warn('Vui lòng đăng nhập lại!');
      }
    });

    return listener;
  }, [dispatch]);

  useEffect(() => {
    window.conversation.getConversations();
    const listener = window.conversation.onGetConversationsResponse((res) => {
      const conversations = res.data?.conversations;
      console.log(res);
      if (conversations) {
        dispatch(setConversation(conversations));
      }
    });

    return () => {
      listener();
    };
  }, []);

  return (
    <div className={cx('w-screen h-screen', 'flex font-manrope')}>
      <Tabs />
      <Sidebar />
      <div className={cx('flex-1 h-full')}>
        <Outlet />
      </div>
      <NewChat />
    </div>
  );
};

export default MainLayout;
