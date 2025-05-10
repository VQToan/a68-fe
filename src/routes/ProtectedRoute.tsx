import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { memo } from "react";
import { areEqual } from "@/utils/common";

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute = ({
  redirectPath = "/login",
}: ProtectedRouteProps) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default memo(ProtectedRoute, areEqual);
