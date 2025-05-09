import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './reduxHooks';
import { 
  login, 
  logout, 
  register, 
  fetchCurrentUser,
  updateCurrentUser
} from '@features/auth/authSlice';
import type { LoginCredentials, RegisterCredentials, UserUpdate } from '@types/auth.types';

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Handle login
  const handleLogin = (credentials: LoginCredentials) => {
    return dispatch(login(credentials));
  };

  // Handle register
  const handleRegister = (credentials: RegisterCredentials) => {
    return dispatch(register(credentials));
  };

  // Handle logout
  const handleLogout = () => {
    return dispatch(logout());
  };

  // Handle getting current user
  const handleGetCurrentUser = () => {
    return dispatch(fetchCurrentUser());
  };

  // Handle updating current user
  const handleUpdateCurrentUser = (userData: UserUpdate) => {
    return dispatch(updateCurrentUser(userData));
  };

  // Auto-fetch user data when logged in but no user data
  useEffect(() => {
    if (auth.isLoggedIn && !auth.user && !auth.isLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [auth.isLoggedIn, auth.user, auth.isLoading, dispatch]);

  return {
    ...auth,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    getCurrentUser: handleGetCurrentUser,
    updateCurrentUser: handleUpdateCurrentUser,
  };
};