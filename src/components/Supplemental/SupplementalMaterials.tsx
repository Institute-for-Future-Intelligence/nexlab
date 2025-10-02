// src/components/Supplemental/SupplementalMaterials.tsx
import React, { useMemo } from 'react';
import { Box, Chip } from '@mui/material';
import Header from './Header';
import AddMaterialButtonModern from './AddMaterialButtonModern';
import MaterialGridModern from './MaterialGridModern';
import CourseSelector from './CourseSelector';
import { useUser } from '../../hooks/useUser';
import { useCourses } from '../../hooks/useCourses';
import { useSearchParams } from 'react-router-dom';

import BackToAllMaterialsButton from './BackToAllMaterialsButton';
import AdditionalCourseInfo from './AdditionalCourseInfo';

const SupplementalMaterials: React.FC = () => {
  const { userDetails } = useUser();
  const { userCourses } = useCourses();
  const [searchParams] = useSearchParams();
  const selectedCourse = searchParams.get('course') || null; // Get selected course ID from URL. Ensure it's either a string or null

  // Find selected course data
  const selectedCourseData = useMemo(() => {
    const courseData = userCourses.find(course => course.id === selectedCourse);
    
    // Debug logging for course admin status
    if (selectedCourse && courseData) {
      console.log('[SupplementalMaterials] Selected course data:', {
        courseId: selectedCourse,
        courseTitle: courseData.title,
        isCourseAdmin: courseData.isCourseAdmin,
        userIsAdmin: userDetails?.isAdmin,
        shouldShowAddButton: userDetails?.isAdmin && courseData.isCourseAdmin,
        timestamp: new Date().toISOString()
      });
    }
    
    return courseData;
  }, [userCourses, selectedCourse, userDetails?.isAdmin]);

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
          {/* Header Area with Course Info */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
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
          {/* Show Additional Course Information */}
          <AdditionalCourseInfo courseId={selectedCourse} isAdmin={userDetails?.isAdmin} />
          
          {/* Show Add Material Button for Course Admins & Super-Admins */}
          <Box className="supplemental-content">
            {/* Add Material Button for Course Admins */}
            {userDetails?.isAdmin && selectedCourseData?.isCourseAdmin && <AddMaterialButtonModern selectedCourse={selectedCourse} />}

            {/* Show the Material Grid for the selected course */}
            <MaterialGridModern initialCourse={selectedCourse} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SupplementalMaterials;