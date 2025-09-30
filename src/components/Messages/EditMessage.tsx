// src/components/Messages/EditMessage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, Divider, Paper } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/designSystem';
import { PageHeader } from '../common';

import CourseSelector from './CourseSelector';
import LinksSection, { Link } from './LinksSection';

const EditMessage: React.FC = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState<Link[]>([{ id: crypto.randomUUID(), title: '', url: '' }]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const messageRef = doc(db, 'messages', id!);
        const docSnap = await getDoc(messageRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title);
          setDescription(data.description);
          // Convert existing links to include IDs, or create new ones if none exist
          const existingLinks = data.links || [];
          setLinks(existingLinks.length > 0 
            ? existingLinks.map((link: any) => ({ 
                id: link.id || crypto.randomUUID(), 
                title: link.title || '', 
                url: link.url || '' 
              }))
            : [{ id: crypto.randomUUID(), title: '', url: '' }]
          );
          setSelectedCourse(data.course || '');
        }
      } catch (error) {
        console.error('Error fetching message: ', error);
      }
    };

    fetchMessage();
  }, [db, id]);

  const handleEditMessage = async () => {
    try {
      if (!selectedCourse) {
        alert('Please select a valid course to update the message.');
        return;
      }

      const messageRef = doc(db, 'messages', id!);
      await updateDoc(messageRef, {
        title,
        description,
        links,
        course: selectedCourse,
        lastUpdatedOn: serverTimestamp(),
      });
      navigate('/messages');
    } catch (error) {
      console.error('Error editing message: ', error);
    }
  };

  const handleCancel = () => navigate('/messages');

  const handleLinkChange = (index: number, field: keyof Link, value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const addLinkField = () => setLinks([...links, { id: crypto.randomUUID(), title: '', url: '' }]);

  const removeLinkField = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, fontFamily: typography.fontFamily.primary }}>
      {/* Header Section */}
      <PageHeader 
        title="Edit Message"
        subtitle="Update your message content and course assignment"
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
          {/* Links Section */}
          <LinksSection 
            links={links}
            onLinkChange={handleLinkChange}
            onAddLink={addLinkField}
            onRemoveLink={removeLinkField}
          />
          
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
              onClick={handleEditMessage}
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

export default EditMessage;