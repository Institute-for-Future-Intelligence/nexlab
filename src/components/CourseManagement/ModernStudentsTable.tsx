// src/components/CourseManagement/ModernStudentsTable.tsx
import React from 'react';
import { ModernTable, TableColumn, CopyableUserID, DateCell } from '../common';
import { FirebaseTimestamp } from '../../types/firebase';

interface Student {
  uid: string;
  lastLogin?: FirebaseTimestamp;
}

interface ModernStudentsTableProps {
  students: Student[];
  loading?: boolean;
}

const ModernStudentsTable: React.FC<ModernStudentsTableProps> = ({
  students,
  loading = false,
}) => {
  const columns: TableColumn<Student>[] = [
    {
      id: 'uid',
      label: 'Student ID',
      width: '60%',
      render: (value: string) => (
        <CopyableUserID 
          userId={value} 
          userType="student"
        />
      ),
    },
    {
      id: 'lastLogin',
      label: 'Last Login',
      width: '40%',
      render: (value: FirebaseTimestamp) => (
        <DateCell date={value} format="full" />
      ),
    },
  ];

  return (
    <ModernTable
      data={students}
      columns={columns}
      loading={loading}
      emptyMessage="No students are currently enrolled in this course."
      showRowNumbers={true}
    />
  );
};

export default ModernStudentsTable;
