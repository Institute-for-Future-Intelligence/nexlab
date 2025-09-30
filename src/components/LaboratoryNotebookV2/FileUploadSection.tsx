// src/components/LaboratoryNotebookV2/FileUploadSection.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  Code as CodeIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { getStorage, ref as firebaseRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/designSystem';
import { FileDetails } from '../../types/types';

interface FileUploadSectionProps {
  files: FileDetails[];
  onFilesChange: (files: FileDetails[]) => void;
  storagePath: string; // e.g., 'designs/{designId}' or 'builds/{buildId}'
  disabled?: boolean;
  maxFileSize?: number; // in MB, default 10MB
  allowedTypes?: string[]; // MIME types or extensions
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

// Utility: Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  files,
  onFilesChange,
  storagePath,
  disabled = false,
  maxFileSize = 10, // 10MB default
  allowedTypes = [], // Empty means all types allowed
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    const maxBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    // Check file type if restrictions exist
    if (allowedTypes.length > 0) {
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const isAllowed = allowedTypes.some(type => 
        type.startsWith('.') 
          ? type.toLowerCase() === fileExtension 
          : file.type === type
      );
      
      if (!isAllowed) {
        return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
      }
    }

    return null;
  }, [maxFileSize, allowedTypes]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const storage = getStorage();
      const uploadedFiles: FileDetails[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setCurrentFileName(file.name);

        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue; // Skip this file but continue with others
        }

        // Generate unique filename
        const fileExtension = file.name.split('.').pop();
        const uniqueFilename = `${Date.now()}_${uuidv4()}.${fileExtension}`;
        const storageRefPath = `${storagePath}/files/${uniqueFilename}`;
        const storageRefInstance = firebaseRef(storage, storageRefPath);

        // Upload file
        const uploadTask = uploadBytesResumable(storageRefInstance, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = ((i + snapshot.bytesTransferred / snapshot.totalBytes) / selectedFiles.length) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedFiles.push({
                id: uuidv4(),
                url: downloadURL,
                name: file.name,
                path: storageRefPath,
              });
              resolve();
            }
          );
        });
      }

      // Add uploaded files to the list
      onFilesChange([...files, ...uploadedFiles]);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setCurrentFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteFile = async (index: number) => {
    const fileToDelete = files[index];
    
    try {
      // Delete from Firebase Storage
      const storage = getStorage();
      const storageRefInstance = firebaseRef(storage, fileToDelete.path);
      await deleteObject(storageRefInstance);

      // Remove from list
      const updatedFiles = files.filter((_, i) => i !== index);
      onFilesChange(updatedFiles);
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file. It may have been already deleted.');
      // Still remove from UI even if deletion fails
      const updatedFiles = files.filter((_, i) => i !== index);
      onFilesChange(updatedFiles);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: spacing[3] }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <FileIcon sx={{ color: colors.text.tertiary }} />
          <Typography
            variant="h6"
            sx={{
              fontFamily: typography.fontFamily.display,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}
          >
            Files
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.text.tertiary,
              fontSize: typography.fontSize.sm,
            }}
          >
            {files.length} {files.length === 1 ? 'file' : 'files'}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          sx={{
            borderRadius: borderRadius.md,
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
          }}
        >
          Upload Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          disabled={disabled}
          accept={allowedTypes.length > 0 ? allowedTypes.join(',') : undefined}
        />
      </Box>

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mb: spacing[3] }}>
          <Typography
            variant="caption"
            sx={{ color: colors.text.secondary, mb: spacing[1], display: 'block' }}
          >
            Uploading {currentFileName}...
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography
            variant="caption"
            sx={{ color: colors.text.tertiary, mt: spacing[1], display: 'block' }}
          >
            {Math.round(uploadProgress)}%
          </Typography>
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: spacing[3] }}>
          {error}
        </Alert>
      )}

      {/* Files List */}
      {files.length > 0 ? (
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
              key={file.id}
              sx={{
                borderBottom: index < files.length - 1 ? `1px solid ${colors.neutral[200]}` : 'none',
                '&:hover': {
                  backgroundColor: colors.neutral[50],
                },
              }}
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
                    {file.name.split('.').pop()?.toUpperCase()} file
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteFile(index)}
                  disabled={disabled}
                  sx={{
                    color: colors.error,
                    '&:hover': {
                      backgroundColor: '#FEE2E2',
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box
          sx={{
            border: `2px dashed ${colors.neutral[300]}`,
            borderRadius: borderRadius.lg,
            p: spacing[6],
            textAlign: 'center',
            backgroundColor: colors.background.secondary,
          }}
        >
          <FileIcon sx={{ fontSize: 48, color: colors.text.tertiary, mb: spacing[2] }} />
          <Typography
            variant="body1"
            sx={{
              color: colors.text.secondary,
              mb: spacing[1],
            }}
          >
            No files attached
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.text.tertiary,
              fontSize: typography.fontSize.sm,
            }}
          >
            Click "Upload Files" to attach documents, data files, or other resources
          </Typography>
          {maxFileSize && (
            <Chip
              label={`Max file size: ${maxFileSize}MB`}
              size="small"
              sx={{ mt: spacing[2] }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default FileUploadSection;

