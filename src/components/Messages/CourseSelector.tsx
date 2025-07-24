// src/components/Messages/CourseSelector.tsx

import React, { useEffect, useState } from 'react';
import { MenuItem, Select, InputLabel, FormControl, FormHelperText } from '@mui/material';
import { useUser } from '../../hooks/useUser';

interface CourseSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ value, onChange }) => {
  const [adminCourses, setAdminCourses] = useState<{ id: string; number: string; title: string }[]>([]);
  const { userDetails } = useUser();

  useEffect(() => {
    if (userDetails?.classes) {
      const filteredCourses = Object.entries(userDetails.classes)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, course]) => course.isCourseAdmin || userDetails.isSuperAdmin)
        .map(([id, course]) => ({
          id,
          number: course.number,
          title: course.title,
        }));
      setAdminCourses(filteredCourses);
    } else {
      setAdminCourses([]);
    }
  }, [userDetails]);  

  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel id="course-selector-label">Course</InputLabel>
      <Select
        labelId="course-selector-label"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label="Course"
      >
        {adminCourses.length > 0 ? (
          adminCourses.map((course) => (
            <MenuItem key={course.id} value={course.id}>
              {`${course.number} - ${course.title}`}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No courses available</MenuItem>
        )}
      </Select>
      {!value && <FormHelperText>Please select a course</FormHelperText>}
    </FormControl>
  );
};

export default CourseSelector;