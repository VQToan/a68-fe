import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { store } from '@features/store';
import routes from '@routes/index';
import AuthGuard from '@components/AuthGuard';
import './App.css';

function App() {
  const router = createBrowserRouter(routes);

  return (
    <Provider store={store}>
      <AuthGuard>
        <RouterProvider router={router} />
      </AuthGuard>
    </Provider>
  );
}

export default App;
