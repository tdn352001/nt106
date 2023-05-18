import cx from 'classnames';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setUser } from 'renderer/store/slices/global';
import { routers } from '../routers';

const Login = () => {
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    window.auth.login(loginData);
  };

  useEffect(() => {
    const subcriber = window.auth.onLoginResponse((res) => {
      if (res.success) {
        setError('');
        dispatch(setUser(res.data?.user));
        navigate(routers.home);
        toast.success('Đăng nhập thành công!');
      } else {
        setError(res.message);
      }
    });
    return subcriber;
  }, []);

  return (
    <div className="mt-10 px-12 sm:px-24 md:px-48 lg:px-12 lg:mt-16 xl:px-24 xl:max-w-2xl">
      <h2
        className={cx(
          'text-center text-4xl text-indigo-900 font-display font-semibold',
          'lg:text-left xl:text-5xl xl:text-bold'
        )}
      >
        Đăng nhập
      </h2>

      {error && (
        <div className="w-full py-3 bg-red-500 mt-8 rounded-lg">
          <p className="text-xl text-white font-medium text-center">
            Error: {error}
          </p>
        </div>
      )}

      <div className="mt-12">
        <form onSubmit={handleFormSubmit}>
          <div>
            <div className="text-sm font-bold text-gray-700 tracking-wide">
              Tên người dùng
            </div>
            <input
              className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
              name="username"
              value={loginData.username}
              onChange={handleFormChange}
              min={3}
              autoFocus
              required
              placeholder="Enter your username"
            />
          </div>
          <div className="mt-8">
            <div className="flex justify-between items-center">
              <div className="text-sm font-bold text-gray-700 tracking-wide">
                Mật khẩu
              </div>
            </div>
            <input
              className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleFormChange}
              required
              min={3}
              placeholder="Enter your password"
            />
          </div>
          <div className="mt-10">
            <button
              className={cx(
                'bg-indigo-500 text-gray-100 p-4 w-full rounded-full tracking-wide font-semibold font-display',
                'focus:outline-none focus:shadow-outline hover:bg-indigo-600 shadow-lg'
              )}
            >
              Đăng nhập
            </button>
          </div>
        </form>
        <div className="mt-12 text-sm font-display font-semibold text-gray-700 text-center">
          Chưa có tài khoản?{' '}
          <Link
            to={routers.register}
            className="cursor-pointer text-indigo-600 hover:text-indigo-800"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
