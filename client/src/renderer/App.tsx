import { Provider } from 'react-redux';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import { store } from 'renderer/store';
import GlobalLayout from './layouts/global-layout';
import MainLayout from './layouts/main-layout';
import Home from './pages/Home';

import 'react-toastify/dist/ReactToastify.css';
import AuthLayout from 'renderer/layouts/auth-layout';
import Login from 'renderer/pages/Login';
import Register from 'renderer/pages/Register';
import { routers } from 'renderer/routers';
import 'tailwindcss/tailwind.css';
import './assets/styles/fonts.css';
import './assets/styles/icons.css';
import './assets/styles/scrollbar.css';

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="" element={<GlobalLayout />}>
            <Route element={<AuthLayout />}>
              <Route path={routers.login} element={<Login />} />
              <Route path={routers.register} element={<Register />} />
            </Route>

            <Route element={<MainLayout />}>
              <Route path={routers.home} element={<Home />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}
