// src/components/Supplemental/MaterialImport/FileUploadZone.tsx

import React, { useCallback, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  Chip,
  LinearProgress,
  IconButton
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Slideshow as SlideshowIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useMaterialImportActions, useMaterialImportStatus } from '../../../stores/materialImportStore';
import { validateFileForExtraction, getFileTypeDescription } from '../../../utils/textExtraction';

interface FileUploadZoneProps {
  disabled?: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ disabled = false }) => {
  const { setUploadedFile, extractTextFromFile, setError } = useMaterialImportActions();
  const { uploadedFile, extractedText, isProcessing } = useMaterialImportStatus();
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file
    const validation = validateFileForExtraction(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Set file and start extraction
    setUploadedFile(file);
    
    // Auto-extract text after brief delay
    setTimeout(async () => {
      await extractTextFromFile();
    }, 100);
  }, [setUploadedFile, extractTextFromFile, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt']
    },
    multiple: false,
    disabled: disabled || isProcessing,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false)
  });

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setError(null);
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <PdfIcon sx={{ fontSize: 40, color: 'error.main' }} />;
    if (type.includes('presentation') || type.includes('powerpoint')) 
      return <SlideshowIcon sx={{ fontSize: 40, color: 'warning.main' }} />;
    if (type.includes('word') || type.includes('document')) 
      return <DocumentIcon sx={{ fontSize: 40, color: 'info.main' }} />;
    return <FileIcon sx={{ fontSize: 40, color: 'text.secondary' }} />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        📁 Upload Material
      </Typography>

      {!uploadedFile ? (
        // Upload Zone
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            bgcolor: dragActive ? 'primary.50' : 'grey.50',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: disabled ? 'grey.300' : 'primary.main',
              bgcolor: disabled ? 'grey.50' : 'primary.50'
            }
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop your file here!' : 'Upload Material File'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag and drop your file here, or click to browse
          </Typography>
          
          {/* Supported Formats */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
            <Chip label="PDF" size="small" color="error" variant="outlined" />
            <Chip label="PowerPoint" size="small" color="warning" variant="outlined" />
            <Chip label="Word" size="small" color="info" variant="outlined" />
            <Chip label="Text" size="small" color="success" variant="outlined" />
          </Box>

          <Typography variant="caption" color="text.secondary">
            Maximum file size: 50MB
          </Typography>
        </Box>
      ) : (
        // File Display
        <Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            border: '1px solid',
            borderColor: 'success.main',
            borderRadius: 1,
            bgcolor: 'success.50'
          }}>
            {getFileIcon(uploadedFile.type)}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                {uploadedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getFileTypeDescription(uploadedFile)} • {formatFileSize(uploadedFile.size)}
              </Typography>
              {extractedText && (
                <Typography variant="caption" color="success.main">
                  ✅ Text extracted successfully ({extractedText.split(/\s+/).length} words)
                </Typography>
              )}
            </Box>
            <IconButton 
              onClick={handleRemoveFile} 
              color="error"
              disabled={isProcessing}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          {/* Processing Progress */}
          {isProcessing && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Processing file...
              </Typography>
            </Box>
          )}

          {/* Upload Another File */}
          {!isProcessing && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleRemoveFile}
                startIcon={<CloudUploadIcon />}
              >
                Upload Different File
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Supported formats:</strong> PDF documents, PowerPoint presentations (.pptx), 
          Word documents (.docx), and plain text files (.txt). The AI will automatically 
          structure your content into organized course materials.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default FileUploadZone;
