import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import { logout } from '../features/authSlice';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography paragraph>
        Chào mừng bạn đến với bảng điều khiển. Bạn đã đăng nhập thành công!
      </Typography>
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={handleLogout}
      >
        Đăng xuất
      </Button>
    </Box>
  );
};

export default Dashboard;