// src/components/ChatbotConversations/ModernConversationsTable.tsx
import React from 'react';
import { ModernTable, TableColumn, DateCell, TextCell, ActionButtons, CommonActionIcons, CopyableUserID, CopyableChatbotID, CopyableConversationID } from '../common';
import { colors } from '../../config/designSystem';

interface Conversation {
  id: string;
  userId: string;
  chatbotId: string;
  startedAt: string;
}

interface ModernConversationsTableProps {
  conversations: Conversation[];
  loading?: boolean;
  onViewHistory: (chatbotId: string, conversationId: string, metadata: { userId: string; startedAt: string }) => void;
  onDeleteConversation: (conversationId: string) => void;
  loadingMap: { [key: string]: boolean };
}

const ModernConversationsTable: React.FC<ModernConversationsTableProps> = ({
  conversations,
  loading = false,
  onViewHistory,
  onDeleteConversation,
  loadingMap,
}) => {
  const columns: TableColumn<Conversation>[] = [
    {
      id: 'id',
      label: 'Conversation ID',
      width: '25%',
      render: (value: string) => (
        <CopyableConversationID conversationId={value} />
      ),
    },
    {
      id: 'userId',
      label: 'User ID',
      width: '25%',
      render: (value: string) => (
        <CopyableUserID userId={value} userType="student" />
      ),
    },
    {
      id: 'chatbotId',
      label: 'Chatbot ID',
      width: '25%',
      render: (value: string) => (
        <CopyableChatbotID chatbotId={value} />
      ),
    },
    {
      id: 'startedAt',
      label: 'Started At',
      width: '15%',
      render: (value: string) => (
        <DateCell date={new Date(value)} format="full" />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: '10%',
      align: 'center',
      render: (value: any, row: Conversation) => {
        const isLoading = loadingMap[row.id];
        return (
          <ActionButtons
            actions={[
              {
                icon: CommonActionIcons.view,
                tooltip: isLoading ? 'Loading...' : 'View Conversation History',
                onClick: () => onViewHistory(row.chatbotId, row.id, {
                  userId: row.userId,
                  startedAt: row.startedAt,
                }),
                disabled: isLoading,
                color: colors.primary[600],
                hoverColor: colors.primary[100],
              },
              {
                icon: CommonActionIcons.delete,
                tooltip: isLoading ? 'Loading...' : 'Delete Conversation',
                onClick: () => onDeleteConversation(row.id),
                disabled: isLoading,
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
      data={conversations}
      columns={columns}
      loading={loading}
      emptyMessage="No conversations available to display."
      stickyHeader={false}
      showRowNumbers={true}
    />
  );
};

export default ModernConversationsTable;
