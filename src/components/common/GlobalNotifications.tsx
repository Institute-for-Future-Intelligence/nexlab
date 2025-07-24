import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { useNotificationStore, NotificationSeverity } from '../../stores/notificationStore';

const GlobalNotifications: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  const handleClose = (notificationId: string) => {
    removeNotification(notificationId);
  };

  const getMuiSeverity = (severity: NotificationSeverity): AlertColor => {
    // Map our notification severity to MUI Alert severity
    const severityMap: Record<NotificationSeverity, AlertColor> = {
      success: 'success',
      error: 'error', 
      warning: 'warning',
      info: 'info'
    };
    return severityMap[severity];
  };

  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ 
            vertical: 'bottom', 
            horizontal: 'right' 
          }}
          style={{
            // Stack multiple notifications
            bottom: 16 + (notifications.length - index - 1) * 70
          }}
          onClose={() => handleClose(notification.id)}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={getMuiSeverity(notification.severity)}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default GlobalNotifications; 