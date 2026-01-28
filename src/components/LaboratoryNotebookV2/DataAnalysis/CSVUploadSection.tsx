// src/components/LaboratoryNotebookV2/DataAnalysis/CSVUploadSection.tsx

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Timestamp } from 'firebase/firestore';
import { colors, typography, spacing, borderRadius } from '../../../config/designSystem';
import { dataAnalysisService } from '../../../services/dataAnalysisService';
import { Dataset, DatasetMetadata } from '../../../types/dataAnalysis';

interface CSVUploadSectionProps {
  userId: string;
  nodeId: string;
  nodeType: 'design' | 'build' | 'test';
  onDatasetUploaded: (dataset: Dataset) => void;
  existingDatasets?: DatasetMetadata[]; // Metadata only (without heavy data arrays)
}

const CSVUploadSection: React.FC<CSVUploadSectionProps> = ({
  userId,
  nodeId,
  nodeType,
  onDatasetUploaded,
  existingDatasets = [],
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);
  const [parsedDataset, setParsedDataset] = useState<Dataset | null>(null);
  const [datasetName, setDatasetName] = useState<string>('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const storage = getStorage();

  // Helper to convert Firestore Timestamp to Date
  const toDate = (timestamp: any): Date => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
  };

  /**
   * Handle file drop/selection
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setUploadProgress(10);
      setUploadStatus(null);
      setParseErrors([]);
      setParsedDataset(null);

      try {
        // Step 1: Parse CSV
        setUploadStatus({ type: 'info', message: 'Parsing CSV file...' });
        setUploadProgress(30);

        const { dataset, errors } = await dataAnalysisService.parseCSV(file, userId);
        
        if (errors.length > 0) {
          setParseErrors(errors);
        }

        // Step 2: Upload to Firebase Storage
        setUploadStatus({ type: 'info', message: 'Uploading to cloud storage...' });
        setUploadProgress(60);

        const storagePath = `dataAnalysis/${userId}/${nodeType}/${nodeId}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Update dataset with storage info
        dataset.fileUrl = downloadURL;
        dataset.filePath = storagePath;

        setUploadProgress(90);

        // Step 3: Preview dataset (don't save yet, let user edit name)
        setParsedDataset(dataset);
        setDatasetName(dataset.name); // Initialize editable name
        setUploadProgress(100);
        setUploadStatus({
          type: 'success',
          message: `File uploaded successfully! Review and save below.`,
        });
      } catch (error) {
        console.error('Error uploading CSV:', error);
        setUploadStatus({
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to upload CSV file',
        });
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [userId, nodeId, nodeType, storage, onDatasetUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleSaveDataset = () => {
    if (!parsedDataset) return;
    
    // Update dataset name with user's input
    const finalDataset = {
      ...parsedDataset,
      name: datasetName.trim() || parsedDataset.name,
    };
    
    // Notify parent component
    onDatasetUploaded(finalDataset);
    
    // Clear preview
    setParsedDataset(null);
    setDatasetName('');
    setUploadStatus(null);
  };

  const handleCancelUpload = () => {
    setParsedDataset(null);
    setDatasetName('');
    setUploadStatus(null);
  };

  const handleRemoveDataset = (datasetId: string) => {
    // This will be handled by the parent component
    console.log('Remove dataset:', datasetId);
  };

  return (
    <Box>
      {/* Upload Dropzone */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          border: `2px dashed ${isDragActive ? colors.primary[500] : colors.neutral[300]}`,
          borderRadius: borderRadius.lg,
          backgroundColor: isDragActive ? colors.primary[50] : colors.background.primary,
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'center',
          '&:hover': {
            borderColor: colors.primary[500],
            backgroundColor: colors.primary[50],
          },
        }}
      >
        <input {...getInputProps()} />
        
        <UploadIcon
          sx={{
            fontSize: 48,
            color: isDragActive ? colors.primary[500] : colors.neutral[400],
            mb: 2,
          }}
        />
        
        <Typography
          variant="h6"
          sx={{
            mb: 1,
            fontFamily: typography.fontFamily.display,
            color: colors.text.primary,
          }}
        >
          {isDragActive ? 'Drop CSV file here' : 'Upload CSV Dataset'}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{ color: colors.text.secondary, mb: 2 }}
        >
          Drag & drop a CSV file or click to browse
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          disabled={isUploading}
          sx={{ textTransform: 'none' }}
        >
          Select CSV File
        </Button>
      </Paper>

      {/* Upload Progress */}
      {isUploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{ height: 8, borderRadius: borderRadius.md }}
          />
          <Typography
            variant="caption"
            sx={{ mt: 1, display: 'block', textAlign: 'center', color: colors.text.secondary }}
          >
            {uploadProgress}% - {uploadStatus?.message || 'Processing...'}
          </Typography>
        </Box>
      )}

      {/* Upload Status */}
      {uploadStatus && !isUploading && (
        <Alert
          severity={uploadStatus.type}
          icon={
            uploadStatus.type === 'success' ? (
              <CheckIcon />
            ) : uploadStatus.type === 'error' ? (
              <ErrorIcon />
            ) : (
              <InfoIcon />
            )
          }
          sx={{ mt: 2 }}
        >
          {uploadStatus.message}
        </Alert>
      )}

      {/* Parse Errors */}
      {parseErrors.length > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            CSV Parsing Warnings ({parseErrors.length}):
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {parseErrors.slice(0, 5).map((error, idx) => (
              <li key={idx}>
                <Typography variant="caption">{error}</Typography>
              </li>
            ))}
            {parseErrors.length > 5 && (
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                ... and {parseErrors.length - 5} more
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      {/* Dataset Preview */}
      {parsedDataset && (
        <Paper
          sx={{
            mt: 2,
            p: 3,
            border: `2px solid ${colors.primary[300]}`,
            borderRadius: borderRadius.md,
            backgroundColor: colors.primary[50],
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontFamily: typography.fontFamily.display, fontWeight: 600 }}
            >
              Dataset Preview
            </Typography>
            <Chip
              label="Ready to Save"
              color="success"
              size="small"
              icon={<CheckIcon />}
            />
          </Stack>

          {/* Editable Dataset Name */}
          <TextField
            label="Dataset Name"
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            helperText="Give this dataset a meaningful name"
          />

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              label={`${parsedDataset.rowCount} rows`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${parsedDataset.columnCount} columns`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${(parsedDataset.fileSize / 1024).toFixed(1)} KB`}
              size="small"
              variant="outlined"
            />
          </Stack>

          <Typography variant="caption" sx={{ color: colors.text.secondary, display: 'block', mb: 1 }}>
            Columns:
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
            {parsedDataset.columns.map((col) => (
              <Chip
                key={col.key}
                label={col.name}
                size="small"
                sx={{
                  backgroundColor: col.type === 'numeric' ? colors.primary[50] : colors.neutral[100],
                  color: col.type === 'numeric' ? colors.primary[700] : colors.neutral[700],
                }}
              />
            ))}
          </Stack>

          {/* Save/Cancel Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleCancelUpload}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveDataset}
              disabled={!datasetName.trim()}
              startIcon={<CheckIcon />}
              sx={{ textTransform: 'none' }}
            >
              Save Dataset
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Existing Datasets */}
      {existingDatasets.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 2,
              fontFamily: typography.fontFamily.display,
              color: colors.text.secondary,
            }}
          >
            Existing Datasets ({existingDatasets.length})
          </Typography>
          <Stack spacing={1}>
            {existingDatasets.map((dataset) => (
              <Paper
                key={dataset.id}
                sx={{
                  p: 2,
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: borderRadius.md,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {dataset.name}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                      {dataset.rowCount} rows × {dataset.columnCount} columns
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                      • {toDate(dataset.uploadedAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Box>
                <Tooltip title="Remove dataset">
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveDataset(dataset.id)}
                    sx={{ color: colors.error }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default CSVUploadSection;
