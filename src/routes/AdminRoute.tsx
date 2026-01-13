import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { memo } from "react";
import { Box, Typography } from "@mui/material";
import { PageSkeleton } from "@components/skeletons";

/**
 * Component that protects routes for admin/superadmin users only.
 * Non-admin users will be shown an access denied message.
 */
export const AdminRoute = () => {
  const location = useLocation();
  const { isLoggedIn, isAdmin, isInitializing } = useAuth();

  // Show loading while checking auth session
  if (isInitializing) {
    return <PageSkeleton />;
  }

  // Not logged in - redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but not admin - show access denied
  if (!isAdmin) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          gap: 2,
        }}
      >
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access this page.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Only administrators can view this content.
        </Typography>
      </Box>
    );
  }

  return <Outlet />;
};

export default memo(AdminRoute);
