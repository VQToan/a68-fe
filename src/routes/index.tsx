import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AuthRedirectWrapper from "./AuthRedirectWrapper";

// Import your pages here
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ModuleBot from "../pages/ModuleBot";
import Backtest from "../pages/Backtest";
import BotTemplate from "../pages/BotTemplate";
import Trading from "../pages/Trading";
import TradingAccount from "../pages/TradingAccount";
import NotFound from "../pages/NotFound";
import MainLayout from "../layouts/MainLayout";
import BacktestResult from "@/pages/Backtest/components/Result";

export const routes: RouteObject[] = [
  // Auth routes with redirect for authenticated users
  {
    path: "/login",
    element: (
      <AuthRedirectWrapper>
        <Login />
      </AuthRedirectWrapper>
    ),
  },
  {
    path: "/register",
    element: (
      <AuthRedirectWrapper>
        <Register />
      </AuthRedirectWrapper>
    ),
  },
  // Main routes with MainLayout
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // All routes inside MainLayout are now protected
      {
        path: "/",
        element: <ProtectedRoute />,
        children: [
          {
            index: true, // This makes it the default route at '/'
            element: <Home />,
          },
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "module-bot",
            element: <ModuleBot />,
          },
          {
            path: "bot-template",
            element: <BotTemplate />,
          },
          {
            path: "backtest",
            element: <Backtest />,
            children: [
              {
                path: "result/:id",
                element: <BacktestResult />,
              },
            ],
          },
          {
            path: "trading",
            element: <Trading />,
          },
          {
            path: "trading-account",
            element: <TradingAccount />,
          },
          {
            path: "profile",
            element: <div>Profile Page (Coming Soon)</div>,
          },
          {
            path: "settings",
            element: <div>Settings Page (Coming Soon)</div>,
          },
          // Add more protected routes here
        ],
      },
      // Only NotFound is still accessible without login
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

export default routes;
