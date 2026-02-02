// src/components/SA_CourseManagement/ModernSuperAdminCourseTable.tsx
import React from 'react';
import { ModernTable, TableColumn, TextCell, ActionButtons, CommonActionIcons, CourseHyperlink, CopyableUserID, CopyableCourseID } from '../common';
import { Box, Chip, Switch, Tooltip } from '@mui/material';
import { Public as PublicIcon } from '@mui/icons-material';
import { colors, typography, spacing } from '../../config/designSystem';

interface Course {
  id: string;
  number: string;
  title: string;
  courseAdmin: string[];
  isPublic?: boolean;
  createdAt?: Date;
  courseCreatedAt?: Date;
  timestamp?: Date;
}

interface ModernSuperAdminCourseTableProps {
  courses: Course[];
  loading?: boolean;
  onAddSuperAdmin: (courseId: string) => void;
  onDeleteCourse: (courseId: string) => void;
  onTogglePublic: (courseId: string) => void;
  userUid?: string;
}

const ModernSuperAdminCourseTable: React.FC<ModernSuperAdminCourseTableProps> = ({
  courses,
  loading = false,
  onAddSuperAdmin,
  onDeleteCourse,
  onTogglePublic,
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

  const renderCreatedDate = (course: Course) => {
    const createdDate = course.courseCreatedAt || course.createdAt || course.timestamp;
    
    if (!createdDate) {
      return <TextCell text="Unknown" variant="secondary" />;
    }

    const formattedDate = createdDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return <TextCell text={formattedDate} />;
  };

  const columns: TableColumn<Course>[] = [
    {
      id: 'number',
      label: 'Course',
      width: '25%',
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
            {row.isPublic && (
              <Chip
                icon={<PublicIcon sx={{ fontSize: 14, color: `${colors.warning} !important` }} />}
                label="PUBLIC"
                size="small"
                sx={{
                  backgroundColor: colors.warning + '20',
                  color: colors.warning,
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
      width: '12%',
      render: (value: string) => (
        <CopyableCourseID courseId={value} />
      ),
    },
    {
      id: 'isPublic',
      label: 'Public Access',
      width: '10%',
      align: 'center',
      render: (value: boolean | undefined, row: Course) => (
        <Tooltip 
          title={row.isPublic 
            ? 'Click to make this course private' 
            : 'Click to make this course public (visible to all users)'
          }
        >
          <Switch
            checked={row.isPublic || false}
            onChange={() => onTogglePublic(row.id)}
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: colors.warning,
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: colors.warning,
              },
            }}
          />
        </Tooltip>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created',
      width: '18%',
      render: (value: unknown, row: Course) => renderCreatedDate(row),
    },
    {
      id: 'courseAdmin',
      label: 'Course Admins',
      width: '20%',
      render: (value: string[]) => renderCourseAdmins(value),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: '15%',
      align: 'center',
      render: (value: unknown, row: Course) => {
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
