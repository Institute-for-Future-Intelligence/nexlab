// NotebookTable.tsx
import React from 'react';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// import VisibilityIcon from '@mui/icons-material/Visibility'; 
// Import the visibility icon

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
} from '@mui/material';

import { Timestamp, FieldValue } from 'firebase/firestore';
import { Design } from '../../types/types'; // Import the Design interface

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
    <TableContainer component={Paper}>
      <Table sx={{ '& .MuiTableCell-root': { fontSize: '1rem' }, '& .MuiTableCell-head': { fontSize: '1.2rem', backgroundColor: '#1A76D3', color: "white"} }}>
        <TableHead>
          <TableRow sx={{ height: '60px' }}> 
            <TableCell sx={{ fontWeight: 'bold', width: showUserIdColumn ? '30%' : '40%' }}>Title</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Course</TableCell>
            {showUserIdColumn && <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>User ID</TableCell>}
            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Created</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Last Edited</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Edit</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {designs && designs.length > 0 ? (
            designs.map((design) => {
              const isOwnDesign = design.userId === userDetails?.uid;
              return (
                <TableRow key={design.id} sx={{ height: '80px' }}>
                  <TableCell>
                    <button onClick={() => handleEdit(design.id)} className="hyperlink-style">{design.title}</button>
                  </TableCell>
                  <TableCell>
                    {design.course && userDetails?.classes && userDetails.classes[design.course]
                      ? `${userDetails.classes[design.course].number} - ${userDetails.classes[design.course].title}`
                      : 'N/A'}
                  </TableCell>
                  {showUserIdColumn && <TableCell>{design.userId}</TableCell>}
                  <TableCell>{formatDate(design.dateCreated)}</TableCell>
                  <TableCell>{formatDate(design.dateModified)}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <span>
                        <IconButton onClick={() => isOwnDesign && handleEdit(design.id)} color="primary" disabled={!isOwnDesign}>
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Delete">
                      <span>
                        <IconButton onClick={() => isOwnDesign && handleDelete(design.id)} color="error" disabled={!isOwnDesign}>
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={showUserIdColumn ? 6 : 5}>No Designs Found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NotebookTable;