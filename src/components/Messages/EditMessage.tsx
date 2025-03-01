// src/components/Messages/EditMessage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, Divider, Paper } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

import CourseSelector from './CourseSelector';

interface Link {
  title: string;
  url: string;
}

const EditMessage: React.FC = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState<Link[]>([{ title: '', url: '' }]);
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
          setLinks(data.links || [{ title: '', url: '' }]);
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
      navigate('/');
    } catch (error) {
      console.error('Error editing message: ', error);
    }
  };

  const handleCancel = () => navigate('/');

  const handleLinkChange = (index: number, field: keyof Link, value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const addLinkField = () => setLinks([...links, { title: '', url: '' }]);

  return (
    <Container maxWidth="md" sx={{ mt: 6, fontFamily: 'Gabarito, sans-serif' }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: '#F7F9FC', // Light email-like background
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: 'Staatliches, sans-serif', textAlign: 'center' }}>
          Edit Message
        </Typography>

        <Divider sx={{ mb: 3, backgroundColor: '#DADADA' }} />

        <Box sx={{ mt: 4 }}>
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