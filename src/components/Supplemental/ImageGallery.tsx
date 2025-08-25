// src/components/Supplemental/ImageGallery.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ImageGalleryProps {
  images: { url: string; title: string }[];
}

// Styled components for smooth transitions
const ImageContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  position: 'relative'
}));

const StyledImage = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  maxHeight: '500px',
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
  }
}));

const ImageSkeleton = styled(Skeleton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1)
}));

interface SmartImageProps {
  src: string;
  alt: string;
  title: string;
  index: number;
}

const SmartImage: React.FC<SmartImageProps> = ({ src, alt, title, index }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  // Preload image
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
    setImageRef(img);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (error) {
    return (
      <ImageContainer>
        <Box 
          sx={{ 
            width: '100%', 
            maxWidth: 400,
            height: 200, 
            bgcolor: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 1,
            border: '1px dashed #ccc'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Image failed to load
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>{title}</Typography>
      </ImageContainer>
    );
  }

  return (
    <ImageContainer>
      {!loaded && (
        <ImageSkeleton 
          variant="rectangular" 
          width="100%" 
          height={300}
          sx={{ maxWidth: 400 }}
        />
      )}
      
      <Fade in={loaded} timeout={500}>
        <Box sx={{ display: loaded ? 'block' : 'none' }}>
          <StyledImage
            src={src}
            alt={alt}
            loading="lazy" // Native lazy loading
          />
        </Box>
      </Fade>
      
      {loaded && (
        <Fade in={loaded} timeout={700}>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            {title}
          </Typography>
        </Fade>
      )}
    </ImageContainer>
  );
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
      {images.map((image, index) => (
        <SmartImage
          key={`${image.url}-${index}`} // More stable key
          src={image.url}
          alt={`Image ${index + 1}`}
          title={image.title}
          index={index}
        />
      ))}
    </Box>
  );
};

export default ImageGallery;