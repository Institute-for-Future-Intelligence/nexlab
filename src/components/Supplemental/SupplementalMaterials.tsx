// src/components/Supplemental/SupplementalMaterials.tsx
import React, { useMemo } from 'react';
import { Box, Chip } from '@mui/material';
import Header from './Header';
import AddMaterialButton from './AddMaterialButton';
import MaterialGrid from './MaterialGrid';
import CourseSelector from './CourseSelector';
import { useUser } from '../../contexts/UserContext';
import { useSearchParams } from 'react-router-dom';

import BackToAllMaterialsButton from './BackToAllMaterialsButton';

const SupplementalMaterials: React.FC = () => {
  const { userDetails } = useUser();
  const [searchParams] = useSearchParams();
  const selectedCourse = searchParams.get('course') || null; // Get selected course ID from URL. Ensure it's either a string or null

  // Convert user classes object into an array for course selection, using useMemo() for performance
  const userCourses = useMemo(() => {
    return userDetails?.classes
      ? Object.entries(userDetails.classes).map(([id, course]) => ({
          id,
          number: course.number,
          title: course.title,
        }))
      : [];
  }, [userDetails?.classes]);

  // Find selected course data
  const selectedCourseData = useMemo(() => {
    return userCourses.find(course => course.id === selectedCourse);
  }, [userCourses, selectedCourse]);

  return (
    <Box className="supplemental-container">
      <Header />
      
      {/* If no course is selected, show Course Selector */}
      {!selectedCourse ? (
        <>
          <CourseSelector courses={userCourses} />
        </>
      ) : (
        // If a course is selected, show materials and add button
        <Box>
          {/* Header Area with Back Button and Course Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <BackToAllMaterialsButton returnToSelection={true} />
            <Chip
              label={selectedCourseData 
                ? `${selectedCourseData.number} - ${selectedCourseData.title}` 
                : "Selected Course"}
              variant="outlined"
              sx={{
                borderRadius: '15px',
                fontSize: '32px', // Increased font size to match the header
                fontWeight: 'bold',
                background: '#e0f2f1',
                color: '#00695c',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                fontFamily: 'Staatliches, sans-serif',
                padding: '20px 20px', // Added padding for better alignment with larger font
                '&:hover': {
                  backgroundColor: '#b2dfdb',
                },
              }}
            />
          </Box>

          {/* Main Content Area */}
          {/* Show Add Material Button for Educators & Super-Admins */}
          <Box className="supplemental-content">
            {/* Add Material Button for Admins */}
            {userDetails?.isAdmin && <AddMaterialButton selectedCourse={selectedCourse} />}

            {/* Show the Material Grid for the selected course */}
            <MaterialGrid initialCourse={selectedCourse} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SupplementalMaterials;