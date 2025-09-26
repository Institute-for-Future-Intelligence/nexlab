// src/components/common/UserStatusChip.tsx
import React from 'react';
import { Chip } from '@mui/material';
import { colors, typography } from '../../config/designSystem';

export type UserStatus = 'superAdmin' | 'educator' | 'student';

interface UserStatusChipProps {
  status: UserStatus;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

const UserStatusChip: React.FC<UserStatusChipProps> = ({
  status,
  size = 'small',
  variant = 'filled',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'superAdmin':
        return {
          label: 'Super Admin',
          color: variant === 'filled' 
            ? {
                backgroundColor: colors.success,
                color: colors.text.inverse,
                borderColor: colors.success,
              }
            : {
                backgroundColor: 'transparent',
                color: colors.success,
                borderColor: colors.success,
              },
        };
      case 'educator':
        return {
          label: 'Educator',
          color: variant === 'filled'
            ? {
                backgroundColor: colors.primary[500],
                color: colors.text.inverse,
                borderColor: colors.primary[500],
              }
            : {
                backgroundColor: 'transparent',
                color: colors.primary[500],
                borderColor: colors.primary[500],
              },
        };
      case 'student':
        return {
          label: 'Student',
          color: variant === 'filled'
            ? {
                backgroundColor: colors.neutral[400],
                color: colors.text.inverse,
                borderColor: colors.neutral[400],
              }
            : {
                backgroundColor: 'transparent',
                color: colors.neutral[600],
                borderColor: colors.neutral[400],
              },
        };
      default:
        return {
          label: 'Unknown',
          color: {
            backgroundColor: colors.neutral[200],
            color: colors.neutral[700],
            borderColor: colors.neutral[300],
          },
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      label={config.label}
      size={size}
      variant={variant === 'outlined' ? 'outlined' : 'filled'}
      sx={{
        ...config.color,
        fontFamily: typography.fontFamily.secondary,
        fontWeight: typography.fontWeight.medium,
        fontSize: size === 'small' ? typography.fontSize.xs : typography.fontSize.sm,
        border: `1px solid ${config.color.borderColor}`,
        '&:hover': {
          backgroundColor: variant === 'filled' 
            ? config.color.backgroundColor 
            : `${config.color.borderColor}10`,
        },
      }}
    />
  );
};

export default UserStatusChip;
