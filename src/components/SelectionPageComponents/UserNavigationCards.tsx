import React from 'react';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NavigationCard from './NavigationCard';
import { UserDetails } from '../../contexts/UserContext';

interface UserNavigationCardsProps {
  userDetails: UserDetails | null;
}

const UserNavigationCards: React.FC<UserNavigationCardsProps> = ({ userDetails }) => {
  const navigate = useNavigate();

  const isLabNotebookDisabled = userDetails && !userDetails.isAdmin && 
    (!userDetails.classes || Object.keys(userDetails.classes).length === 0);

  const labNotebookTooltip = "The Laboratory Notebook is accessible to users enrolled in an academic course. Please enroll in a course via 'My Account' by following the instructions provided by your academic instructor.";

  return (
    <>
      <Grid item xs={12}>
        <NavigationCard
          title="My Account"
          onClick={() => navigate('/my-profile')}
        />
      </Grid>

      <Grid item xs={12}>
        <NavigationCard
          title="Laboratory Notebook"
          onClick={() => navigate('/laboratory-notebook')}
          disabled={isLabNotebookDisabled}
          disabledTooltip={labNotebookTooltip}
          lockIcon={isLabNotebookDisabled}
        />
      </Grid>

      <Grid item xs={12}>
        <NavigationCard
          title="Course Materials"
          onClick={() => navigate('/supplemental-materials')}
        />
      </Grid>
    </>
  );
};

export default UserNavigationCards; 