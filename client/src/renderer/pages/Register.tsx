import cx from 'classnames';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from 'renderer/hooks/use-app-dispatch';
import { setUser } from 'renderer/store/slices/global';
import { routers } from '../routers';

const Register = () => {
  const [error, setError] = useState('');
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    window.auth.register(registerData);
  };

  useEffect(() => {
    const subcriber = window.auth.onRegisterResponse((res) => {
      if (res.success) {
        setError('');
        dispatch(setUser(res.data?.user));
        window.localStorage.setItem('token', res.data?.accessToken ?? '');
        navigate(routers.home);
        toast.success('Tạo tài khoản thành công!');
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
        Đăng ký
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
              autoFocus
              value={registerData.username}
              onChange={handleFormChange}
              min={3}
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
              value={registerData.password}
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
              Tạo tài khoản
            </button>
          </div>
        </form>
        <div className="mt-12 text-sm font-display font-semibold text-gray-700 text-center">
          Đã có tài khoản?{' '}
          <Link
            to={routers.login}
            className="cursor-pointer text-indigo-600 hover:text-indigo-800"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
