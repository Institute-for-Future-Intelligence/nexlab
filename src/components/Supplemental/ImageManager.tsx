// src/components/Supplemental/ImageManager.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Snackbar,
  Alert,
  Typography,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
} from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Resizer from 'react-image-file-resizer';
import { v4 as uuidv4 } from 'uuid';
import { designSystemTheme, borderRadius } from '../../config/designSystem';

import {
  Image as ImageIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface ImageData {
  url: string;
  title: string;
  id?: string;
}

interface ImageManagerProps {
  sectionId: string;
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
}

const ImageManager: React.FC<ImageManagerProps> = ({ sectionId, images, onImagesChange }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('success');
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const storage = getStorage();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImages: ImageData[] = [];

      for (const file of files) {
        try {
          const compressedImage = await compressImage(file);
          const imageUrl = await uploadImage(compressedImage);
          newImages.push({ 
            url: imageUrl.url, 
            title: `Image ${images.length + newImages.length + 1}`,
            id: uuidv4()
          });
        } catch (error) {
          setSnackbarMessage('Failed to upload images');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
        }
      }

      onImagesChange([...images, ...newImages]);
      setSnackbarMessage('Image(s) uploaded successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
  };

  const handleEditImage = (image: ImageData) => {
    setEditingImage(image);
    setEditTitle(image.title);
  };

  const handleSaveEdit = () => {
    if (editingImage) {
      const updatedImages = images.map(img => 
        img.url === editingImage.url ? { ...img, title: editTitle } : img
      );
      onImagesChange(updatedImages);
      setEditingImage(null);
      setEditTitle('');
    }
  };

  const handleDeleteImage = (imageToDelete: ImageData) => {
    const updatedImages = images.filter(img => img.url !== imageToDelete.url);
    onImagesChange(updatedImages);
  };

  const compressImage = (image: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (image.size > 5 * 1024 * 1024) {
        Resizer.imageFileResizer(
          image,
          500,
          500,
          'JPEG',
          70,
          0,
          (uri) => {
            if (typeof uri === 'string') {
              reject(new Error('Compression returned a string instead of a file'));
            } else {
              resolve(uri as File);
            }
          },
          'file'
        );
      } else {
        resolve(image);
      }
    });
  };

  const uploadImage = (image: File): Promise<{ url: string, path: string }> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `materials/${sectionId}/${image.name}`);
      uploadBytes(storageRef, image)
        .then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            resolve({ url, path: snapshot.ref.fullPath });
          });
        })
        .catch((error) => reject(error));
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ImageIcon sx={{ mr: 1, color: designSystemTheme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: designSystemTheme.palette.text.primary }}>
          Images
        </Typography>
        <Chip 
          label={`${images.length} image${images.length !== 1 ? 's' : ''}`} 
          size="small" 
          sx={{ ml: 2 }}
        />
      </Box>

      <Button 
        variant="contained" 
        component="label" 
        startIcon={<AddIcon />}
        sx={{
          mb: 3,
          textTransform: 'none',
          borderRadius: borderRadius.xl,
        }}
      >
        Add Images
        <input type="file" hidden accept="image/*" multiple onChange={handleImageChange} />
      </Button>

      {images.length > 0 && (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={image.id || index}>
              <Card
                sx={{
                  borderRadius: borderRadius.xl,
                  border: `1px solid ${designSystemTheme.palette.divider}`,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: designSystemTheme.shadows[4],
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <img 
                    src={image.url} 
                    alt={image.title}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover',
                      borderRadius: `${borderRadius.xl} ${borderRadius.xl} 0 0`
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      display: 'flex',
                      gap: 0.5,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleEditImage(image)}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                          backgroundColor: designSystemTheme.palette.primary.main,
                          color: 'white',
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteImage(image)}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                          backgroundColor: designSystemTheme.palette.error.main,
                          color: 'white',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      color: designSystemTheme.palette.text.primary,
                      wordBreak: 'break-word',
                    }}
                  >
                    {image.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={!!editingImage} 
        onClose={() => setEditingImage(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1, color: designSystemTheme.palette.primary.main }} />
            Edit Image Title
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Image Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setEditingImage(null)}
            startIcon={<CancelIcon />}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ textTransform: 'none' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImageManager;
