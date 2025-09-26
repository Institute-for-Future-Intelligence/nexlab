// src/components/CourseRequests/ModernCourseRequestsTable.tsx
import React from 'react';
import { ModernTable, TableColumn, TextCell, StatusChip, DateCell, ActionButtons, CommonActionIcons, CopyableUserID, CourseHyperlink } from '../common';
import { Box, Tooltip, IconButton } from '@mui/material';
import { Description as SyllabusIcon } from '@mui/icons-material';
import { colors } from '../../config/designSystem';

interface CourseRequest {
  id: string;
  uid: string;
  courseNumber: string;
  courseTitle: string;
  courseDescription: string;
  timestamp: { seconds: number; nanoseconds: number };
  status: 'pending' | 'approved' | 'denied';
  syllabusImported?: boolean;
  syllabusData?: Record<string, unknown>;
}

interface ModernCourseRequestsTableProps {
  requests: CourseRequest[];
  loading?: boolean;
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
  onViewSyllabus?: (request: CourseRequest) => void;
}

const ModernCourseRequestsTable: React.FC<ModernCourseRequestsTableProps> = ({
  requests,
  loading = false,
  onApprove,
  onDeny,
  onViewSyllabus,
}) => {
  const getStatusType = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'denied':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCreationMethod = (request: CourseRequest): string => {
    return request.syllabusImported ? 'Syllabus Import' : 'Manual Creation';
  };

  const columns: TableColumn<CourseRequest>[] = [
    {
      id: 'uid',
      label: 'Educator ID',
      width: '15%',
      render: (value: string) => (
        <CopyableUserID 
          userId={value} 
          userType="educator"
        />
      ),
    },
    {
      id: 'courseNumber',
      label: 'Course',
      width: '25%',
      render: (value: string, row: CourseRequest) => (
        <CourseHyperlink
          courseId={row.id || ''}
          courseNumber={value}
          courseTitle={row.courseTitle}
          variant="link"
          maxTitleLength={35}
        />
      ),
    },
    {
      id: 'courseDescription',
      label: 'Description',
      width: '20%',
      render: (value: string) => (
        <TextCell text={value} maxLength={60} variant="secondary" />
      ),
    },
    {
      id: 'syllabusImported',
      label: 'Creation Method',
      width: '12%',
      render: (value: boolean, row: CourseRequest) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextCell text={getCreationMethod(row)} />
          {value && onViewSyllabus && (
            <Tooltip title="View Syllabus Data">
              <IconButton
                size="small"
                onClick={() => onViewSyllabus(row)}
                sx={{
                  color: colors.primary[600],
                  '&:hover': {
                    backgroundColor: colors.primary[100],
                  },
                }}
              >
                <SyllabusIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      id: 'timestamp',
      label: 'Submitted',
      width: '10%',
      render: (value: { seconds: number; nanoseconds: number }) => (
        <DateCell date={new Date(value.seconds * 1000)} format="full" />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      width: '8%',
      render: (value: string) => (
        <StatusChip label={value} status={getStatusType(value)} />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: '10%',
      align: 'center',
      render: (value: unknown, row: CourseRequest) => {
        const isPending = row.status === 'pending';
        return (
          <ActionButtons
            actions={[
              {
                icon: CommonActionIcons.add,
                tooltip: isPending ? 'Approve Request' : 'Already processed',
                onClick: () => onApprove(row.id),
                disabled: !isPending,
                color: colors.success,
                hoverColor: colors.success + '20',
              },
              {
                icon: CommonActionIcons.delete,
                tooltip: isPending ? 'Deny Request' : 'Already processed',
                onClick: () => onDeny(row.id),
                disabled: !isPending,
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
      data={requests}
      columns={columns}
      loading={loading}
      emptyMessage="No course creation requests found."
      stickyHeader={false}
    />
  );
};

export default ModernCourseRequestsTable;
