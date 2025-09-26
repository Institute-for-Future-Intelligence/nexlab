import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, TextField, Button, Snackbar, Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Chip } from '@mui/material';
import { getFirestore, doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FirebaseTimestamp } from '../../types/firebase'; // Import proper type
import { PageHeader } from '../common';

import ModernUserTable from './ModernUserTable'; // Import the modern UserTable component
import DeleteUser from './DeleteUser'; // Import the DeleteUser component

interface User {
  id: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  lastLogin?: FirebaseTimestamp; // Now properly typed
  classes?: Record<string, { number: string; title: string, isCourseAdmin?: boolean }>; // Updated to reflect the new structure
}

interface Course {
  id: string;
  number: string;
  title: string;
}

const AssignCourse: React.FC<{ 
  userId: string; 
  userClasses?: Record<string, { number: string; title: string; isCourseAdmin?: boolean }>; 
  courses: Course[];
  onCourseAssigned: (courseId: string, courseData: { number: string; title: string; isCourseAdmin: boolean }) => void;
}> = ({ userId, userClasses, courses, onCourseAssigned }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isAdminForCourse, setIsAdminForCourse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showBlinkEffect, setShowBlinkEffect] = useState(false);

  const db = getFirestore();

  const handleAssignCourse = async () => {
    if (!userId || !selectedCourse) {
      setMessage('Please enter a User ID and select a course.');
      setIsSuccess(false);
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      const courseData = courses.find(course => course.id === selectedCourse);
      if (courseData) {
        // Get course creation date from the course document
        const courseRef = doc(db, 'courses', selectedCourse);
        const courseDoc = await getDoc(courseRef);
        const courseDocData = courseDoc.exists() ? courseDoc.data() : null;
        const courseCreatedAt = courseDocData?.courseCreatedAt || courseDocData?.createdAt || courseDocData?.timestamp || new Date();

        await updateDoc(userRef, { 
          [`classes.${selectedCourse}`]: { 
            number: courseData.number, 
            title: courseData.title, 
            isCourseAdmin: isAdminForCourse,
            courseCreatedAt: courseCreatedAt, // When the course was originally created
            enrolledAt: new Date(), // When the user was assigned to this course
          } 
        });

        setMessage(
          `Course ${courseData.title} assigned successfully to user ${userId}${
            isAdminForCourse ? ' as Course Admin.' : '.'
          }`
        );
        
        // Update parent state with new course
        onCourseAssigned(selectedCourse, { 
          number: courseData.number, 
          title: courseData.title, 
          isCourseAdmin: isAdminForCourse 
        });
        
        // Trigger green blink effect
        setShowBlinkEffect(true);
        setTimeout(() => setShowBlinkEffect(false), 1000);
        
        // Close the dialog after successful assignment
        setOpenAssignDialog(false);
        // Reset form fields for better UX
        setSelectedCourse('');
        setIsAdminForCourse(false);
        setIsSuccess(true);
      } else {
        setMessage('Selected course not found.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error assigning course:', error);
      setMessage('Error assigning course.');
      setIsSuccess(false);
    }
    setLoading(false);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  const handleAssignDialogOpen = () => setOpenAssignDialog(true);
  const handleAssignDialogClose = () => setOpenAssignDialog(false);

  return (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mt: 2,
          p: 2,
          borderRadius: 2,
          transition: 'background-color 0.3s ease',
          backgroundColor: showBlinkEffect ? '#e8f5e8' : 'transparent',
          border: showBlinkEffect ? '2px solid #4caf50' : '2px solid transparent',
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mr: 2 }}>
          Current Courses:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {userClasses && Object.keys(userClasses).length > 0
            ? Object.values(userClasses).map((c, index) => (
                <Chip
                  key={index}
                  label={`${c.isCourseAdmin ? '[Course Admin] ' : ''}${c.number} - ${c.title}`}
                  style={{
                    backgroundColor: c.isCourseAdmin ? '#ffcccb' : '#d4edda', // Light red for admin, light green for non-admin
                    color: c.isCourseAdmin ? '#b71c1c' : '#155724', // Dark red text for admin, dark green text for non-admin
                    margin: '4px',
                  }}
                />
              ))
            : <Typography>No courses assigned.</Typography>}
        </Box>
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel>Course</InputLabel>
          <Select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {`${course.number} - ${course.title}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ mr: 2 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={isAdminForCourse ? 'admin' : 'student'}
            onChange={(e) => setIsAdminForCourse(e.target.value === 'admin')}
          >
            <MenuItem value="admin">Course Admin</MenuItem>
            <MenuItem value="student">Student</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAssignDialogOpen}
          disabled={loading || !selectedCourse}
        >
          {loading ? <CircularProgress size={24} /> : 'Assign Course'}
        </Button>
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={isSuccess ? "success" : "error"}>
          {message}
        </Alert>
      </Snackbar>

      <Dialog
        open={openAssignDialog}
        onClose={handleAssignDialogClose}
        aria-labelledby="assign-dialog-title"
      >
        <DialogTitle id="assign-dialog-title">Assign Course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to assign the course {selectedCourse} to this user
            {isAdminForCourse ? ' as a Course Admin?' : '?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAssignCourse} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const UserManagement: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [userClasses, setUserClasses] = useState<Record<string, { number: string; title: string; isCourseAdmin?: boolean }> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newStatus, setNewStatus] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<Course[]>([]); // Added state for storing courses
  const db = getFirestore();

  const [selectedStatus, setSelectedStatus] = useState(''); // '' means no filter applied
  
  const navigate = useNavigate();

  const handleNavigateHome = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesCollection = collection(db, 'courses');
        const coursesSnapshot = await getDocs(coursesCollection);
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          number: doc.data().number,
          title: doc.data().title
        }) as Course);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [db]);

  const fetchUserDetails = async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    setUserExists(false);
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setIsAdmin(userData.isAdmin);
        setUserClasses(userData.classes);
        setUserExists(true);
      } else {
        setMessage('User not found.');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setMessage('Error fetching user.');
      setOpenSnackbar(true);
    }
    setLoading(false);
  };

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }) as User);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Error fetching users.');
      setOpenSnackbar(true);
    }
    setLoading(false);
  }, [db]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const handleConfirm = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isAdmin: newStatus });
      setMessage(`User ${newStatus ? 'granted' : 'revoked'} admin privileges successfully.`);
      setIsAdmin(newStatus);

      // Update user list locally instead of re-fetching from the database
      const updatedUsers = users.map((user) => {
        if (user.id === userId) {
          return { ...user, isAdmin: newStatus };
        }
        return user;
      });

      setUsers(updatedUsers);

    } catch (error) {
      console.error('Error updating user:', error);
      setMessage('Error updating user.');
    }
    setOpenSnackbar(true);
    setOpenDialog(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (userExists) {
      setNewStatus(!isAdmin);
      setOpenDialog(true);
    } else {
      setMessage('User not found.');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCourseChange = (event: SelectChangeEvent<string>) => {
    setSelectedCourse(event.target.value as string);
  };

  // Filters users based on selected course
  const courseFilter = (user: User) =>
  selectedCourse ? user.classes && (selectedCourse in user.classes) : true;

  // Filters users based on their status
  const statusFilter = (user: User) => {
    if (selectedStatus === 'superAdmin') return user.isSuperAdmin;
    if (selectedStatus === 'educator') return user.isAdmin && !user.isSuperAdmin;
    if (selectedStatus === 'student') return !user.isAdmin && !user.isSuperAdmin;
    return true; // No filter applied
  };

  const filteredUsers = (users: User[]) =>
    users.filter((user) => courseFilter(user) && statusFilter(user));

  const handleUserDeleted = (success: boolean) => {
    if (success) {
      setMessage('User account deleted successfully.');
      setUserExists(false);
      setUserId('');
      fetchAllUsers();
    } else {
      setMessage('Error deleting user account.');
    }
    setOpenSnackbar(true);
  };

  const handleCourseAssigned = (courseId: string, courseData: { number: string; title: string; isCourseAdmin: boolean }) => {
    // Update the local userClasses state to reflect the new course assignment
    setUserClasses(prevClasses => ({
      ...prevClasses,
      [courseId]: courseData
    }));
  };

  return (
    <Box sx={{ padding: 3 }}>
      <PageHeader title="User Management" />
      <Typography variant="body1" gutterBottom>
        Use this page to view and manage user permissions. Enter the User ID to grant or revoke admin privileges, or delete user account.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            fullWidth
            required
            margin="normal"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                fetchUserDetails();
                e.preventDefault();
              }
            }}
            sx={{ minWidth: '300px' }}
          />
          {loading ? (
            <CircularProgress />
          ) : (
            userExists && (
              <Paper variant="outlined" sx={{ padding: 2, borderRadius: '15px', mb: 1 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    border: '1px solid #e0e0e0', 
                    padding: '16px', 
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    mb: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" component="h2" sx={{ mr: 2 }}>
                      Current Status:
                    </Typography>
                    <Chip
                      label={isAdmin ? 'Educator (Admin)' : 'Student (Non-Admin)'}
                      color={isAdmin ? 'primary' : 'default'}
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        padding: '6px 12px',
                        borderRadius: '16px',
                        backgroundColor: isAdmin ? '#1976d2' : '#e0e0e0',
                        color: isAdmin ? '#fff' : '#000',
                      }}
                    />
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    color={isAdmin ? 'secondary' : 'primary'}
                    sx={{
                      padding: '8px 16px',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    {isAdmin ? 'Revoke Educator Access' : 'Grant Educator Access'}
                  </Button>
                </Box>
                <AssignCourse userId={userId} userClasses={userClasses} courses={courses} onCourseAssigned={handleCourseAssigned} />
                <DeleteUser userId={userId} onUserDeleted={handleUserDeleted} />
              </Paper>
            )
          )}
        </form>
      </Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Current Users
      </Typography>
      <FormControl fullWidth sx={{ mb: 3, width: '25%' }}>
        <InputLabel>Filter by Course</InputLabel>
        <Select
          value={selectedCourse}
          onChange={handleCourseChange}
        >
          <MenuItem value="">All Courses</MenuItem>
          {courses.map(course => (
            <MenuItem key={course.id} value={course.id}>{course.number}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 3, width: '25%' }}>
        <InputLabel>User Status</InputLabel>
        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="superAdmin">Super Admin</MenuItem>
          <MenuItem value="educator">Educator</MenuItem>
          <MenuItem value="student">Student</MenuItem>
        </Select>
      </FormControl>
      <ModernUserTable users={filteredUsers(users)} />
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{isAdmin ? 'Revoke Admin Privileges' : 'Grant Admin Privileges'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to {isAdmin ? 'revoke' : 'grant'} admin privileges for this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="info">
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;