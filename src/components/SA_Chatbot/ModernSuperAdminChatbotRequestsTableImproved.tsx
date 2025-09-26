// src/components/SA_Chatbot/ModernSuperAdminChatbotRequestsTableImproved.tsx
import React, { useState } from 'react';
import { 
  ModernTable, 
  TableColumn, 
  StatusChip, 
  DateCell, 
  TextCell, 
  ActionButtons, 
  CommonActionIcons,
  CopyableUserID,
  CourseHyperlink,
  MaterialHyperlink,
  CopyableChatbotID,
  CopyableCourseID,
  CopyableMaterialID
} from '../common';
import { Box, Link, TextField, TablePagination, Paper } from '@mui/material';
import { colors, typography, spacing } from '../../config/designSystem';
import { ChatbotRequest } from '../../types/chatbot';

interface ModernSuperAdminChatbotRequestsTableImprovedProps {
  requests: ChatbotRequest[];
  loading?: boolean;
  onApprove: (requestId: string, chatbotId: string) => void;
  chatbotIdMap: { [key: string]: string };
  onChatbotIdChange: (requestId: string, chatbotId: string) => void;
}

const ModernSuperAdminChatbotRequestsTableImproved: React.FC<ModernSuperAdminChatbotRequestsTableImprovedProps> = ({
  requests,
  loading = false,
  onApprove,
  chatbotIdMap,
  onChatbotIdChange,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const getStatusLabel = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getActionLabel = (status: string, hasChatbotId: boolean): string => {
    if (status === 'approved') return 'Approved';
    if (status === 'denied') return 'Denied';
    if (!hasChatbotId) return 'Enter ID';
    return 'Approve';
  };

  const columns: TableColumn<ChatbotRequest>[] = [
    {
      id: 'title',
      label: 'Title',
      width: '15%',
      render: (value: string) => (
        <TextCell text={value} maxLength={999} weight="semibold" />
      ),
    },
    {
      id: 'courseNumber',
      label: 'Course',
      width: '18%',
      render: (value: string, row: ChatbotRequest) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
          <CourseHyperlink
            courseId={row.courseId}
            courseNumber={value}
            courseTitle={row.courseTitle}
            variant="link"
            maxTitleLength={999}
          />
          <CopyableCourseID courseId={row.courseId} />
        </Box>
      ),
    },
    {
      id: 'materialTitle',
      label: 'Material',
      width: '15%',
      render: (value: string, row: ChatbotRequest) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
          {value && row.materialId ? (
            <MaterialHyperlink
              materialId={row.materialId}
              materialTitle={value}
              variant="link"
              maxTitleLength={999}
            />
          ) : (
            <TextCell text="N/A" variant="secondary" />
          )}
          {row.materialId && (
            <CopyableMaterialID materialId={row.materialId} />
          )}
        </Box>
      ),
    },
    {
      id: 'educatorId',
      label: 'Educator',
      width: '12%',
      render: (value: string) => (
        <CopyableUserID
          userId={value}
          userType="educator"
        />
      ),
    },
    {
      id: 'timestamp',
      label: 'Submitted',
      width: '10%',
      render: (value: string) => (
        <DateCell date={new Date(value)} format="full" />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      width: '8%',
      render: (value: string) => (
        <StatusChip label={getStatusLabel(value)} status={getStatusType(value)} />
      ),
    },
    {
      id: 'files',
      label: 'Files',
      width: '8%',
      render: (value: string[]) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {value && value.length > 0 ? (
            value.slice(0, 2).map((link, index) => (
              <Link
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontSize: '0.7rem',
                  color: colors.primary[600],
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                File {index + 1}
              </Link>
            ))
          ) : (
            <TextCell text="No files" variant="secondary" />
          )}
          {value && value.length > 2 && (
            <TextCell text={`+${value.length - 2}`} variant="secondary" />
          )}
        </Box>
      ),
    },
    {
      id: 'chatbotId',
      label: 'Chatbot ID',
      width: '12%',
      render: (value: string, row: ChatbotRequest) => {
        const isPending = row.status === 'pending';
        return isPending ? (
          <TextField
            size="small"
            variant="outlined"
            placeholder="Enter ID"
            value={chatbotIdMap[row.id] || ''}
            onChange={(e) => onChatbotIdChange(row.id, e.target.value)}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                fontSize: typography.fontSize.xs,
                height: '32px',
                fontFamily: 'monospace',
              },
            }}
          />
        ) : value ? (
          <CopyableChatbotID
            chatbotId={value}
          />
        ) : (
          <TextCell text="Not assigned" variant="secondary" />
        );
      },
    },
    {
      id: 'actions',
      label: 'Action',
      width: '8%',
      align: 'center',
      render: (value: unknown, row: ChatbotRequest) => {
        const isPending = row.status === 'pending';
        const hasChatbotId = chatbotIdMap[row.id]?.trim();
        
        if (!isPending) {
          return (
            <TextCell 
              text={getActionLabel(row.status, false)} 
              variant="secondary" 
              weight="medium"
            />
          );
        }

        return (
          <ActionButtons
            actions={[
              {
                icon: CommonActionIcons.add,
                tooltip: hasChatbotId ? 'Approve Request' : 'Enter Chatbot ID first',
                onClick: () => onApprove(row.id, chatbotIdMap[row.id]),
                disabled: !hasChatbotId,
                color: colors.success,
                hoverColor: colors.success + '20',
              },
            ]}
          />
        );
      },
    },
  ];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get current page data
  const paginatedRequests = requests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <ModernTable
        data={paginatedRequests}
        columns={columns}
        loading={loading}
        emptyMessage="No chatbot requests found."
        stickyHeader={false}
      />
      
      {/* Pagination */}
      {requests.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 0,
            borderTop: `1px solid ${colors.neutral[200]}`,
          }}
        >
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={requests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '& .MuiTablePagination-toolbar': {
                paddingLeft: spacing[4],
                paddingRight: spacing[4],
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: colors.text.secondary,
                fontSize: typography.fontSize.sm,
              },
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ModernSuperAdminChatbotRequestsTableImproved;
