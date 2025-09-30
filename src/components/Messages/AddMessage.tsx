// src/components/Messages/AddMessage.tsx
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Divider, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/designSystem';
import { PageHeader } from '../common';

import CourseSelector from './CourseSelector';

interface Link {
  title: string;
  url: string;
}

const AddMessage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState<Link[]>([{ title: '', url: '' }]);

  const [selectedCourse, setSelectedCourse] = useState<string>('');

  const navigate = useNavigate();
  const db = getFirestore();

  const handleAddMessage = async () => {
    if (!selectedCourse) {
      alert('Please select a course to post the message.');
      return;
    }

    try {
      await addDoc(collection(db, 'messages'), {
        title,
        description,
        links,
        course: selectedCourse,
        postedOn: serverTimestamp(),
        isPinned: false,
      });
      navigate('/messages');
    } catch (error) {
      console.error('Error adding message: ', error);
    }
  };

  const handleCancel = () => navigate('/messages');

  const handleLinkChange = (index: number, field: keyof Link, value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const addLinkField = () => setLinks([...links, { title: '', url: '' }]);

  return (
    <Container maxWidth="md" sx={{ mt: 6, fontFamily: typography.fontFamily.primary }}>
      {/* Header Section */}
      <PageHeader 
        title="Add New Message"
        subtitle="Share important announcements and updates with your course participants"
      />

      {/* Form Section */}
      <Paper
        elevation={3}
        sx={{
          p: spacing[6],
          borderRadius: borderRadius['2xl'],
          backgroundColor: colors.background.elevated,
          border: `1px solid ${colors.neutral[200]}`,
          boxShadow: shadows.lg,
        }}
      >
        <Box sx={{ mt: spacing[4] }}>
          <CourseSelector value={selectedCourse} onChange={setSelectedCourse} />

          <TextField
            label="Subject"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              mb: 3,
              backgroundColor: '#FFFFFF',
              borderRadius: 1,
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
            }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              mb: 3,
              backgroundColor: '#FFFFFF',
              borderRadius: 1,
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
            }}
          />

          <Typography variant="h6" sx={{ mb: 2 }}>
            🔗
          </Typography>
          {links.map((link, index) => (
            <Box key={index} sx={{ mb: 2, pl: 2, borderLeft: '4px solid #CDDAFF' }}>
              <TextField
                label={`URL Title ${index + 1}`}
                fullWidth
                value={link.title}
                onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                sx={{ mb: 1 }}
              />
              <TextField
                label={`URL Link ${index + 1}`}
                fullWidth
                value={link.url}
                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
              />
            </Box>
          ))}
          <Button
            variant="outlined"
            onClick={addLinkField}
            startIcon={<span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>}
            sx={{
              fontFamily: 'Staatliches, sans-serif',
              fontSize: '1rem',
              color: '#0B53C0',
              padding: '8px 16px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(11, 83, 192, 0.1)',
                color: '#083B80',
              },
            }}
          >
            Add Link
          </Button>

          <Divider sx={{ width: '100%', my: 2, backgroundColor: '#DADADA' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              className="cancel-button"
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              onClick={handleAddMessage}
              className="save-button"
            >
              Save
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddMessage;