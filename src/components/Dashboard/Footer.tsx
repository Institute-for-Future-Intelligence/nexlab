// Footer.tsx

import React from 'react';
import { Divider, Box, Typography } from '@mui/material';

import ReportBugButton from './ReportBugButton';

function Footer() {
    return (
      <Box component="footer" className="footer-container">
        <Box className="report-bug-container">
            <ReportBugButton />
        </Box>
        <Divider />
        <Box className="footer-content">
            <img 
                src={`${import.meta.env.BASE_URL}FooterLogoLong.png`} 
                alt="Logo" 
                className="footer-logo"
            />
            <Typography variant="body2" className="footer-text">
                The Institute for Future Intelligence (IFI) and Kapi'olani Community College (KCC) is funded in part by the National Science Foundation grant DUE 2300976.
            </Typography>
            <Typography variant="body2" className="footer-text">
                © 2025 Institute for Future Intelligence and Kapiʻolani Community College Antibody Engineering & Research Projects
            </Typography>
        </Box>
      </Box>
    );
}

export default Footer;