// src/components/UserPermissions/ModernUserTable.tsx
import React from 'react';
import { ModernTable, TableColumn, CopyableUserID, UserStatusChip, DateCell, CourseHyperlink } from '../common';
import { Box } from '@mui/material';
import { colors, typography, spacing } from '../../config/designSystem';

interface User {
  id: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  lastLogin?: any;
  classes?: Record<string, { number: string; title: string; isCourseAdmin?: boolean }>;
}

interface ModernUserTableProps {
  users: User[];
  loading?: boolean;
}

const ModernUserTable: React.FC<ModernUserTableProps> = ({
  users,
  loading = false,
}) => {
  const getUserType = (user: User): 'superAdmin' | 'educator' | 'student' => {
    if (user.isSuperAdmin) return 'superAdmin';
    if (user.isAdmin) return 'educator';
    return 'student';
  };

  const renderCourses = (classes: Record<string, { number: string; title: string; isCourseAdmin?: boolean }> | undefined) => {
    if (!classes || Object.keys(classes).length === 0) {
      return (
        <Box sx={{ fontStyle: 'italic', color: colors.text.disabled }}>
          None
        </Box>
      );
    }

    const courseEntries = Object.entries(classes);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
        {courseEntries.map(([courseId, course]) => (
          <CourseHyperlink
            key={courseId}
            courseId={courseId}
            courseNumber={course.number}
            courseTitle={course.title}
            variant="link"
            maxTitleLength={999}
          />
        ))}
      </Box>
    );
  };

  const columns: TableColumn<User>[] = [
    {
      id: 'id',
      label: 'User ID',
      width: '25%',
      render: (value: string, row: User) => (
        <CopyableUserID 
          userId={value} 
          userType={getUserType(row)}
        />
      ),
    },
    {
      id: 'isAdmin',
      label: 'Status',
      width: '15%',
      render: (value: boolean, row: User) => (
        <UserStatusChip 
          status={getUserType(row)}
        />
      ),
    },
    {
      id: 'lastLogin',
      label: 'Last Login',
      width: '20%',
      render: (value: any) => (
        <DateCell date={value} format="full" />
      ),
    },
    {
      id: 'classes',
      label: 'Courses',
      width: '40%',
      render: (value: Record<string, { number: string; title: string; isCourseAdmin?: boolean }> | undefined) => 
        renderCourses(value),
    },
  ];

  return (
    <ModernTable
      data={users}
      columns={columns}
      loading={loading}
      emptyMessage="No users found."
      showRowNumbers={true}
    />
  );
};

export default ModernUserTable;
