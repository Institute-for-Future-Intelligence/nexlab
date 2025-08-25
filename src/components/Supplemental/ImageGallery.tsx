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
  const [retryAttempt, setRetryAttempt] = useState(0);

  // Preload image with retry mechanism
  useEffect(() => {
    setLoaded(false);
    setError(false);
    
    const img = new Image();
    
    // Add crossOrigin attribute for CORS handling (only on first attempt)
    if (retryAttempt === 0) {
      img.crossOrigin = 'anonymous';
    }
    
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
      
      // Test if this is a CORS issue by trying to fetch the image
      fetch(src, { method: 'HEAD', mode: 'cors' })
        .then(response => {
          console.error(`Fetch test result:`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          });
          
          // If fetch succeeds but image load failed, try without CORS
          if (response.ok && retryAttempt === 0) {
            console.log(`Retrying image load without CORS...`);
            setRetryAttempt(1);
            return;
          }
        })
        .catch(fetchError => {
          console.error(`Fetch test failed:`, fetchError);
        });
      
      setError(true);
    };
    
    setImageRef(img);

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