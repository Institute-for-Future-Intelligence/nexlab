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
  Chip,
  Box,
  Typography,
  Avatar,
} from '@mui/material';

import { Timestamp, FieldValue } from 'firebase/firestore';
import { Design } from '../../types/types'; // Import the Design interface
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../config/designSystem';

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
  // Function to format Firestore timestamp to a readable format
  const formatDate = (value: Timestamp | Date | FieldValue | null): string => {
    if (!value) return 'N/A';

    // If value is a Timestamp
    if (value instanceof Timestamp) {
      const date = value.toDate();
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }

    // If value is a Date
    if (value instanceof Date) {
      return value.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
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
            <TableCell sx={{ width: showUserIdColumn ? '30%' : '35%' }}>Design Title</TableCell>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          backgroundColor: colors.primary[100],
                          color: colors.primary[700],
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                        }}
                      >
                        {design.title.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontFamily: typography.fontFamily.secondary,
                          fontSize: typography.fontSize.base,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.text.primary,
                          cursor: 'pointer',
                          '&:hover': {
                            color: colors.primary[600],
                            textDecoration: 'underline',
                          },
                        }}
                        onClick={() => handleEdit(design.id)}
                      >
                        {design.title}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Course */}
                  <TableCell>
                    {courseInfo ? (
                      <Chip
                        label={`${courseInfo.number}`}
                        size="small"
                        sx={{
                          backgroundColor: colors.secondary[100],
                          color: colors.secondary[700],
                          fontFamily: typography.fontFamily.secondary,
                          fontWeight: typography.fontWeight.medium,
                          fontSize: typography.fontSize.sm,
                        }}
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
                      <Typography 
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: typography.fontSize.sm,
                          color: colors.text.secondary,
                          wordBreak: 'break-all', // Allow long IDs to wrap
                        }}
                      >
                        {design.userId}
                      </Typography>
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
                <Typography variant="body1">
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