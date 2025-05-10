import { createContext, useState, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';

// Define the notification context type
interface NotificationContextType {
  showNotification: (message: string, severity: AlertColor) => void;
}

// Create the notification context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification Provider props
interface NotificationProviderProps {
  children: ReactNode;
}

// Create the notification provider component
export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  // State for notification
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Show notification
  const showNotification = useCallback((message: string, severity: AlertColor) => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, [setNotification]);

  // Close notification
  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  }, [setNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Global Notification Component */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};