import { 
  Box, 
  Typography, 
  Grid,
  Card, 
  CardContent, 
  Divider
} from '@mui/material';
import { useAuth } from '@hooks/useAuth';
import { memo } from 'react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Welcome to your secure dashboard. This page is only accessible to authenticated users.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', width: '100px' }}>
                    Email:
                  </Typography>
                  <Typography variant="body1">
                    {user?.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', width: '100px' }}>
                    Name:
                  </Typography>
                  <Typography variant="body1">
                    {user?.full_name || 'Not provided'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', width: '100px' }}>
                    User ID:
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {user?._id}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', width: '100px' }}>
                    Created:
                  </Typography>
                  <Typography variant="body1">
                    {user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                  </Typography>
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
                You are currently authenticated with JWT access token and refresh token.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your session is secured and will automatically refresh when needed.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(Dashboard);