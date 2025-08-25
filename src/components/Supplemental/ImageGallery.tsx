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

const SmartImage: React.FC<SmartImageProps> = ({ src, alt, title }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryAttempt] = useState(0);

  // Preload image with retry mechanism
  useEffect(() => {
    setLoaded(false);
    setError(false);
    
    const img = new Image();
    
    // Skip crossOrigin to avoid CORS issues for now
    // TODO: Fix Firebase Storage CORS configuration
    // if (retryAttempt === 0) {
    //   img.crossOrigin = 'anonymous';
    // }
    
    img.src = src;
    
    img.onload = () => {
      console.log(`✅ SmartImage loaded: ${src.substring(0, 50)}...`);
      setLoaded(true);
    };
    
    img.onerror = (error) => {
      console.error(`❌ SmartImage failed to load: ${src}`, error);
      console.error(`Image details:`, {
        src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      });
      
      // Log the error for debugging
      console.error(`Image load failed. URL accessible via curl but blocked in browser.`);
      console.error(`This is likely a Firebase Storage CORS configuration issue.`);
      console.error(`Fix: Configure CORS to allow ${window.location.origin}`);
      
      setError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, retryAttempt]);

  if (error) {
    return (
      <ImageContainer>
        <Box 
          sx={{ 
            width: '100%', 
            maxWidth: 400,
            height: 200, 
            bgcolor: '#ffebee', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 1,
            border: '1px dashed #f44336',
            p: 2
          }}
        >
          <Typography variant="body2" color="error" gutterBottom>
            Image failed to load
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', wordBreak: 'break-all' }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontSize: '0.7rem' }}>
            URL: {src.substring(0, 60)}...
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