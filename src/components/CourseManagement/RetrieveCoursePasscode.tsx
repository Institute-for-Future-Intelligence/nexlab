// src/components/CourseManagement/RetrieveCoursePasscode.tsx
import React, { useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useCoursePasscode } from '../../hooks/useCoursePasscode';
import CopyToClipboard from './CopyToClipboard';

interface RetrieveCoursePasscodeProps {
  selectedCourse: string;
  courseDetails?: {
    number: string;
    title: string;
  };
}

/**
 * Component for retrieving and displaying course passcode
 * Uses the already selected course from parent component to eliminate duplication
 * Follows React best practices with proper prop interfaces and error handling
 */
const RetrieveCoursePasscode: React.FC<RetrieveCoursePasscodeProps> = ({ 
  selectedCourse, 
  courseDetails 
}) => {
  const { passcode, loading, error, fetchPasscode, clearPasscode, clearCache } = useCoursePasscode();

  // Memoize the effect callback to prevent infinite loops
  const handleCourseChange = useCallback(() => {
    if (selectedCourse) {
      fetchPasscode(selectedCourse);
    } else {
      clearPasscode();
      clearCache(); // Clear cache when no course is selected
    }
  }, [selectedCourse, fetchPasscode, clearPasscode, clearCache]);

  // Automatically fetch passcode when selectedCourse changes
  useEffect(() => {
    handleCourseChange();
  }, [handleCourseChange]);

  // Don't render anything if no course is selected
  if (!selectedCourse) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          Please select a course to retrieve its passcode.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {passcode && !loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            Passcode:
          </Typography>
          <CopyToClipboard 
            text={passcode}
            tooltipText="Click to copy passcode"
            successText="Passcode copied!"
          />
        </Box>
      )}

      {!passcode && !loading && !error && (
        <Alert severity="warning">
          No passcode available for this course.
        </Alert>
      )}
    </Box>
  );
};

export default RetrieveCoursePasscode;