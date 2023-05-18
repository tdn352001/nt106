import { debounce } from 'lodash';
import { ConnectState } from 'main/chat-client/types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import ConnectErrorModal from 'renderer/components/ConnectErrorModal';
import { setConnectState } from 'renderer/store/slices/global';

const GlobalLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const debounced = debounce((state: ConnectState) => {
      if (state !== ConnectState.CONNECTED) {
        toast.error('Kết nối máy chủ thất bại');
      }
    }, 200);

    window.server.getConnectState().then((state) => {
      dispatch(setConnectState(state));
      if (state === ConnectState.CONNECTED) {
        window.auth.checkAuth();
      }
    });

    const connectChangeListener = window.server.onConnectChange((state) => {
      dispatch(setConnectState(state));
      debounced(state);
    });

    return () => {
      connectChangeListener();
      debounced.cancel();
    };
  }, [dispatch]);

  return (
    <>
      <Outlet />
      <ToastContainer pauseOnHover={false} pauseOnFocusLoss={false} />
      <ConnectErrorModal />
    </>
  );
};

export default GlobalLayout;
