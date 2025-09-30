// src/components/Supplemental/CourseDropdown.tsx

import React, { useState, useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useUser } from '../../hooks/useUser';
import { CourseSelector, CourseOption } from '../common';

interface CourseDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CourseDropdown: React.FC<CourseDropdownProps> = ({ value, onChange, disabled = false }) => {
  const [adminCourses, setAdminCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const { userDetails } = useUser();

  useEffect(() => {
    console.log("User Details in CourseDropdown:", userDetails);

    if (userDetails?.classes) {
      const filteredCourses = Object.entries(userDetails.classes)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, course]) => course.isCourseAdmin || userDetails.isSuperAdmin) // Include Super-Admin access
        .map(([id, course]) => ({
          id,
          number: course.number,
          title: course.title,
          isCourseAdmin: course.isCourseAdmin,
        }));
      
      console.log("Filtered Courses for Dropdown:", filteredCourses);
      setAdminCourses(filteredCourses);
    } else {
      setAdminCourses([]);
    }
    setLoading(false); // Set loading to false after processing
  }, [userDetails]);

  // Ensure the provided value exists in the options
  const isValidValue = adminCourses.some((course) => course.id === value);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <CourseSelector
      value={isValidValue ? value : ''}
      onChange={onChange}
      courses={adminCourses}
      label="Select Course"
      placeholder="Choose a course"
      helperText={!isValidValue && value !== '' ? 'Invalid course selected' : ''}
      error={!isValidValue && value !== ''}
      disabled={disabled}
      loading={loading}
      showNumber={true}
      showTitle={true}
      showAdminBadge={false}
    />
  );
};

export default CourseDropdown;