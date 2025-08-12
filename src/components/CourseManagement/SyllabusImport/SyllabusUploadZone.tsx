import React, { useCallback, useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSyllabusStore } from '../../../stores/syllabusStore';

interface SyllabusUploadZoneProps {
  onUploadComplete?: (file: File) => void;
  apiKey?: string; // From environment configuration
}

const SyllabusUploadZone: React.FC<SyllabusUploadZoneProps> = ({
  onUploadComplete,
  apiKey
}) => {
  const {
    uploadedFile,
    uploadProgress,
    error,
    isProcessing,
    useAIProcessing,
    uploadSyllabus,
    setUploadedFile,
    setError
  } = useSyllabusStore();

  const [isDragOver, setIsDragOver] = useState(false);

  // Accepted file types
  const acceptedTypes = useMemo(() => [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ], []);

  const acceptedExtensions = useMemo(() => ['.txt', '.pdf', '.docx'], []);

  const handleFileUpload = useCallback(async (file: File) => {
    // Move validateFile inside useCallback to avoid dependency issues
    const validateFile = (file: File): string | null => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        return `Unsupported file type. Please upload ${acceptedExtensions.join(', ')} files.`;
      }

      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return 'File size too large. Please upload files smaller than 10MB.';
      }

      return null;
    };

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await uploadSyllabus(file, apiKey);
      onUploadComplete?.(file);
    } catch (error) {
      console.error('Upload error:', error);
    }
  }, [uploadSyllabus, onUploadComplete, setError, acceptedTypes, acceptedExtensions, apiKey]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = '';
  }, [handleFileUpload]);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setError(null);
  }, [setUploadedFile, setError]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    // TODO: Could show different icons based on file extension
    return <FileIcon color="primary" />;
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      {/* Upload Zone */}
      {!uploadedFile && (
        <Paper
          sx={{
            p: 4,
            border: '2px dashed',
            borderColor: isDragOver ? 'primary.main' : 'grey.300',
            backgroundColor: isDragOver ? 'primary.50' : 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.50'
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('syllabus-file-input')?.click()}
        >
          <CloudUploadIcon 
            sx={{ 
              fontSize: 48, 
              color: isDragOver ? 'primary.main' : 'grey.400',
              mb: 2 
            }} 
          />
          
          <Typography variant="h6" gutterBottom>
            Upload Your Syllabus
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag and drop your syllabus file here, or click to browse
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {acceptedExtensions.map((ext) => (
              <Chip
                key={ext}
                label={ext.toUpperCase()}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Maximum file size: 10MB
          </Typography>
          
          <input
            id="syllabus-file-input"
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </Paper>
      )}

      {/* Uploaded File Display */}
      {uploadedFile && (
        <Paper sx={{ p: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getFileIcon()}
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {uploadedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatFileSize(uploadedFile.size)}
              </Typography>
            </Box>
            
            {!isProcessing && (
              <IconButton 
                onClick={handleRemoveFile}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
          
          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}
          
          {/* Processing Indicator */}
          {isProcessing && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {useAIProcessing ? 
                  'AI is analyzing your syllabus...' : 
                  'Processing syllabus...'
                }
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Help Text */}
      <Paper sx={{ p: 2, mt: 2, backgroundColor: 'info.50' }}>
        <Typography variant="body2" color="info.main" sx={{ fontWeight: 500, mb: 1 }}>
          💡 Tips for best results:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="ul" sx={{ m: 0, pl: 2 }}>
          <li>Include course objectives and weekly schedule</li>
          <li>List reading assignments and materials</li>
          <li>Text files (.txt) work best for parsing</li>
          <li>Ensure text is well-structured with clear headings</li>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SyllabusUploadZone; 