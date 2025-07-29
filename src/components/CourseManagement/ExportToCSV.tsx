// src/components/ExportToCSV.tsx
import React from 'react';
import { Button, Box } from '@mui/material';
import { FirebaseTimestamp, formatFirebaseTimestamp } from '../../types/firebase'; // Import proper types

interface StudentData {
  uid?: string; // Use uid instead of id to match UserDetails
  id?: string; // Keep id as optional for compatibility  
  classes?: Record<string, { number: string; title: string; isCourseAdmin?: boolean }>;
  lastLogin?: FirebaseTimestamp; // Now properly typed
}

interface ExportToCSVProps {
  students: StudentData[];
  selectedCourse: string;
}

const ExportToCSV: React.FC<ExportToCSVProps> = ({ students, selectedCourse }) => {
  const handleExport = () => {
    if (students.length > 0) {
      // Define the CSV headers
      const headers = ['User ID', 'Courses', 'Last Login'];

      // Map student data to CSV format with proper handling of date and time
      const csvRows = students.map((student) => [
        `"${student.id || student.uid}"`, // Use id or uid, handle both for compatibility
        `"${student.classes ? Object.values(student.classes).map((c) => `${c.number} - ${c.title}`).join(', ') : 'None'}"`, // Handle new structure for classes
        `"${formatFirebaseTimestamp(student.lastLogin)}"`, // Type-safe date formatting
      ]);

      // Combine headers and rows with comma separation and line breaks
      const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

      // Create a blob and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedCourse}_students.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleExport}
        disabled={students.length === 0}
        sx={{
          background: 'linear-gradient(45deg, #3f51b5 30%, #1e88e5 90%)',
          borderRadius: 3,
          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          color: 'white',
          padding: '0 30px',
          fontSize: '16px',
          fontWeight: 'bold',
          textTransform: 'none',
          '&:hover': {
            background: 'linear-gradient(45deg, #1e88e5 30%, #3f51b5 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          },
        }}
      >
        Export as CSV
      </Button>
    </Box>
  );
};

export default ExportToCSV;