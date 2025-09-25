// src/components/CourseManagement/CourseManagement.tsx

import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';
import { UserDetails } from '../../contexts/UserContext';
import { formatFirebaseTimestamp } from '../../types/firebase'; // Import utility
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, 
  FormControlLabel, Switch 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import CourseStudentManagement from './CourseStudentManagement';
import ExportToCSV from './ExportToCSV';

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

      <Typography className="webpage_title" sx={{ mb: 2 }}>
        Course Management
      </Typography>

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
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#F9FAFB',
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontFamily: 'Staatliches, sans-serif',
              fontWeight: 'bold',
              mb: 2,
              color: '#0B53C0',
            }}
          >
            Students Enrolled in a Course
          </Typography>

          {students.length === 0 ? (
            <Typography sx={{ color: '#757575', textAlign: 'center', p: 3 }}>
              No students are currently enrolled in <strong>{selectedCourseDisplay}</strong>.
            </Typography>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Last Login</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.uid}>
                        <TableCell>{student.uid}</TableCell>
                        <TableCell>
                          {formatFirebaseTimestamp(student.lastLogin)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <ExportToCSV students={students} selectedCourse={selectedCourse} />
            </>
          )}

          {/* Remove Students Section */}
          {students.length > 0 && (
            <Paper sx={{ mt: 4, p: 3, borderRadius: 2, boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isRemoveStudentsOpen}
                    onChange={() => setIsRemoveStudentsOpen((prev) => !prev)}
                  />
                }
                label="Remove Student(s) from the Course"
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
              />
            }
            label="Retrieve Course Passcode"
          />
          {isRetrievePasscodeOpen && (
            <Box sx={{ mt: 2 }}>
              <RetrieveCoursePasscode />
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
              />
            }
            label="Request Creating a New Course"
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