import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { School as CourseIcon, Public as PublicIcon } from '@mui/icons-material';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../config/designSystem';

interface CourseCardProps {
  course: {
    id: string;
    number: string;
    title: string;
    isPublic?: boolean;
    createdAt?: Date;
  };
  onClick: () => void;
  isAdmin?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, isAdmin }) => {
  const isPublicCourse = course.isPublic || course.id === 'xsA42JCvfCUtmyoyx45s'; // Public course ID from config

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: 'pointer',
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.xl,
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: shadows.sm,
        transition: animations.transitions.normal,
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: shadows.xl,
          border: `1px solid ${isPublicCourse ? colors.warning : colors.primary[500]}`,
        }
      }}
    >
      {/* Public Course Badge */}
      {isPublicCourse && (
        <Box
          sx={{
            position: 'absolute',
            top: spacing[2],
            right: spacing[2],
            zIndex: 1,
          }}
        >
          <Chip
            icon={<PublicIcon sx={{ fontSize: 16 }} />}
            label="Public"
            size="small"
            sx={{
              backgroundColor: colors.warning,
              color: colors.text.inverse,
              fontFamily: typography.fontFamily.secondary,
              fontWeight: typography.fontWeight.bold,
              fontSize: typography.fontSize.xs,
            }}
          />
        </Box>
      )}

      <CardContent
        sx={{
          textAlign: 'center',
          p: spacing[4],
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ flex: 1 }}>
          {/* Course Icon */}
          <Box
            sx={{
              color: isPublicCourse ? colors.warning : colors.primary[500],
              mb: spacing[3],
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <CourseIcon sx={{ fontSize: 40 }} />
          </Box>

          {/* Course Number */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: typography.fontWeight.bold,
              fontFamily: typography.fontFamily.display,
              fontSize: '2rem',
              color: colors.text.primary,
              mb: spacing[2],
            }}
          >
            {course.number}
          </Typography>

          {/* Course Title */}
          <Typography
            variant="body2"
            sx={{
              color: colors.text.secondary,
              fontFamily: typography.fontFamily.secondary,
              fontSize: typography.fontSize.lg,
              lineHeight: 1.5,
              mb: spacing[2],
            }}
          >
            {course.title}
          </Typography>

          {/* Admin Badge */}
          {isAdmin && (
            <Chip
              label="Admin Access"
              size="small"
              sx={{
                backgroundColor: colors.secondary[100],
                color: colors.secondary[700],
                fontFamily: typography.fontFamily.secondary,
                fontWeight: typography.fontWeight.medium,
                fontSize: typography.fontSize.xs,
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
