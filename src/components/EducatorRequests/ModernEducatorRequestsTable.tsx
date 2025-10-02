// src/components/EducatorRequests/ModernEducatorRequestsTable.tsx
import React from 'react';
import { ModernTable, TableColumn, TextCell, StatusChip, DateCell, ActionButtons, CommonActionIcons, CopyableUserID, CourseHyperlink } from '../common';
import { colors } from '../../config/designSystem';

interface EducatorRequest {
  id: string;
  firstName: string;
  lastName: string;
  uid: string;
  institution: string;
  email: string;
  courseNumber: string;
  courseTitle: string;
  courseDescription: string;
  requestType: 'primary' | 'co-instructor';
  timestamp: { seconds: number; nanoseconds: number };
  status: 'pending' | 'approved' | 'denied';
  courseId?: string; // Optional, added when request is approved
}

interface ModernEducatorRequestsTableProps {
  requests: EducatorRequest[];
  loading?: boolean;
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
}

const ModernEducatorRequestsTable: React.FC<ModernEducatorRequestsTableProps> = ({
  requests,
  loading = false,
  onApprove,
  onDeny,
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

  const columns: TableColumn<EducatorRequest>[] = [
    {
      id: 'firstName',
      label: 'Name',
      width: '15%',
      render: (value: string, row: EducatorRequest) => (
        <TextCell text={`${value} ${row.lastName}`} weight="semibold" />
      ),
    },
    {
      id: 'uid',
      label: 'User ID',
      width: '15%',
      render: (value: string) => (
        <CopyableUserID 
          userId={value} 
          userType="student"
        />
      ),
    },
    {
      id: 'institution',
      label: 'Institution',
      width: '15%',
      render: (value: string) => (
        <TextCell text={value} maxLength={30} />
      ),
    },
    {
      id: 'email',
      label: 'Email',
      width: '15%',
      render: (value: string) => (
        <TextCell text={value} maxLength={30} variant="monospace" />
      ),
    },
    {
      id: 'courseNumber',
      label: 'Course',
      width: '15%',
      render: (value: string, row: EducatorRequest) => (
        <CourseHyperlink
          courseId={row.courseId || ''}
          courseNumber={value}
          courseTitle={row.courseTitle}
          variant="link"
          maxTitleLength={30}
        />
      ),
    },
    {
      id: 'timestamp',
      label: 'Submitted',
      width: '12%',
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
      render: (value: any, row: EducatorRequest) => {
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
      emptyMessage="No educator permission requests found."
      stickyHeader={true}
    />
  );
};

export default ModernEducatorRequestsTable;
