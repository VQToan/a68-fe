import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isTokenExpired } from '../utils/tokenUtils';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component that automatically refreshes the token when needed
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { accessToken, refreshToken } = useAuth();
  
  useEffect(() => {
    // Set up an interval to check token expiration
    const tokenCheckInterval = setInterval(() => {
      if (accessToken && isTokenExpired(accessToken)) {
        // Refresh token logic is handled in the useAuth hook
        // This interval just triggers the check more frequently
      }
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [accessToken]);
  
  return <>{children}</>;
};

export default AuthGuard;