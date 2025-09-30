// src/components/Messages/CourseSelector.tsx

import React, { useEffect, useState } from 'react';
import { FormHelperText } from '@mui/material';
import { useUser } from '../../hooks/useUser';
import { CourseSelector as CommonCourseSelector, CourseOption } from '../common';

interface CourseSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ value, onChange }) => {
  const [adminCourses, setAdminCourses] = useState<CourseOption[]>([]);
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
          isCourseAdmin: course.isCourseAdmin,
        }));
      setAdminCourses(filteredCourses);
    } else {
      setAdminCourses([]);
    }
  }, [userDetails]);  

  return (
    <>
      <CommonCourseSelector
        value={value}
        onChange={onChange}
        courses={adminCourses}
        label="Course"
        placeholder="Select a course"
        helperText=""
        showNumber={true}
        showTitle={true}
        showAdminBadge={false}
      />
      {!value && <FormHelperText>Please select a course</FormHelperText>}
    </>
  );
};

export default CourseSelector;