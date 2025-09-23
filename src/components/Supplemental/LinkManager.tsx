// src/components/Supplemental/LinkManager.tsx
import React from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  IconButton, 
  Typography, 
  Card, 
  CardContent, 
  CardActions,
  Chip,
  Grid,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Add as AddIcon,
  Link as LinkIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { designSystemTheme, borderRadius } from '../../config/designSystem';

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

  const handleLinkChange = (index: number, field: keyof Link, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value;
    onLinksChange(updatedLinks);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LinkIcon sx={{ mr: 1, color: designSystemTheme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: designSystemTheme.palette.text.primary }}>
          Links
        </Typography>
        <Chip 
          label={`${links.length} link${links.length !== 1 ? 's' : ''}`} 
          size="small" 
          sx={{ ml: 2 }}
        />
      </Box>

      <Button 
        variant="contained" 
        onClick={handleAddLink}
        startIcon={<AddIcon />}
        sx={{
          mb: 3,
          textTransform: 'none',
          borderRadius: borderRadius.xl,
        }}
      >
        Add Link
      </Button>

      {links.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map((link, index) => (
            <Card
              key={index}
              sx={{
                borderRadius: borderRadius.xl,
                border: `1px solid ${designSystemTheme.palette.divider}`,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: designSystemTheme.shadows[2],
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Link Title"
                      value={link.title}
                      onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                      variant="outlined"
                      size="small"
                      placeholder="Enter link title"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: borderRadius.xl,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="URL"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      variant="outlined"
                      size="small"
                      placeholder="https://example.com"
                      error={link.url && !isValidUrl(link.url)}
                      helperText={link.url && !isValidUrl(link.url) ? 'Please enter a valid URL' : ''}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: borderRadius.xl,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description (Optional)"
                      value={link.description}
                      onChange={(e) => handleLinkChange(index, 'description', e.target.value)}
                      variant="outlined"
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Enter link description"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: borderRadius.xl,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
              
              <Divider />
              
              <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {link.url && isValidUrl(link.url) && (
                    <Tooltip title="Open link" arrow>
                      <IconButton
                        size="small"
                        onClick={() => window.open(link.url, '_blank')}
                        sx={{
                          color: designSystemTheme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: designSystemTheme.palette.primary.light,
                          },
                        }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Link {index + 1}
                  </Typography>
                </Box>
                
                <Tooltip title="Delete link" arrow>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteLink(index)}
                    sx={{
                      color: designSystemTheme.palette.error.main,
                      '&:hover': {
                        backgroundColor: designSystemTheme.palette.error.light,
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default LinkManager;