import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Import your pages here
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ModuleBot from '../pages/ModuleBot';
import Backtest from '../pages/Backtest';
import NotFound from '../pages/NotFound';
import MainLayout from '../layouts/MainLayout';

export const routes: RouteObject[] = [
  // Auth routes without MainLayout
  {
    path: 'login',
    element: <Login />
  },
  {
    path: 'register',
    element: <Register />
  },
  // Main routes with MainLayout
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // All routes inside MainLayout are now protected
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            index: true, // This makes it the default route at '/'
            element: <Home />
          },
          {
            path: 'dashboard',
            element: <Dashboard />
          },
          {
            path: 'module-bot',
            element: <ModuleBot />
          },
          {
            path: 'backtest',
            element: <Backtest />
          },
          {
            path: 'profile',
            element: <div>Profile Page (Coming Soon)</div>
          },
          {
            path: 'settings',
            element: <div>Settings Page (Coming Soon)</div>
          }
          // Add more protected routes here
        ]
      },
      // Only NotFound is still accessible without login
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];

export default routes;