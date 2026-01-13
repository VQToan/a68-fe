import { memo } from "react";
import { Box, Card, CardContent, Skeleton, Grid } from "@mui/material";

interface CardSkeletonProps {
  count?: number;
  variant?: "horizontal" | "vertical";
  showTitle?: boolean;
}

/**
 * Skeleton component for card loading states.
 * Displays realistic card skeletons with animated placeholders.
 */
const CardSkeleton = ({
  count = 3,
  variant = "horizontal",
  showTitle = true,
}: CardSkeletonProps) => {
  if (variant === "vertical") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={`card-${index}`} variant="outlined">
            <CardContent>
              {showTitle && (
                <Skeleton
                  variant="text"
                  width="40%"
                  height={20}
                  animation="wave"
                  sx={{ mb: 1 }}
                />
              )}
              <Skeleton
                variant="text"
                width="70%"
                height={32}
                animation="wave"
              />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid size={{ xs: 12, md: 12 / count }} key={`card-${index}`}>
          <Card variant="outlined">
            <CardContent>
              {showTitle && (
                <Skeleton
                  variant="text"
                  width="60%"
                  height={18}
                  animation="wave"
                  sx={{ mb: 0.5 }}
                />
              )}
              <Skeleton
                variant="text"
                width="80%"
                height={28}
                animation="wave"
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default memo(CardSkeleton);
