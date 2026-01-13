import { memo } from "react";
import { Box, Skeleton, keyframes } from "@mui/material";

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

/**
 * Skeleton component for full page loading states (route guards).
 * Displays a sophisticated loading UI with logo placeholder and animation.
 */
const PageSkeleton = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        gap: 3,
        bgcolor: "background.default",
      }}
    >
      {/* Logo placeholder */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          animation: `${pulse} 2s ease-in-out infinite`,
        }}
      >
        <Skeleton
          variant="rounded"
          width={48}
          height={48}
          animation="wave"
          sx={{ borderRadius: 2 }}
        />
        <Box>
          <Skeleton variant="text" width={100} height={28} animation="wave" />
          <Skeleton variant="text" width={60} height={16} animation="wave" />
        </Box>
      </Box>

      {/* Loading bar */}
      <Box sx={{ width: 200, position: "relative" }}>
        <Skeleton
          variant="rounded"
          width="100%"
          height={4}
          animation="wave"
          sx={{ borderRadius: 2 }}
        />
      </Box>
    </Box>
  );
};

export default memo(PageSkeleton);
