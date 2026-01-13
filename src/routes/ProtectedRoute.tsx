import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { memo } from "react";
import { PageSkeleton } from "@components/skeletons";

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute = ({
  redirectPath = "/login",
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isLoggedIn, isInitializing } = useAuth();

  // Show loading while checking auth session
  if (isInitializing) {
    return <PageSkeleton />;
  }

  if (!isLoggedIn) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default memo(ProtectedRoute);
