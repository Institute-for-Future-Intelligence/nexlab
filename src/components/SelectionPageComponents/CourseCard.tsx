import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { School as CourseIcon } from '@mui/icons-material';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../config/designSystem';

interface CourseCardProps {
  course: {
    id: string;
    number: string;
    title: string;
    isPublic?: boolean;
    courseCreatedAt?: Date; // When the course was originally created
    enrolledAt?: Date; // When the user was enrolled in this course
    isCourseAdmin?: boolean;
  };
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
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
              mb: spacing[1],
            }}
          >
            {course.title}
          </Typography>

          {/* Enrollment Date */}
          {course.enrolledAt && (
            <Typography
              variant="caption"
              sx={{
                color: colors.text.tertiary,
                fontFamily: typography.fontFamily.secondary,
                fontSize: typography.fontSize.xs,
                fontStyle: 'italic',
                mb: spacing[2],
                display: 'block',
              }}
            >
              Enrolled: {course.enrolledAt.toLocaleDateString()}
            </Typography>
          )}

          {/* Access Level Badge */}
          <Chip
            label={
              course.isCourseAdmin ? 'Instructor Access' :
              'Student Access'
            }
            size="small"
            sx={{
              backgroundColor: 
                course.isCourseAdmin ? colors.warning + '20' :
                colors.secondary[100],
              color: 
                course.isCourseAdmin ? colors.warning :
                colors.secondary[700],
              fontFamily: typography.fontFamily.secondary,
              fontWeight: typography.fontWeight.medium,
              fontSize: typography.fontSize.xs,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
