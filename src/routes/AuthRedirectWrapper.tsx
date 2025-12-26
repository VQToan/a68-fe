import { memo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Box, CircularProgress } from "@mui/material";

interface AuthRedirectWrapperProps {
  children: React.ReactNode;
}

/**
 * Component that prevents authenticated users from accessing auth pages
 * like login and register by redirecting them to the dashboard
 */
const AuthRedirectWrapper: React.FC<AuthRedirectWrapperProps> = ({
  children,
}) => {
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

  // If user is already logged in, redirect to dashboard
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the children (login or register page)
  return <>{children}</>;
};

export default memo(AuthRedirectWrapper);
