import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';

const DashboardFooter: React.FC = () => {
  return (
    <Box 
      sx={{ 
        backgroundColor: colors.primary[100], // Match header background
        borderTop: `1px solid ${colors.primary[200]}`,
        height: '10vh', // 10% of viewport height
        minHeight: 70,
        maxHeight: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flexShrink: 0, // Prevent footer from shrinking
      }}
    >
      <Divider />
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          px: spacing[4],
          gap: spacing[4],
        }}
      >
        {/* Partner Logos */}
        <Box sx={{ flex: 0.25, display: 'flex', justifyContent: 'center' }}>
          <img 
            src={`${import.meta.env.BASE_URL}FooterLogoLong.png`} 
            alt="Partner Logos" 
            style={{ 
              height: 60,
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.primary[700]}`, // Thinner border
              opacity: 0.8, // 80% transparency
            }}
          />
        </Box>
        
        {/* Divider */}
        <Box className="divider" sx={{ 
          height: '60px', 
          borderLeft: `2px solid ${colors.primary[500]}`, 
          opacity: 0.8, // 80% transparency
        }} />
        
        {/* NSF Grant Text */}
        <Box sx={{ flex: 0.4 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.primary[700], // Same color as header tagline
              fontFamily: typography.fontFamily.secondary,
              fontSize: typography.fontSize.sm,
              lineHeight: 1.4,
              opacity: 0.8, // 80% transparency
            }}
          >
            This project is supported by the National Science Foundation (NSF) under grant number #2300976. Any opinions, findings, and conclusions or recommendations expressed in this material, however, are those of the authors and do not necessarily reflect the views of NSF.
          </Typography>
        </Box>
        
        {/* Divider */}
        <Box className="divider" sx={{ 
          height: '60px', 
          borderLeft: `2px solid ${colors.primary[500]}`, 
          opacity: 0.8, // 80% transparency
        }} />
        
        {/* Legal Links */}
        <Box sx={{ flex: 0.1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.primary[700], // Same color as header tagline
              fontFamily: typography.fontFamily.secondary,
              fontSize: typography.fontSize.sm,
              lineHeight: 1.4,
              opacity: 0.8, // 80% transparency
              mb: 1,
            }}
          >
            Legal:
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.primary[700], // Same color as header tagline
              fontFamily: typography.fontFamily.secondary,
              fontSize: typography.fontSize.sm,
              lineHeight: 1.4,
              opacity: 0.8, // 80% transparency
            }}
          >
            <a 
              href="https://intofuture.org/nexlab-privacy.html" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'inherit', 
                textDecoration: 'underline',
                opacity: 0.8,
              }}
            >
              Privacy Policy
            </a>
            {' • '}
            <a 
              href="https://intofuture.org/nexlab-terms.html" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'inherit', 
                textDecoration: 'underline',
                opacity: 0.8,
              }}
            >
              Terms of Service
            </a>
          </Typography>
        </Box>
        
        {/* Divider */}
        <Box className="divider" sx={{ 
          height: '60px', 
          borderLeft: `2px solid ${colors.primary[500]}`, 
          opacity: 0.8, // 80% transparency
        }} />
        
        {/* Copyright Text */}
        <Box sx={{ flex: 0.25 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.primary[700], // Same color as header tagline
              fontFamily: typography.fontFamily.secondary,
              fontSize: typography.fontSize.sm,
              lineHeight: 1.4,
              opacity: 0.8, // 80% transparency
            }}
          >
            © 2025 Institute for Future Intelligence and Kapi&apos;olani Community College Antibody Engineering & Research Projects.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardFooter;
