// NotebookTable.tsx
import React from 'react';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Box,
  Typography,
} from '@mui/material';

import { Timestamp, FieldValue } from 'firebase/firestore';
import { Design } from '../../types/types'; // Import the Design interface
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../config/designSystem';
import { CopyableUserID, CourseHyperlink } from '../common';

// Define the types for the component props
interface NotebookTableProps {
  designs: Design[];
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
  isAdmin: boolean;
  userDetails: { uid: string; classes?: Record<string, { number: string; title: string, isCourseAdmin?: boolean}> } | null; // Updated userDetails prop
  showUserIdColumn: boolean; // Add showUserIdColumn prop
}

const NotebookTable: React.FC<NotebookTableProps> = ({ designs, handleEdit, handleDelete, userDetails, showUserIdColumn }) => {
  // Function to format Firestore timestamp to a readable format with full date and time
  const formatDate = (value: Timestamp | Date | FieldValue | null): string => {
    if (!value) return 'N/A';

    // If value is a Timestamp
    if (value instanceof Timestamp) {
      const date = value.toDate();
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    // If value is a Date
    if (value instanceof Date) {
      return value.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    // Handle other cases (like FieldValue)
    return 'N/A';
  };   

  return (
    <TableContainer 
      component={Paper}
      sx={{
        borderRadius: borderRadius['2xl'],
        boxShadow: shadows.lg,
        border: `1px solid ${colors.neutral[200]}`,
        overflow: 'hidden',
      }}
    >
      <Table 
        sx={{ 
          '& .MuiTableCell-root': { 
            fontSize: typography.fontSize.base,
            fontFamily: typography.fontFamily.primary,
            borderBottom: `1px solid ${colors.neutral[200]}`,
          },
          '& .MuiTableCell-head': { 
            fontSize: typography.fontSize.lg,
            fontFamily: typography.fontFamily.display,
            fontWeight: typography.fontWeight.semibold,
            backgroundColor: colors.primary[500],
            color: colors.text.inverse,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: colors.primary[25],
          },
        }}
      >
        <TableHead>
          <TableRow sx={{ height: '64px' }}> 
            <TableCell sx={{ width: showUserIdColumn ? '30%' : '35%' }}>Title</TableCell>
            <TableCell sx={{ width: '20%' }}>Course</TableCell>
            {showUserIdColumn && <TableCell sx={{ width: '15%' }}>User</TableCell>}
            <TableCell sx={{ width: '15%' }}>Created</TableCell>
            <TableCell sx={{ width: '15%' }}>Modified</TableCell>
            <TableCell sx={{ width: '15%', textAlign: 'center' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {designs && designs.length > 0 ? (
            designs.map((design) => {
              const isOwnDesign = design.userId === userDetails?.uid;
              const courseInfo = design.course && userDetails?.classes && userDetails.classes[design.course]
                ? userDetails.classes[design.course]
                : null;
              
              return (
                <TableRow 
                  key={design.id} 
                  sx={{ 
                    height: '72px',
                    transition: animations.transitions.fast,
                    '&:hover': {
                      backgroundColor: colors.primary[25],
                      transform: 'translateY(-1px)',
                      boxShadow: shadows.sm,
                    },
                  }}
                >
                  {/* Design Title */}
                  <TableCell>
                    <Box
                      onClick={() => handleEdit(design.id)}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: colors.primary[100],
                        border: `1px solid ${colors.primary[200]}`,
                        borderRadius: borderRadius.lg,
                        padding: `${spacing[2]} ${spacing[3]}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        maxWidth: '100%',
                        '&:hover': {
                          backgroundColor: colors.primary[200],
                          borderColor: colors.primary[300],
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        },
                      }}
                    >
                      <Typography 
                        variant="body1"
                        sx={{
                          fontFamily: typography.fontFamily.secondary,
                          fontSize: typography.fontSize.base,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.primary[700],
                          textDecoration: 'none',
                          userSelect: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {design.title}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Course */}
                  <TableCell>
                    {courseInfo ? (
                      <CourseHyperlink
                        courseId={design.course}
                        courseNumber={courseInfo.number}
                        courseTitle={courseInfo.title}
                        variant="link"
                        maxTitleLength={30}
                      />
                    ) : (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: colors.text.disabled,
                          fontStyle: 'italic',
                        }}
                      >
                        No Course
                      </Typography>
                    )}
                  </TableCell>

                  {/* User ID (if shown) */}
                  {showUserIdColumn && (
                    <TableCell>
                      <CopyableUserID 
                        userId={design.userId} 
                        userType="student"
                      />
                    </TableCell>
                  )}

                  {/* Created Date */}
                  <TableCell>
                    <Typography 
                      variant="body2"
                      sx={{
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.sm,
                      }}
                    >
                      {formatDate(design.dateCreated)}
                    </Typography>
                  </TableCell>

                  {/* Modified Date */}
                  <TableCell>
                    <Typography 
                      variant="body2"
                      sx={{
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.sm,
                      }}
                    >
                      {formatDate(design.dateModified)}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: spacing[1] }}>
                      <Tooltip title={isOwnDesign ? "Edit Design" : "Cannot edit others' designs"}>
                        <span>
                          <IconButton 
                            size="small"
                            onClick={() => isOwnDesign && handleEdit(design.id)} 
                            disabled={!isOwnDesign}
                            sx={{
                              color: isOwnDesign ? colors.primary[600] : colors.text.disabled,
                              '&:hover': {
                                backgroundColor: isOwnDesign ? colors.primary[100] : 'transparent',
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      <Tooltip title={isOwnDesign ? "Delete Design" : "Cannot delete others' designs"}>
                        <span>
                          <IconButton 
                            size="small"
                            onClick={() => isOwnDesign && handleDelete(design.id)} 
                            disabled={!isOwnDesign}
                            sx={{
                              color: isOwnDesign ? colors.error : colors.text.disabled,
                              '&:hover': {
                                backgroundColor: isOwnDesign ? colors.error + '20' : 'transparent',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell 
                colSpan={showUserIdColumn ? 6 : 5}
                sx={{ 
                  textAlign: 'center', 
                  py: spacing[8],
                  color: colors.text.secondary,
                  fontStyle: 'italic',
                }}
              >
                <Typography 
                  variant="body1"
                  sx={{
                    fontFamily: typography.fontFamily.secondary,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  No designs found. Create your first design to get started!
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NotebookTable;