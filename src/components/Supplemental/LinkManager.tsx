// src/components/Supplemental/LinkManager.tsx
import React from 'react';
import { Box, TextField, Button, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import LinkIcon from '@mui/icons-material/Link';

interface Link {
  title: string;
  url: string;
  description: string;
}

interface LinkManagerProps {
  links: Link[];
  onLinksChange: (links: Link[]) => void;
}

const LinkManager: React.FC<LinkManagerProps> = ({ links, onLinksChange }) => {
  const handleAddLink = () => {
    const newLink = { title: '', url: '', description: '' };
    onLinksChange([...links, newLink]);
  };

  const handleDeleteLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    onLinksChange(updatedLinks);
  };

  return (
    <Box>
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <LinkIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Links</Typography>
      </Box>
      <Box sx={{ mt: 1 }}>
        {links.map((link, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TextField
              label="Title"
              value={link.title}
              onChange={(e) => {
                const updatedLinks = [...links];
                updatedLinks[index].title = e.target.value;
                onLinksChange(updatedLinks);
              }}
              sx={{ flexBasis: '20%', mr: 1 }}
            />
            <TextField
              label="URL"
              value={link.url}
              onChange={(e) => {
                const updatedLinks = [...links];
                updatedLinks[index].url = e.target.value;
                onLinksChange(updatedLinks);
              }}
              sx={{ flexBasis: '40%', mr: 1 }}
            />
            <TextField
              label="Description"
              value={link.description}
              onChange={(e) => {
                const updatedLinks = [...links];
                updatedLinks[index].description = e.target.value;
                onLinksChange(updatedLinks);
              }}
              sx={{ flexBasis: '40%' }}
            />
            <IconButton onClick={() => handleDeleteLink(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
      <Button variant="contained" onClick={handleAddLink} sx={{ mt: 2 }}>
        Add Link
      </Button>
    </Box>
  );
};

export default LinkManager;