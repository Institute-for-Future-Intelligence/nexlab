// src/components/LaboratoryNotebookV2/FileAttachmentsList.tsx
import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  Code as CodeIcon,
  Archive as ArchiveIcon,
  Download as DownloadIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';
import { FileDetails } from '../../types/types';

interface FileAttachmentsListProps {
  files: FileDetails[];
}

// Utility: Get file icon based on type
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return <PdfIcon sx={{ color: '#D32F2F' }} />;
    case 'doc':
    case 'docx':
      return <DocIcon sx={{ color: '#1976D2' }} />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <ExcelIcon sx={{ color: '#2E7D32' }} />;
    case 'txt':
    case 'md':
      return <DocIcon sx={{ color: colors.text.secondary }} />;
    case 'json':
    case 'xml':
    case 'html':
    case 'css':
    case 'js':
    case 'ts':
      return <CodeIcon sx={{ color: '#F57C00' }} />;
    case 'zip':
    case 'rar':
    case '7z':
      return <ArchiveIcon sx={{ color: '#5E35B1' }} />;
    default:
      return <FileIcon sx={{ color: colors.text.tertiary }} />;
  }
};

const FileAttachmentsList: React.FC<FileAttachmentsListProps> = ({ files }) => {
  const handleDownload = (file: FileDetails) => {
    // Open in new tab for download
    window.open(file.url, '_blank');
  };

  const handleOpen = (file: FileDetails) => {
    // Open in new tab for preview (works well for PDFs, images, text files)
    window.open(file.url, '_blank');
  };

  if (!files || files.length === 0) {
    return (
      <Box
        sx={{
          border: `2px dashed ${colors.neutral[300]}`,
          borderRadius: borderRadius.lg,
          p: spacing[4],
          textAlign: 'center',
          backgroundColor: colors.background.secondary,
        }}
      >
        <FileIcon sx={{ fontSize: 36, color: colors.text.tertiary, mb: spacing[1] }} />
        <Typography
          variant="body2"
          sx={{
            color: colors.text.tertiary,
            fontSize: typography.fontSize.sm,
          }}
        >
          No files attached
        </Typography>
      </Box>
    );
  }

  return (
    <List
      sx={{
        border: `1px solid ${colors.neutral[200]}`,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.background.secondary,
        overflow: 'hidden',
      }}
    >
      {files.map((file, index) => (
        <ListItem
          key={file.id || index}
          sx={{
            borderBottom: index < files.length - 1 ? `1px solid ${colors.neutral[200]}` : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: colors.neutral[50],
            },
          }}
          onClick={() => handleOpen(file)}
        >
          <ListItemIcon>
            {getFileIcon(file.name)}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  '&:hover': {
                    color: colors.primary[600],
                  },
                }}
              >
                {file.name}
              </Typography>
            }
            secondary={
              <Typography
                variant="caption"
                sx={{
                  color: colors.text.tertiary,
                }}
              >
                {file.name.split('.').pop()?.toUpperCase()} file • Click to open
              </Typography>
            }
          />
          <ListItemSecondaryAction>
            <Box sx={{ display: 'flex', gap: spacing[1] }}>
              <Tooltip title="Open in new tab">
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpen(file);
                  }}
                  sx={{
                    color: colors.primary[500],
                    '&:hover': {
                      backgroundColor: colors.primary[50],
                    },
                  }}
                >
                  <OpenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(file);
                  }}
                  sx={{
                    color: colors.secondary[500],
                    '&:hover': {
                      backgroundColor: colors.secondary[50],
                    },
                  }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default FileAttachmentsList;

