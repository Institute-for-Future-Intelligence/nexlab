// src/components/Supplemental/CourseDropdown.tsx

import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, CircularProgress, Box } from '@mui/material';
import { useUser } from '../../hooks/useUser';

interface CourseDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CourseDropdown: React.FC<CourseDropdownProps> = ({ value, onChange, disabled = false }) => {
  const [adminCourses, setAdminCourses] = useState<{ id: string; number: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
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
    <TextField
      select
      label="Select Course"
      value={isValidValue ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      disabled={disabled}
      sx={{ mb: 2 }}
      error={!isValidValue && value !== ''}
      helperText={!isValidValue && value !== '' ? 'Invalid course selected' : ''}
    >
      {adminCourses.length > 0 ? (
        adminCourses.map((course) => (
          <MenuItem key={course.id} value={course.id}>
            {course.number} - {course.title}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>No courses available</MenuItem>
      )}
    </TextField>
  );
};

export default CourseDropdown;