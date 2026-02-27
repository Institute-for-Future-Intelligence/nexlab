// src/components/Supplemental/ImageGallery.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, Fade } from '@mui/material';

interface ImageGalleryProps {
  images: { url: string; title: string }[];
}

// Styled components for smooth transitions
const ImageContainer = ({ children, ...props }: any) => (
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

const StyledImage = ({ src, alt, ...props }: any) => (
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
      ...props.style
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.02)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    }}
  />
);

const ImageSkeleton = (props: any) => (
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
  const [retryAttempt, setRetryAttempt] = useState(0);
  const MAX_RETRIES = 3;

  // Preload image with retry mechanism
  useEffect(() => {
    setLoaded(false);
    setError(false);
    
    const img = new Image();
    
    // Enable CORS for Firebase Storage images
    // This allows Canvas API and PDF generation to access image data
    // Requires Firebase Storage CORS configuration to be set
    img.crossOrigin = 'anonymous';
    
    img.src = src;
    
    img.onload = () => {
      console.log(`✅ SmartImage loaded: ${src.substring(0, 50)}... (attempt ${retryAttempt + 1})`);
      setLoaded(true);
    };
    
    img.onerror = (error) => {
      console.error(`❌ SmartImage failed to load: ${src} (attempt ${retryAttempt + 1}/${MAX_RETRIES})`, error);
      
      // Retry logic for transient network failures
      if (retryAttempt < MAX_RETRIES) {
        const delay = 1000 * Math.pow(2, retryAttempt); // Exponential backoff: 1s, 2s, 4s
        console.log(`🔄 Retrying image load in ${delay}ms...`);
        
        setTimeout(() => {
          setRetryAttempt(prev => prev + 1);
        }, delay);
      } else {
        console.error(`❌ Image failed to load after ${MAX_RETRIES} attempts`);
        console.error(`Image details:`, {
          src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete
        });
        
        // Log potential causes
        if (src.includes('firebasestorage.googleapis.com')) {
          console.error(`⚠️ Firebase Storage CORS may not be configured.`);
          console.error(`Run: gsutil cors set firebase-storage-cors.json gs://YOUR_BUCKET_NAME`);
        }
        
        setError(true);
      }
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
            ❌ Image failed to load after 3 attempts
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', wordBreak: 'break-all' }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontSize: '0.7rem' }}>
            URL: {src.substring(0, 60)}...
          </Typography>
          {src.includes('firebasestorage.googleapis.com') && (
            <Typography variant="caption" color="warning.main" sx={{ mt: 1, textAlign: 'center', fontSize: '0.7rem' }}>
              ⚠️ Possible CORS configuration issue
            </Typography>
          )}
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