// src/components/Chatbot/ModernChatbotRequestsTable.tsx
import React from 'react';
import { ModernTable, TableColumn, StatusChip, DateCell, TextCell, CourseHyperlink, MaterialHyperlink } from '../common';
import { ChatbotRequest } from '../../types/chatbot';
import { Box, Link } from '@mui/material';
import { colors } from '../../config/designSystem';

interface ModernChatbotRequestsTableProps {
  requests: ChatbotRequest[];
  loading?: boolean;
}

const ModernChatbotRequestsTable: React.FC<ModernChatbotRequestsTableProps> = ({
  requests,
  loading = false,
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
      width: '25%',
      render: (value: string) => (
        <TextCell text={value} maxLength={50} weight="semibold" />
      ),
    },
    {
      id: 'courseNumber',
      label: 'Course',
      width: '20%',
      render: (value: string, row: ChatbotRequest) => (
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
      id: 'materialTitle',
      label: 'Material',
      width: '20%',
      render: (value: string, row: ChatbotRequest) => (
        value && row.materialId ? (
          <MaterialHyperlink
            materialId={row.materialId}
            materialTitle={value}
            variant="link"
            maxTitleLength={999}
          />
        ) : (
          <TextCell text="N/A" variant="secondary" />
        )
      ),
    },
    {
      id: 'timestamp',
      label: 'Submitted',
      width: '15%',
      render: (value: string) => (
        <DateCell date={new Date(value)} format="full" />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      width: '10%',
      render: (value: string) => (
        <StatusChip label={value} status={getStatusType(value)} />
      ),
    },
    {
      id: 'files',
      label: 'Files',
      width: '10%',
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
                  fontSize: '0.75rem',
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
            <TextCell text={`+${value.length - 2} more`} variant="secondary" />
          )}
        </Box>
      ),
    },
  ];

  return (
    <ModernTable
      data={requests}
      columns={columns}
      loading={loading}
      emptyMessage="No chatbot requests found. Submit your first request to get started!"
      maxHeight="600px"
      stickyHeader={true}
    />
  );
};

export default ModernChatbotRequestsTable;
