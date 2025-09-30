// src/components/LaboratoryNotebookV2/ImageGallery.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/designSystem';
import { Image } from '../../types/types';

interface ImageGalleryProps {
  images: Image[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [previewImage, setPreviewImage] = useState<Image | null>(null);

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          border: `2px dashed ${colors.neutral[300]}`,
          borderRadius: borderRadius.lg,
          p: spacing[4],
          textAlign: 'center',
          backgroundColor: colors.background.secondary,
        }}
      >
        <ImageIcon sx={{ fontSize: 36, color: colors.text.tertiary, mb: spacing[1] }} />
        <Typography
          variant="body2"
          sx={{
            color: colors.text.tertiary,
            fontSize: typography.fontSize.sm,
          }}
        >
          No images
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={spacing[2]}>
        {images.map((image, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: borderRadius.lg,
                boxShadow: shadows.sm,
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: shadows.md,
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => setPreviewImage(image)}
            >
              <CardMedia
                component="img"
                height="140"
                image={image.url}
                alt={image.title}
                sx={{
                  objectFit: 'cover',
                }}
              />
              {image.title && (
                <CardContent sx={{ p: spacing[2] }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text.secondary,
                      fontSize: typography.fontSize.sm,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {image.title}
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

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

export default ImageGallery;

