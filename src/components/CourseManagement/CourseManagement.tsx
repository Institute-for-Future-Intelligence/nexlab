// src/components/CourseManagement/CourseManagement.tsx

import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';
import { UserDetails } from '../../contexts/UserContext';
import { formatFirebaseTimestamp } from '../../types/firebase'; // Import utility
import { 
  Box, Typography, Paper, Button, 
  FormControlLabel, Switch
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../common';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';

import CourseStudentManagement from './CourseStudentManagement';
import ExportToCSV from './ExportToCSV';
import ModernStudentsTable from './ModernStudentsTable';

import CourseSelector from './CourseSelector';

import EditCourseDetails from './EditCourseDetails';
import EditAdditionalInfo from './EditAdditionalInfo';
import SyllabusFileDisplay from './SyllabusFileDisplay';
import DeleteCourse from './DeleteCourse';
import RetrieveCoursePasscode from './RetrieveCoursePasscode';

// Define the type for the course map
interface CourseMap {
  [courseId: string]: {
    number: string;
    title: string;
    isCourseAdmin: boolean;
  };
}

const CourseManagement: React.FC = () => {
  const { userDetails } = useUser();
  const [students, setStudents] = useState<UserDetails[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isRequestNewCourseOpen, setIsRequestNewCourseOpen] = useState(false);
  const [isRetrievePasscodeOpen, setIsRetrievePasscodeOpen] = useState(false);
  const [isRemoveStudentsOpen, setIsRemoveStudentsOpen] = useState(false);

  const db = getFirestore();
  const navigate = useNavigate();

  // Helper: Filter admin courses
  const getAdminCourses = (): CourseMap => {
    if (!userDetails?.classes) return {};
    return Object.entries(userDetails.classes)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, course]) => course.isCourseAdmin)
      .reduce(
        (acc, [id, course]) => ({
          ...acc,
          [id]: course as { number: string; title: string; isCourseAdmin: boolean },
        }),
        {} as CourseMap
      );
  };

  const adminCourses = getAdminCourses();

  // Ensure `selectedCourse` is valid
  useEffect(() => {
    if (!adminCourses[selectedCourse]) {
      setSelectedCourse(Object.keys(adminCourses)[0] || '');
    }
  }, [adminCourses, selectedCourse]);

  // Fetch students for the selected course
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse) return;
      try {
        const studentsQuery = query(
          collection(db, 'users'),
          where('isAdmin', '==', false)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
  
        const allStudents = studentsSnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as UserDetails[];
  
        const filteredStudents = allStudents.filter(
          (student) =>
            student.classes && student.classes[selectedCourse]
        );
  
        setStudents(filteredStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
  
    fetchStudents();
  }, [selectedCourse, db]);

  const handleCourseChange = (course: string) => {
    setSelectedCourse(course);
  };

  const handleNavigateToRequestNewCourse = () => {
    navigate('/request-new-course');
  };

  const selectedCourseDetails = adminCourses[selectedCourse];
  const selectedCourseDisplay = selectedCourseDetails
    ? `${selectedCourseDetails.number} - ${selectedCourseDetails.title}`
    : '';

  // Safeguard: Don't display course-specific UI if no valid course is selected
  const isCourseSelected = Boolean(selectedCourse && selectedCourseDetails);

  return (
    <Box className="profile-container" sx={{ p: 4 }}>
      <PageHeader title="Course Management" />

      {/* Course Selector */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          backgroundColor: '#FFFFFF',
          borderRadius: 2,
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Staatliches, sans-serif',
            mb: 2,
            color: '#0B53C0',
            fontSize: '1.25rem',
          }}
        >
          Select a Course
        </Typography>
        {Object.keys(adminCourses).length > 0 ? (
          <CourseSelector
            userClasses={adminCourses}
            selectedCourse={selectedCourse}
            onCourseChange={handleCourseChange}
          />
        ) : (
          <Typography variant="body1" sx={{ color: '#9E9E9E' }}>
            No courses available for selection.
          </Typography>
        )}
      </Box>

      <Box>
        {isCourseSelected && (
          <>
            {/* Syllabus File Display */}
            <SyllabusFileDisplay courseId={selectedCourse} />
            
            <Box
              sx={{
                flex: 2,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
              }}
            >
              <EditCourseDetails
                selectedCourse={selectedCourse}
                selectedCourseDetails={selectedCourseDetails}
                onCourseUpdate={() => {}}
              />
              <EditAdditionalInfo
                selectedCourse={selectedCourse}
                onInfoUpdate={() => {}}
              />
              <DeleteCourse
                selectedCourse={selectedCourse}
                onCourseDelete={() => setSelectedCourse('')}
              />
            </Box>
          </>
        )}
      </Box>

      {/* Students Table */}
      {isCourseSelected && (
        <Paper
          elevation={0}
          sx={{
            p: spacing[6],
            mb: spacing[6],
            borderRadius: borderRadius.xl,
            backgroundColor: colors.background.secondary,
            border: `1px solid ${colors.neutral[200]}`,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontFamily: typography.fontFamily.display,
              fontWeight: typography.fontWeight.bold,
              mb: spacing[4],
              color: colors.primary[500],
            }}
          >
            Students Enrolled in Course
          </Typography>

          <Box sx={{ mb: spacing[4] }}>
            <ModernStudentsTable 
              students={students}
              loading={false}
            />
          </Box>

          {students.length > 0 && (
            <ExportToCSV students={students} selectedCourse={selectedCourse} />
          )}

          {/* Remove Students Section */}
          {students.length > 0 && (
            <Paper sx={{ mt: 4, p: 3, borderRadius: 2, boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Staatliches, sans-serif',
                  mb: 2,
                  color: '#0B53C0',
                  fontSize: '1.25rem',
                }}
              >
                Remove Student(s) from the Course
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isRemoveStudentsOpen}
                    onChange={() => setIsRemoveStudentsOpen((prev) => !prev)}
                    sx={{
                      '& .MuiSwitch-thumb': {
                        backgroundColor: '#0B53C0',
                      },
                      '& .MuiSwitch-track': {
                        backgroundColor: '#E0ECFF',
                      },
                      '&.Mui-checked .MuiSwitch-track': {
                        backgroundColor: '#0B53C0',
                      },
                    }}
                  />
                }
                label=""
                sx={{ mb: 2 }}
              />
              {isRemoveStudentsOpen && (
                <CourseStudentManagement
                  selectedCourse={selectedCourse}
                  selectedCourseDetails={selectedCourseDetails}
                  onStudentChange={() => {}}
                />
              )}
            </Paper>
          )}
        </Paper>
      )}

      {/* Toggles Section */}
      <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
        <Box
          sx={{
            p: 3,
            flex: 1,
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={isRetrievePasscodeOpen}
                onChange={() => setIsRetrievePasscodeOpen((prev) => !prev)}
                sx={{
                  '& .MuiSwitch-thumb': {
                    backgroundColor: '#0B53C0',
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: '#E0ECFF',
                  },
                  '&.Mui-checked .MuiSwitch-track': {
                    backgroundColor: '#0B53C0',
                  },
                }}
              />
            }
            label="Retrieve Course Passcode"
            sx={{ 
              mb: 2,
              '& .MuiFormControlLabel-label': {
                fontFamily: 'Staatliches, sans-serif',
                color: '#0B53C0',
                fontSize: '1.25rem',
              }
            }}
          />
          {isRetrievePasscodeOpen && (
            <Box sx={{ mt: 2 }}>
              <RetrieveCoursePasscode 
                selectedCourse={selectedCourse}
                courseDetails={selectedCourseDetails ? {
                  number: selectedCourseDetails.number,
                  title: selectedCourseDetails.title
                } : undefined}
              />
            </Box>
          )}
        </Box>
        
        <Box
          sx={{
            p: 3,
            flex: 1,
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={isRequestNewCourseOpen}
                onChange={() => setIsRequestNewCourseOpen((prev) => !prev)}
                sx={{
                  '& .MuiSwitch-thumb': {
                    backgroundColor: '#0B53C0',
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: '#E0ECFF',
                  },
                  '&.Mui-checked .MuiSwitch-track': {
                    backgroundColor: '#0B53C0',
                  },
                }}
              />
            }
            label="Request Creating a New Course"
            sx={{ 
              mb: 2,
              '& .MuiFormControlLabel-label': {
                fontFamily: 'Staatliches, sans-serif',
                color: '#0B53C0',
                fontSize: '1.25rem',
              }
            }}
          />
          {isRequestNewCourseOpen && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleNavigateToRequestNewCourse}
                sx={{
                  backgroundColor: '#4CAF50',
                  color: '#FFFFFF',
                  fontFamily: 'Staatliches, sans-serif',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#388E3C',
                  },
                }}
              >
                Request New Course
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CourseManagement;