import React from 'react';
import { 
  Alert, 
  AlertTitle, 
  Button, 
  Box, 
  IconButton,
  Collapse,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNotificationStore } from '../../stores/notificationStore';

const GlobalNotifications: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        top: 16, 
        right: 16, 
        zIndex: 9999, 
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {notifications.map((notification) => (
        <Collapse
          key={notification.id}
          in={true}
          timeout={300}
        >
          <Paper elevation={6}>
            <Alert
              severity={notification.type}
              sx={{ 
                width: '100%',
                '& .MuiAlert-action': {
                  alignItems: 'flex-start',
                  padding: '4px 0 0 16px'
                }
              }}
              action={
                <IconButton
                  size="small"
                  onClick={() => removeNotification(notification.id)}
                  sx={{ color: 'inherit' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              {notification.title && (
                <AlertTitle sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {notification.title}
                </AlertTitle>
              )}
              {notification.message}
              
              {notification.actions && notification.actions.length > 0 && (
                <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {notification.actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      size="small"
                      variant={action.primary ? 'contained' : 'outlined'}
                      color={notification.type === 'error' ? 'error' : 'primary'}
                      onClick={() => {
                        action.action();
                        removeNotification(notification.id);
                      }}
                      sx={{ 
                        minWidth: 'auto',
                        fontSize: '0.75rem',
                        padding: '2px 8px'
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Box>
              )}
            </Alert>
          </Paper>
        </Collapse>
      ))}
    </Box>
  );
};

export default GlobalNotifications; 