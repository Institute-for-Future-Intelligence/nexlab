// src/components/Supplemental/CourseSelector.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../../hooks/useCourses';
import { useUser } from '../../hooks/useUser';
import CourseSection from '../SelectionPageComponents/CourseSection';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/designSystem';

interface CourseSelectorProps {
  courses: { id: string; number: string; title: string }[];
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ courses }) => {
  const navigate = useNavigate();
  const { publicCourses, userCourses } = useCourses();

  const handleCourseClick = (courseId: string) => {
    navigate(`/supplemental-materials?course=${courseId}`);
  };


  return (
    <Box sx={{ width: '100%', padding: 4 }}>

      {/* Course Selection Section */}
      <Box sx={{ 
        mb: spacing[6], 
        p: spacing[4], 
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: shadows.sm,
        position: 'relative',
        mt: spacing[3], // Space for the tab
      }}>
        {/* File folder tab */}
        <Box sx={{
          position: 'absolute',
          top: '-25px',
          left: '40px',
          backgroundColor: colors.secondary[500],
          borderRadius: `${borderRadius.lg} ${borderRadius.lg} 0 0`,
          px: spacing[3],
          py: spacing[1],
          zIndex: 1,
        }}>
          <Typography sx={{
            color: colors.text.inverse,
            fontFamily: typography.fontFamily.display,
            fontSize: '2rem',
            fontWeight: typography.fontWeight.bold,
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}>
            Available Courses
          </Typography>
        </Box>

        <Box sx={{ mt: spacing[3] }}>
          {/* Public Courses */}
          {publicCourses.length > 0 && (
            <CourseSection
              title={publicCourses.length === 1 ? "Public Course" : "Public Courses"}
              courses={publicCourses}
              onCourseClick={handleCourseClick}
            />
          )}

          {/* User Courses */}
          <CourseSection
            title="Your Enrolled Courses"
            courses={userCourses}
            onCourseClick={handleCourseClick}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CourseSelector;