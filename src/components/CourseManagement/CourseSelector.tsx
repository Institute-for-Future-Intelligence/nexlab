// src/components/CourseManagement/CourseSelector.tsx

import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

interface CourseSelectorProps {
  userClasses: Record<string, { number: string; title: string, isCourseAdmin?: boolean }>;
  selectedCourse: string;
  onCourseChange: (courseId: string) => void;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  userClasses,
  selectedCourse,
  onCourseChange,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <FormControl fullWidth variant="outlined">
        <InputLabel id="course-selector-label">Select a Course</InputLabel>
        <Select
          aria-label="Select a course"
          labelId="course-selector-label"
          value={selectedCourse}
          onChange={(e) => onCourseChange(e.target.value as string)}
          label="Select a Course"
        >
          {Object.entries(userClasses).map(([courseId, course]) => (
            <MenuItem key={courseId} value={courseId}>
              {`${course.number} - ${course.title}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default CourseSelector;