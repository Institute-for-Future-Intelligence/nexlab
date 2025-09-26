// src/components/SA_Chatbot/ModernSuperAdminChatbotRequestsTable.tsx
import React, { useState } from 'react';
import { ModernTable, TableColumn, StatusChip, DateCell, TextCell, ActionButtons, CommonActionIcons, CopyableUserID } from '../common';
import { Box, Link, TextField, TablePagination } from '@mui/material';
import { colors, typography, spacing } from '../../config/designSystem';
import { ChatbotRequest } from '../../types/chatbot';

interface ModernSuperAdminChatbotRequestsTableProps {
  requests: ChatbotRequest[];
  loading?: boolean;
  onApprove: (requestId: string, chatbotId: string) => void;
  chatbotIdMap: { [key: string]: string };
  onChatbotIdChange: (requestId: string, chatbotId: string) => void;
}

const ModernSuperAdminChatbotRequestsTable: React.FC<ModernSuperAdminChatbotRequestsTableProps> = ({
  requests,
  loading = false,
  onApprove,
  chatbotIdMap,
  onChatbotIdChange,
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

  const columns: TableColumn<ChatbotRequest>[] = [
    {
      id: 'title',
      label: 'Title',
      width: '15%',
      render: (value: string) => (
        <TextCell text={value} maxLength={40} weight="semibold" />
      ),
    },
    {
      id: 'courseNumber',
      label: 'Course',
      width: '12%',
      render: (value: string, row: ChatbotRequest) => (
        <TextCell text={`${value} - ${row.courseTitle}`} maxLength={30} />
      ),
    },
    {
      id: 'materialTitle',
      label: 'Material',
      width: '12%',
      render: (value: string) => (
        value ? (
          <TextCell text={value} maxLength={25} />
        ) : (
          <TextCell text="N/A" variant="secondary" />
        )
      ),
    },
    {
      id: 'educatorId',
      label: 'Educator',
      width: '10%',
      render: (value: string) => (
        <CopyableUserID userId={value} userType="educator" />
      ),
    },
    {
      id: 'courseId',
      label: 'Course ID',
      width: '8%',
      render: (value: string) => (
        <TextCell text={value} variant="monospace" maxLength={15} />
      ),
    },
    {
      id: 'materialId',
      label: 'Material ID',
      width: '8%',
      render: (value: string) => (
        value ? (
          <TextCell text={value} variant="monospace" maxLength={15} />
        ) : (
          <TextCell text="N/A" variant="secondary" />
        )
      ),
    },
    {
      id: 'timestamp',
      label: 'Submitted',
      width: '8%',
      render: (value: string) => (
        <DateCell date={new Date(value)} format="short" />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      width: '7%',
      render: (value: string) => (
        <StatusChip label={value} status={getStatusType(value)} />
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
      width: '10%',
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
              },
            }}
          />
        ) : value ? (
          <TextCell text={value} variant="monospace" maxLength={15} />
        ) : (
          <TextCell text="Not assigned" variant="secondary" />
        );
      },
    },
    {
      id: 'actions',
      label: 'Action',
      width: '7%',
      align: 'center',
      render: (value: any, row: ChatbotRequest) => {
        const isPending = row.status === 'pending';
        const hasChatbotId = chatbotIdMap[row.id]?.trim();
        return isPending ? (
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
        ) : (
          <TextCell text="Processed" variant="secondary" />
        );
      },
    },
  ];

  return (
    <ModernTable
      data={requests}
      columns={columns}
      loading={loading}
      emptyMessage="No chatbot requests found."
      maxHeight="700px"
      stickyHeader={true}
    />
  );
};

export default ModernSuperAdminChatbotRequestsTable;
