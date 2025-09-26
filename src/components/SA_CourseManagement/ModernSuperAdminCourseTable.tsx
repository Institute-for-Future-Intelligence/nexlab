// src/components/SA_CourseManagement/ModernSuperAdminCourseTable.tsx
import React from 'react';
import { ModernTable, TableColumn, TextCell, ActionButtons, CommonActionIcons, CourseHyperlink, CopyableUserID, CopyableCourseID } from '../common';
import { Box, Chip } from '@mui/material';
import { colors, typography, spacing } from '../../config/designSystem';

interface Course {
  id: string;
  number: string;
  title: string;
  courseAdmin: string[];
}

interface ModernSuperAdminCourseTableProps {
  courses: Course[];
  loading?: boolean;
  onAddSuperAdmin: (courseId: string) => void;
  onDeleteCourse: (courseId: string) => void;
  userUid?: string;
}

const ModernSuperAdminCourseTable: React.FC<ModernSuperAdminCourseTableProps> = ({
  courses,
  loading = false,
  onAddSuperAdmin,
  onDeleteCourse,
  userUid,
}) => {
  const isCourseAdmin = (course: Course): boolean => {
    return !!userUid && course.courseAdmin.includes(userUid);
  };

  const renderCourseAdmins = (courseAdmin: string[]) => {
    if (courseAdmin.length === 0) {
      return (
        <TextCell text="No admins assigned" variant="secondary" />
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
        {courseAdmin.map((adminId, index) => (
          <CopyableUserID
            key={index}
            userId={adminId}
            userType="educator"
          />
        ))}
      </Box>
    );
  };

  const columns: TableColumn<Course>[] = [
    {
      id: 'number',
      label: 'Course',
      width: '35%',
      render: (value: string, row: Course) => {
        const isAdmin = isCourseAdmin(row);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <CourseHyperlink
              courseId={row.id}
              courseNumber={value}
              courseTitle={row.title}
              variant="link"
              maxTitleLength={999}
            />
            {isAdmin && (
              <Chip
                label="ADMIN"
                size="small"
                sx={{
                  backgroundColor: colors.success,
                  color: colors.text.inverse,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.bold,
                  height: '20px',
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      id: 'id',
      label: 'Course ID',
      width: '20%',
      render: (value: string) => (
        <CopyableCourseID courseId={value} />
      ),
    },
    {
      id: 'courseAdmin',
      label: 'Course Admins',
      width: '25%',
      render: (value: string[]) => renderCourseAdmins(value),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: '15%',
      align: 'center',
      render: (value: any, row: Course) => {
        const isAdmin = isCourseAdmin(row);
        return (
          <ActionButtons
            actions={[
              {
                icon: CommonActionIcons.add,
                tooltip: isAdmin ? 'Already an instructor' : 'Add yourself as an instructor',
                onClick: () => onAddSuperAdmin(row.id),
                disabled: isAdmin,
                color: colors.success,
                hoverColor: colors.success + '20',
              },
              {
                icon: CommonActionIcons.delete,
                tooltip: isAdmin ? 'Delete this course' : 'You are not authorized to delete this course',
                onClick: () => onDeleteCourse(row.id),
                disabled: !isAdmin,
                color: colors.error,
                hoverColor: colors.error + '20',
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <ModernTable
      data={courses}
      columns={columns}
      loading={loading}
      emptyMessage="No courses found."
      stickyHeader={false}
      showRowNumbers={true}
    />
  );
};

export default ModernSuperAdminCourseTable;
