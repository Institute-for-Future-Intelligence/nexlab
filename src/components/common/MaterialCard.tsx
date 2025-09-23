// src/components/common/MaterialCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Tooltip,
  Fade,
  Skeleton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Publish as PublishIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Material } from '../../types/Material';
import { designSystemTheme } from '../../config/designSystem';

interface MaterialCardProps {
  material: Material;
  isCourseAdmin?: boolean;
  loading?: boolean;
  onView?: (materialId: string) => void;
  onEdit?: (materialId: string) => void;
  onDelete?: (materialId: string) => void;
  onUnpublish?: (materialId: string) => void;
  className?: string;
}

const getDateInfo = (material: Material): string => {
  const now = new Date();
  
  // If material is scheduled, show scheduled date
  if (material.scheduledTimestamp) {
    const scheduledDate = material.scheduledTimestamp.toDate();
    const isScheduledForFuture = scheduledDate > now;
    
    if (isScheduledForFuture) {
      return `Scheduled for ${scheduledDate.toLocaleDateString()}`;
    } else {
      return `Scheduled ${scheduledDate.toLocaleDateString()}`;
    }
  }
  
  // If material is published, show published date
  if (material.published) {
    const publishedDate = material.timestamp.toDate();
    const daysDiff = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      return 'Published today';
    } else if (daysDiff === 1) {
      return 'Published yesterday';
    } else if (daysDiff < 7) {
      return `Published ${daysDiff} days ago`;
    } else if (daysDiff < 30) {
      const weeks = Math.floor(daysDiff / 7);
      return `Published ${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return `Published ${publishedDate.toLocaleDateString()}`;
    }
  }
  
  // If it's a draft, show created date
  const createdDate = material.timestamp.toDate();
  const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    return 'Created today';
  } else if (daysDiff === 1) {
    return 'Created yesterday';
  } else if (daysDiff < 7) {
    return `Created ${daysDiff} days ago`;
  } else if (daysDiff < 30) {
    const weeks = Math.floor(daysDiff / 7);
    return `Created ${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    return `Created ${createdDate.toLocaleDateString()}`;
  }
};

const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  isCourseAdmin = false,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onUnpublish,
  className,
}) => {
  const getStatusInfo = (material: Material) => {
    if (material.published) {
      return {
        label: 'Published',
        color: designSystemTheme.palette.success.main,
        backgroundColor: designSystemTheme.palette.success.light,
        icon: <PublishIcon sx={{ fontSize: 16 }} />,
      };
    }
    
    if (material.scheduledTimestamp) {
      return {
        label: 'Scheduled',
        color: designSystemTheme.palette.info.main,
        backgroundColor: designSystemTheme.palette.info.light,
        icon: <ScheduleIcon sx={{ fontSize: 16 }} />,
      };
    }
    
    return {
      label: 'Draft',
      color: designSystemTheme.palette.warning.main,
      backgroundColor: designSystemTheme.palette.warning.light,
      icon: <SaveIcon sx={{ fontSize: 16 }} />,
    };
  };

  const statusInfo = getStatusInfo(material);

  if (loading) {
    return (
      <Card className={className} sx={{ height: 200 }}>
        <CardContent>
          <Skeleton variant="text" width="80%" height={32} />
          <Skeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 2, borderRadius: 2 }} />
        </CardContent>
        <CardActions>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </CardActions>
      </Card>
    );
  }

  return (
    <Fade in={true} timeout={300}>
      <Card
        className={className}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: designSystemTheme.shadows[8],
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 3, px: 3, pt: 3 }}>
          {/* Status Chip */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              icon={statusInfo.icon}
              label={statusInfo.label}
              size="small"
              sx={{
                backgroundColor: statusInfo.backgroundColor,
                color: statusInfo.color,
                fontWeight: 600,
                '& .MuiChip-icon': {
                  color: statusInfo.color,
                },
              }}
            />
            
            {/* Action Buttons */}
            {isCourseAdmin && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Edit Material" arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(material.id);
                    }}
                    sx={{
                      color: designSystemTheme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: designSystemTheme.palette.primary.light,
                        color: designSystemTheme.palette.primary.contrastText,
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete Material" arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(material.id);
                    }}
                    sx={{
                      color: designSystemTheme.palette.error.main,
                      '&:hover': {
                        backgroundColor: designSystemTheme.palette.error.light,
                        color: designSystemTheme.palette.error.contrastText,
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                {material.published && onUnpublish && (
                  <Tooltip title="Unpublish Material" arrow>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnpublish?.(material.id);
                      }}
                      sx={{
                        color: designSystemTheme.palette.warning.main,
                        '&:hover': {
                          backgroundColor: designSystemTheme.palette.warning.light,
                          color: designSystemTheme.palette.warning.contrastText,
                        },
                      }}
                    >
                      <PublishIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
          </Box>

          {/* Material Title - Clickable and Enhanced */}
          <Typography
            variant="h5"
            component="h3"
            sx={{
              fontFamily: designSystemTheme.typography.h5.fontFamily,
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              lineHeight: 1.3,
              color: designSystemTheme.palette.text.primary,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                color: designSystemTheme.palette.primary.main,
                textDecoration: 'underline',
                textDecorationColor: designSystemTheme.palette.primary.main,
                textDecorationThickness: '2px',
                textUnderlineOffset: '4px',
                transform: 'translateY(-1px)',
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onView?.(material.id);
            }}
          >
            {material.title || 'Untitled Material'}
          </Typography>

          {/* Material Date Information */}
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: statusInfo.color,
                }}
              />
              {getDateInfo(material)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default MaterialCard;
