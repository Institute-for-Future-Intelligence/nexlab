// src/components/UserAccount/AddCourseForm.tsx
import React, { useState } from 'react';
import { TextField, Button, Grid } from '@mui/material';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';
import { UserDetails } from '../../contexts/UserContext';

interface AddCourseFormProps {
  onCourseAdded: (message: string, severity: 'success' | 'error' | 'info') => void; // Callback to trigger when a course is successfully added or when an error occurs
}

// Define the Course interface
interface Course {
  id: string;
  passcode: string;
  number: string;
  title: string;
}

const AddCourseForm: React.FC<AddCourseFormProps> = ({ onCourseAdded }) => {
  const [passcode, setPasscode] = useState('');
  const { userDetails, setUserDetails } = useUser();
  const db = getFirestore();

  const handlePasscodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasscode(event.target.value);
  };

  const handleAddCourse = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      const coursesList: Course[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        passcode: doc.data().passcode,
        number: doc.data().number,
        title: doc.data().title,
      }));

      // Find course with matching passcode
      const selectedCourse = coursesList.find(c => c.passcode === passcode);
      if (selectedCourse) {
        if (userDetails) {
          const userCourses = userDetails.classes || {};

          if (userCourses[selectedCourse.id]) {
            // Notify user that the course is already added
            onCourseAdded(`Course access for ${selectedCourse.number} is already added to your account!`, 'info');
          } else {
            const userDoc = doc(db, 'users', userDetails.uid);

            // Get course creation date from the course document
            const courseDocRef = doc(db, 'courses', selectedCourse.id);
            const courseDoc = await getDoc(courseDocRef);
            const courseData = courseDoc.exists() ? courseDoc.data() : null;
            const courseCreatedAt = courseData?.createdAt || courseData?.timestamp || new Date();

            // Update user document using a map structure
            await updateDoc(userDoc, {
              [`classes.${selectedCourse.id}`]: {
                number: selectedCourse.number,
                title: selectedCourse.title,
                isCourseAdmin: false, // Explicitly set this field to false
                courseCreatedAt: courseCreatedAt, // When the course was originally created
                enrolledAt: new Date(), // When the user enrolled in this course
              },
            });

            // Fetch updated user details
            const updatedUserDoc = await getDoc(userDoc);
            if (updatedUserDoc.exists()) {
              const updatedUserData = updatedUserDoc.data() as UserDetails;
              setUserDetails({ ...updatedUserData, uid: userDetails.uid });
            }

            onCourseAdded(`Course access for ${selectedCourse.number} added to your account successfully!`, 'success');
            setPasscode(''); // Clear the input field on success
          }
        }
      } else {
        // Notify user of invalid passcode
        onCourseAdded('Invalid passcode. Course not found.', 'error');
      }
    } catch (error) {
      console.error('Error updating document: ', error);
      onCourseAdded('Error adding course access to your account.', 'error');
    }
  };

  return (
    <div>
      <Grid container spacing={2} sx={{ maxWidth: '50%' }}>
        <Grid item xs={10}>
          <TextField
            label="Enter Course Passcode"
            value={passcode}
            onChange={handlePasscodeChange}
            fullWidth
            sx={{ mb: 2 }}
          />
        </Grid>
        <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
          <Button variant="contained" onClick={handleAddCourse}>
            Add Course
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default AddCourseForm;