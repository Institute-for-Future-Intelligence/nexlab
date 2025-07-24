// src/components/UserTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { FirebaseTimestamp, formatFirebaseTimestamp } from '../../types/firebase'; // Import utilities

interface User {
  id: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  lastLogin?: FirebaseTimestamp; // Now properly typed
  classes?: Record<string, { number: string; title: string; isCourseAdmin?: boolean }>; // Update type for classes
}

interface UserTableProps {
  users: User[];
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {

  const getUserChipStyle = (isSuperAdmin?: boolean, isAdmin?: boolean) => {
    if (isSuperAdmin) return { backgroundColor: '#6a1b9a', color: '#fff' };
    if (isAdmin) return { backgroundColor: '#1976d2', color: '#fff' };
    return { backgroundColor: '#e0e0e0', color: '#000' };
  };

  const renderCourses = (classes?: User['classes']) =>
    classes
      ? Object.entries(classes).map(([courseId, course]) => (
          <Chip
            key={courseId}
            label={`${course.isCourseAdmin ? '[Course Admin] ' : ''}${course.number || 'N/A'} - ${course.title || 'Untitled Course'}`}
            sx={{
              backgroundColor: course.isCourseAdmin ? '#ffcccb' : '#d4edda', // Light red for admin, light green for non-admin
              color: course.isCourseAdmin ? '#b71c1c' : '#155724', // Dark red text for admin, dark green text for non-admin
              margin: '4px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              padding: '4px 8px',
            }}
          />
        ))
      : 'None';

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Login</TableCell>
            <TableCell>Courses</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id}
              sx={{
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  cursor: 'pointer',
                },
              }}
            >
              {/* User ID as Chip */}
              <TableCell>
                <Chip
                  label={user.id}
                  color={
                    user.isSuperAdmin
                      ? 'secondary'
                      : user.isAdmin
                      ? 'primary'
                      : 'default'
                  }
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    ...getUserChipStyle(user.isSuperAdmin, user.isAdmin),
                  }}
                />
              </TableCell>

              {/* Account Status as Chip */}
              <TableCell>
                <Chip
                  label={
                    user.isSuperAdmin
                      ? 'Super Admin'
                      : user.isAdmin
                      ? 'Educator'
                      : 'Student'
                  }
                  color={user.isSuperAdmin ? 'secondary' : user.isAdmin ? 'primary' : 'default'}
                />
              </TableCell>

              {/* Last Login */}
              <TableCell>
                {formatFirebaseTimestamp(user.lastLogin)}
              </TableCell>

              {/* Courses */}
              <TableCell>
                {renderCourses(user.classes) || (
                  <Chip label="No courses assigned" sx={{ backgroundColor: '#e0e0e0', color: '#000' }} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;