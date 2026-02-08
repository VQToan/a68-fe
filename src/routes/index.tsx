import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AuthRedirectWrapper from "./AuthRedirectWrapper";

// Import your pages here
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import ModuleBot from "../pages/ModuleBot";
import Backtest from "../pages/Backtest";
import BotTemplate from "../pages/BotTemplate";
import TradingTemplate from "../pages/TradingTemplate";
import UserManagement from "../pages/UserManagement";
import Trading from "../pages/Trading";
import TradingAccount from "../pages/TradingAccount";
import TradingAccountDetail from "../pages/TradingAccount/TradingAccountDetail";
import TradingProcessDetail from "../pages/Trading/TradingProcessDetail";
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
  // Verification and password reset routes (accessible without auth)
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/forgot-password",
    element: (
      <AuthRedirectWrapper>
        <ForgotPassword />
      </AuthRedirectWrapper>
    ),
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  // Main routes with MainLayout
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Regular protected routes
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
            path: "backtest",
            element: <Backtest />,
            children: [
              {
                path: ":id",
                element: <BacktestResult />,
              },
            ],
          },
          {
            path: "trading",
            element: <Trading />,
          },
          {
            path: "trading-accounts",
            element: <TradingAccount />,
          },
          {
            path: "trading-account/:id",
            element: <TradingAccountDetail />,
          },
          {
            path: "trading-process/:id",
            element: <TradingProcessDetail />,
          },
          {
            path: "profile",
            element: <div>Profile Page (Coming Soon)</div>,
          },
          {
            path: "settings",
            element: <div>Settings Page (Coming Soon)</div>,
          },
        ],
      },
      // Admin-only routes
      {
        path: "/",
        element: <AdminRoute />,
        children: [
          {
            path: "module-bot",
            element: <ModuleBot />,
          },
          {
            path: "bot-template",
            element: <BotTemplate />,
          },
          {
            path: "trading-template",
            element: <TradingTemplate />,
          },
          {
            path: "user-management",
            element: <UserManagement />,
          },
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
