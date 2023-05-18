import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'renderer/hooks/use-app-dispatch';
import { routers } from 'renderer/routers';
import { setUser } from 'renderer/store/slices/global';
import Logo from '../common/Logo';
import LoginBanner from '../common/svg/AuthBanner';

const AuthLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const listener = window.auth.onCheckAuthResponse((res) => {
      const user = res.data?.user;
      if (user) {
        dispatch(setUser(user));
        console.log(user);
        navigate(routers.home);
      }
    });

    return listener;
  }, [dispatch]);

  return (
    <div>
      <div className="lg:flex">
        <div className="lg:w-1/2 xl:max-w-screen-sm">
          <div className="py-12 bg-indigo-100 lg:bg-white flex justify-center lg:justify-start lg:px-12">
            <Logo />
          </div>
          <Outlet />
        </div>
        <div className="hidden lg:flex items-center justify-center bg-indigo-100 flex-1 h-screen">
          <div className="max-w-xs transform duration-200 hover:scale-110 cursor-pointer">
            <LoginBanner />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
