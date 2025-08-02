import { createContext, useState, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';

// Define notification item type
interface NotificationItem {
  id: string;
  message: string;
  severity: AlertColor;
  open: boolean;
}

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
  // State for notifications stack
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Show notification
  const showNotification = useCallback((message: string, severity: AlertColor) => {
    const id = Date.now().toString() + Math.random().toString();
    const newNotification: NotificationItem = {
      id,
      message,
      severity,
      open: true
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-hide this specific notification after 6 seconds
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, open: false }
            : notification
        )
      );
      
      // Remove notification after animation
      setTimeout(() => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }, 300);
    }, 6000);
  }, []);

  // Close notification
  const handleCloseNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, open: false }
          : notification
      )
    );
    
    // Remove notification after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 300);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Global Notification Components Stack */}
      {notifications.map((notification, index) => (
        <Snackbar 
          key={notification.id}
          open={notification.open} 
          onClose={() => handleCloseNotification(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          style={{
            bottom: 20 + (index * 70), // Stack notifications vertically
          }}
        >
          <Alert 
            onClose={() => handleCloseNotification(notification.id)} 
            severity={notification.severity}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
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