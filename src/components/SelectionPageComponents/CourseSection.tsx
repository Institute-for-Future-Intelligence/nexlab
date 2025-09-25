import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';
import CourseCard from './CourseCard';

interface Course {
  id: string;
  number: string;
  title: string;
  isPublic?: boolean;
  createdAt?: Date;
  isCourseAdmin?: boolean;
}

interface CourseSectionProps {
  title: string;
  courses: Course[];
  onCourseClick: (courseId: string) => void;
  isAdmin?: boolean;
}

const CourseSection: React.FC<CourseSectionProps> = ({ 
  title, 
  courses, 
  onCourseClick, 
  isAdmin 
}) => {
  if (courses.length === 0) return null;

  return (
    <Box sx={{ mb: spacing[6] }}>
      {/* Section Header */}
      <Box sx={{ mb: spacing[4] }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontFamily: typography.fontFamily.display,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            mb: spacing[2],
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: typography.fontFamily.secondary,
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            lineHeight: 1.6,
          }}
        >
          {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
        </Typography>
      </Box>

      {/* Course Grid */}
      <Grid container spacing={spacing[4]}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
            <CourseCard
              course={course}
              onClick={() => onCourseClick(course.id)}
              isAdmin={course.isCourseAdmin}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CourseSection;
