// src/components/Supplemental/BackToAllMaterialsButton.tsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface BackToAllMaterialsButtonProps {
  returnToSelection?: boolean; // New prop: true = back to selection, false = back to course materials
}

const BackToAllMaterialsButton: React.FC<BackToAllMaterialsButtonProps> = ({ returnToSelection = false }) => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const selectedCourse = searchParams.get('course'); // Retrieve course ID from URL

  const handleClick = () => {
    if (returnToSelection || !selectedCourse) {
      navigate('/supplemental-materials'); // Go to course selection page
    } else {
      navigate(`/supplemental-materials?course=${selectedCourse}`); // Go back to course materials
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