// src/components/CourseManagement/SyllabusFileDisplay.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Description as SyllabusIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { formatSyllabusFileSize, getSyllabusFileTypeDescription } from '../../services/syllabusFileService';

interface SyllabusFileDisplayProps {
  courseId: string;
}

interface SyllabusFile {
  url: string;
  path: string;
  metadata: {
    originalFilename: string;
    fileSize: number;
    fileType: string;
    uploadedAt: Date;
    uploadedBy: string;
    courseId?: string;
  };
}

const SyllabusFileDisplay: React.FC<SyllabusFileDisplayProps> = ({ courseId }) => {
  const [syllabusFile, setSyllabusFile] = useState<SyllabusFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const fetchSyllabusFile = async () => {
      try {
        setLoading(true);
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const courseData = courseSnap.data();
          setSyllabusFile(courseData.syllabusFile || null);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('Error fetching syllabus file:', err);
        setError('Failed to load syllabus file information');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchSyllabusFile();
    }
  }, [courseId, db]);

  const handleDownload = () => {
    if (syllabusFile?.url) {
      window.open(syllabusFile.url, '_blank');
    }
  };

  const handleViewDetails = () => {
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!syllabusFile) {
    return null; // Don't show anything if there's no syllabus file
  }

  return (
    <Paper sx={{ p: 3, mb: 3, backgroundColor: 'info.50' }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SyllabusIcon color="primary" />
        Original Syllabus Document
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="body1" sx={{ flexGrow: 1 }}>
          <strong>{syllabusFile.metadata.originalFilename}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getSyllabusFileTypeDescription(syllabusFile.metadata.fileType)} • {formatSyllabusFileSize(syllabusFile.metadata.fileSize)}
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Uploaded: {new Date(syllabusFile.metadata.uploadedAt).toLocaleDateString()}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ViewIcon />}
          onClick={handleViewDetails}
          size="small"
        >
          View Details
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          size="small"
        >
          Download
        </Button>
      </Box>

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SyllabusIcon />
          Syllabus File Details
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Filename:</strong>
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {syllabusFile.metadata.originalFilename}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>File Type:</strong>
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {getSyllabusFileTypeDescription(syllabusFile.metadata.fileType)}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>File Size:</strong>
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formatSyllabusFileSize(syllabusFile.metadata.fileSize)}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Uploaded:</strong>
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(syllabusFile.metadata.uploadedAt).toLocaleString()}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Storage Path:</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: 'grey.100', p: 1, borderRadius: 1 }}>
              {syllabusFile.path}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button onClick={handleDownload} variant="contained" startIcon={<DownloadIcon />}>
            Download File
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SyllabusFileDisplay;
