import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { memo } from "react";
import { Box, CircularProgress } from "@mui/material";

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
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default memo(ProtectedRoute);
