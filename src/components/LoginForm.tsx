import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, TextField, Box, Typography, Paper } from '@mui/material';
import { loginRequest } from '../features/authSlice';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginRequest({ username, password }));
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, width: 300 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Đăng nhập
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Tên đăng nhập"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Mật khẩu"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Đăng nhập
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;