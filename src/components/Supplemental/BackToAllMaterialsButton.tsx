// src/components/Supplemental/BackToAllMaterialsButton.tsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface BackToAllMaterialsButtonProps {
  returnToSelection?: boolean; // New prop: true = back to selection, false = back to course materials
  courseId?: string; // Course ID for navigation context
}

const BackToAllMaterialsButton: React.FC<BackToAllMaterialsButtonProps> = ({ returnToSelection = false, courseId }) => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const selectedCourse = searchParams.get('course'); // Retrieve course ID from URL

  const handleClick = () => {
    // Use courseId prop if provided, otherwise fall back to URL param
    const effectiveCourseId = courseId || selectedCourse;
    
    if (returnToSelection || !effectiveCourseId) {
      navigate('/supplemental-materials'); // Go to course selection page
    } else {
      navigate(`/supplemental-materials?course=${effectiveCourseId}`); // Go back to course materials
    }
  };

  return (
    <Button
      variant="text"
      color="primary"
      startIcon={<ArrowBackIcon />}
      onClick={handleClick}
      className="supplemental-back-button"
    >
      {returnToSelection ? 'Course Selection' : 'Course Materials'}
    </Button>
  );
};

export default BackToAllMaterialsButton;