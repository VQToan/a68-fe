import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useAuth } from "@hooks/useAuth";
import { memo } from "react";

const Dashboard = () => {
  const { cognitoUser } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Welcome to your secure dashboard. This page is only accessible to
        authenticated users.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex" }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", width: "120px" }}
                  >
                    Email:
                  </Typography>
                  <Typography variant="body1">
                    {cognitoUser?.email || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", width: "120px" }}
                  >
                    Name:
                  </Typography>
                  <Typography variant="body1">
                    {cognitoUser?.fullName || "Not provided"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", width: "120px" }}
                  >
                    User ID:
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                    {cognitoUser?.userId || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", width: "120px" }}
                  >
                    Email Verified:
                  </Typography>
                  {cognitoUser?.emailVerified ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Verified"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip label="Not Verified" color="warning" size="small" />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Authentication Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" paragraph>
                You are authenticated with AWS Cognito.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your session is secured and will automatically refresh when
                needed.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(Dashboard);
