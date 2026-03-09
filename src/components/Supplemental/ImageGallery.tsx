// src/components/Supplemental/ImageGallery.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, Fade } from '@mui/material';

interface ImageGalleryProps {
  images: { url: string; title: string }[];
}

// Styled components for smooth transitions
const ImageContainer: React.FC<React.ComponentProps<typeof Box>> = ({ children, ...props }) => (
  <Box
    {...props}
    sx={{
      marginBottom: 4,
      textAlign: 'center',
      position: 'relative'
    }}
  >
    {children}
  </Box>
);

const StyledImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({
  src,
  alt,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => (
  <img
    src={src}
    alt={alt}
    {...props}
    style={{
      maxWidth: '100%',
      maxHeight: '500px',
      marginBottom: 8,
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease-in-out',
      ...style
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.02)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
      onMouseEnter?.(e);
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      onMouseLeave?.(e);
    }}
  />
);

const ImageSkeleton: React.FC<React.ComponentProps<typeof Skeleton>> = (props) => (
  <Skeleton
    {...props}
    sx={{
      borderRadius: 1,
      marginBottom: 1
    }}
  />
);

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
      const isFirebaseStorageImage = src.includes('firebasestorage.googleapis.com');
      const isInlineImage = src.startsWith('data:image/');

      console.error(`❌ SmartImage failed to load: ${src}`, error);
      console.error(`Image details:`, {
        src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      });
      console.error(
        'Image load failed in the browser. This usually means the stored object is invalid, mislabeled, or the URL points at a non-image response.',
        {
          isFirebaseStorageImage,
          isInlineImage,
        }
      );
      
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