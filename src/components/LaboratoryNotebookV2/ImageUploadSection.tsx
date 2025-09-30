// src/components/LaboratoryNotebookV2/ImageUploadSection.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogContent,
  Tooltip,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { getStorage, ref as firebaseRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/designSystem';
import { Image } from '../../types/types';

interface ImageUploadSectionProps {
  images: Image[];
  onImagesChange: (images: Image[]) => void;
  storagePath: string; // e.g., 'designs/{designId}' or 'builds/{buildId}'
  disabled?: boolean;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  images,
  onImagesChange,
  storagePath,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<Image | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const storage = getStorage();
      const uploadedImages: Image[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Compress if larger than 1MB
        let fileToUpload = file;
        if (file.size > 1024 * 1024) {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          fileToUpload = await imageCompression(file, options);
        }

        // Generate unique filename
        const uniqueFilename = `${Date.now()}_${uuidv4()}.${fileToUpload.type.split('/')[1]}`;
        const storageRefPath = `${storagePath}/${uniqueFilename}`;
        const storageRefInstance = firebaseRef(storage, storageRefPath);

        // Upload file
        const uploadTask = uploadBytesResumable(storageRefInstance, fileToUpload);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = ((i + snapshot.bytesTransferred / snapshot.totalBytes) / files.length) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedImages.push({
                url: downloadURL,
                path: storageRefPath,
                title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
              });
              resolve();
            }
          );
        });
      }

      // Add uploaded images to the list
      onImagesChange([...images, ...uploadedImages]);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (index: number) => {
    const imageToDelete = images[index];
    
    try {
      // Delete from Firebase Storage
      const storage = getStorage();
      const storageRefInstance = firebaseRef(storage, imageToDelete.path);
      await deleteObject(storageRefInstance);

      // Remove from list
      const updatedImages = images.filter((_, i) => i !== index);
      onImagesChange(updatedImages);
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image. It may have been already deleted.');
      // Still remove from UI even if deletion fails
      const updatedImages = images.filter((_, i) => i !== index);
      onImagesChange(updatedImages);
    }
  };

  const handleTitleChange = useCallback((index: number, newTitle: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], title: newTitle };
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  const handlePreview = (image: Image) => {
    setPreviewImage(image);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: spacing[3] }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <ImageIcon sx={{ color: colors.text.tertiary }} />
          <Typography
            variant="h6"
            sx={{
              fontFamily: typography.fontFamily.display,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}
          >
            Images
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.text.tertiary,
              fontSize: typography.fontSize.sm,
            }}
          >
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          sx={{
            borderRadius: borderRadius.md,
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
          }}
        >
          Upload Images
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleImageUpload}
          disabled={disabled}
        />
      </Box>

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mb: spacing[3] }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography
            variant="caption"
            sx={{ color: colors.text.tertiary, mt: spacing[1], display: 'block' }}
          >
            Uploading... {Math.round(uploadProgress)}%
          </Typography>
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: spacing[3] }}>
          {error}
        </Alert>
      )}

      {/* Images Grid */}
      {images.length > 0 ? (
        <Grid container spacing={spacing[2]}>
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  borderRadius: borderRadius.lg,
                  boxShadow: shadows.sm,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: shadows.md,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={image.url}
                  alt={image.title}
                  sx={{
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                  onClick={() => handlePreview(image)}
                />
                <CardContent sx={{ p: spacing[2] }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Image title..."
                    value={image.title}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                    disabled={disabled}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: typography.fontSize.sm,
                      },
                    }}
                  />
                </CardContent>
                <CardActions sx={{ px: spacing[2], pb: spacing[2], pt: 0, justifyContent: 'space-between' }}>
                  <Tooltip title="View fullscreen">
                    <IconButton size="small" onClick={() => handlePreview(image)}>
                      <FullscreenIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete image">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteImage(index)}
                      disabled={disabled}
                      sx={{
                        color: colors.error,
                        '&:hover': {
                          backgroundColor: '#FEE2E2',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            border: `2px dashed ${colors.neutral[300]}`,
            borderRadius: borderRadius.lg,
            p: spacing[6],
            textAlign: 'center',
            backgroundColor: colors.background.secondary,
          }}
        >
          <ImageIcon sx={{ fontSize: 48, color: colors.text.tertiary, mb: spacing[2] }} />
          <Typography
            variant="body1"
            sx={{
              color: colors.text.secondary,
              mb: spacing[1],
            }}
          >
            No images yet
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.text.tertiary,
              fontSize: typography.fontSize.sm,
            }}
          >
            Click &quot;Upload Images&quot; to add images to this {storagePath.includes('design') ? 'design' : storagePath.includes('build') ? 'build' : 'test'}
          </Typography>
        </Box>
      )}

      {/* Fullscreen Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.background.primary,
            borderRadius: borderRadius.xl,
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {previewImage && (
            <>
              <IconButton
                onClick={() => setPreviewImage(null)}
                sx={{
                  position: 'absolute',
                  top: spacing[2],
                  right: spacing[2],
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                  zIndex: 1,
                }}
              >
                <CloseIcon />
              </IconButton>
              <img
                src={previewImage.url}
                alt={previewImage.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              {previewImage.title && (
                <Box sx={{ p: spacing[3], backgroundColor: colors.background.secondary }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: typography.fontFamily.display,
                      color: colors.text.primary,
                    }}
                  >
                    {previewImage.title}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ImageUploadSection;

