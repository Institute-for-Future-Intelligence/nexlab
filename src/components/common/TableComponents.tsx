// src/components/common/TableComponents.tsx
import React from 'react';
import {
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { colors, typography, spacing } from '../../config/designSystem';
import { Timestamp, FieldValue } from 'firebase/firestore';

// Common utility functions for table rendering
export const formatFirebaseTimestamp = (timestamp: any): string => {
  if (!timestamp) return 'N/A';

  // If timestamp is a Firestore Timestamp
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // If timestamp has seconds property (Firestore format)
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // If it's a regular Date
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return 'N/A';
};

// Full timestamp formatting with date and time
export const formatFirebaseTimestampFull = (timestamp: any): string => {
  if (!timestamp) return 'N/A';

  // If timestamp is a Firestore Timestamp
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // If timestamp has seconds property (Firestore format)
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // If it's a regular Date
  if (timestamp instanceof Date) {
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  return 'N/A';
};

// Avatar cell component
export const AvatarCell: React.FC<{
  title: string;
  subtitle?: string;
  onClick?: () => void;
}> = ({ title, subtitle, onClick }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
    <Avatar
      sx={{
        width: 40,
        height: 40,
        backgroundColor: colors.primary[100],
        color: colors.primary[700],
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
      }}
    >
      {title.charAt(0).toUpperCase()}
    </Avatar>
    <Box>
      <Typography
        variant="body1"
        sx={{
          fontFamily: typography.fontFamily.secondary,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? {
            color: colors.primary[600],
            textDecoration: 'underline',
          } : {},
        }}
        onClick={onClick}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

// Status chip component
export const StatusChip: React.FC<{
  label: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'small' | 'medium';
}> = ({ label, status, size = 'small' }) => {
  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return {
          backgroundColor: colors.secondary[100],
          color: colors.secondary[700],
        };
      case 'warning':
        return {
          backgroundColor: '#FEF3C7',
          color: '#D97706',
        };
      case 'error':
        return {
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
        };
      case 'info':
        return {
          backgroundColor: colors.primary[100],
          color: colors.primary[700],
        };
      default:
        return {
          backgroundColor: colors.neutral[100],
          color: colors.neutral[700],
        };
    }
  };

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        ...getStatusColors(),
        fontFamily: typography.fontFamily.secondary,
        fontWeight: typography.fontWeight.medium,
        fontSize: typography.fontSize.sm,
      }}
    />
  );
};

// User ID chip component
export const UserIdChip: React.FC<{
  userId: string;
  userType?: 'superAdmin' | 'educator' | 'student';
}> = ({ userId, userType = 'student' }) => {
  const getChipColor = () => {
    switch (userType) {
      case 'superAdmin':
        return {
          backgroundColor: colors.secondary[500],
          color: colors.text.inverse,
        };
      case 'educator':
        return {
          backgroundColor: colors.primary[500],
          color: colors.text.inverse,
        };
      default:
        return {
          backgroundColor: colors.neutral[200],
          color: colors.neutral[700],
        };
    }
  };

  return (
    <Chip
      label={userId}
      sx={{
        ...getChipColor(),
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        fontFamily: 'monospace',
        maxWidth: '200px',
      }}
    />
  );
};

// Course chip component
export const CourseChip: React.FC<{
  courseNumber: string;
  courseTitle?: string;
  isAdmin?: boolean;
}> = ({ courseNumber, courseTitle, isAdmin = false }) => {
  const chipColors = isAdmin 
    ? {
        backgroundColor: colors.primary[100],
        color: colors.primary[700],
      }
    : {
        backgroundColor: colors.neutral[200],
        color: colors.neutral[700],
      };

  return (
    <Tooltip title={courseTitle || courseNumber}>
      <Chip
        label={courseNumber}
        size="small"
        sx={{
          ...chipColors,
          fontFamily: typography.fontFamily.secondary,
          fontWeight: typography.fontWeight.medium,
          fontSize: typography.fontSize.sm,
        }}
      />
    </Tooltip>
  );
};

// Action buttons component
export const ActionButtons: React.FC<{
  actions: Array<{
    icon: React.ReactNode;
    tooltip: string;
    onClick: () => void;
    disabled?: boolean;
    color?: string;
    hoverColor?: string;
  }>;
}> = ({ actions }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', gap: spacing[1] }}>
    {actions.map((action, index) => (
      <Tooltip key={index} title={action.tooltip}>
        <span>
          <IconButton
            size="small"
            onClick={action.onClick}
            disabled={action.disabled}
            sx={{
              color: action.disabled ? colors.text.disabled : (action.color || colors.primary[600]),
              '&:hover': {
                backgroundColor: action.disabled 
                  ? 'transparent' 
                  : (action.hoverColor || colors.primary[100]),
              },
            }}
          >
            {action.icon}
          </IconButton>
        </span>
      </Tooltip>
    ))}
  </Box>
);

// Date cell component
export const DateCell: React.FC<{
  date: any;
  format?: 'short' | 'long' | 'full';
}> = ({ date, format = 'long' }) => (
  <Typography
    variant="body2"
    sx={{
      color: colors.text.secondary,
      fontSize: typography.fontSize.sm,
    }}
  >
    {format === 'short' 
      ? formatFirebaseTimestamp(date).split(',')[0] // Just the date part
      : format === 'full'
      ? formatFirebaseTimestampFull(date) // Full date and time
      : formatFirebaseTimestamp(date) // Just date
    }
  </Typography>
);

// Text cell component with truncation
export const TextCell: React.FC<{
  text: string;
  maxLength?: number;
  variant?: 'primary' | 'secondary' | 'monospace';
  weight?: 'normal' | 'medium' | 'semibold';
}> = ({ text, maxLength = 100, variant = 'primary', weight = 'normal' }) => {
  const truncatedText = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  
  const getTextStyles = () => {
    const base = {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight[weight],
    };

    switch (variant) {
      case 'secondary':
        return {
          ...base,
          color: colors.text.secondary,
        };
      case 'monospace':
        return {
          ...base,
          fontFamily: 'monospace',
          color: colors.text.secondary,
          wordBreak: 'break-all' as const,
        };
      default:
        return {
          ...base,
          color: colors.text.primary,
        };
    }
  };

  return (
    <Typography
      variant="body2"
      sx={getTextStyles()}
      title={text.length > maxLength ? text : undefined}
    >
      {truncatedText}
    </Typography>
  );
};

// Common action icon presets
export const CommonActionIcons = {
  edit: <EditIcon fontSize="small" />,
  delete: <DeleteIcon fontSize="small" />,
  view: <VisibilityIcon fontSize="small" />,
  add: <AddIcon fontSize="small" />,
  download: <DownloadIcon fontSize="small" />,
};
