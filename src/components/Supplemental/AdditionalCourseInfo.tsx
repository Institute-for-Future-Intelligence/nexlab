// src/components/Supplemental/AdditionalCourseInfo.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  ContactMail as ContactIcon,
  Policy as PolicyIcon,
  LibraryBooks as LibraryIcon,
  Assignment as AssignmentIcon,
  Science as LabIcon,
  Description as SyllabusIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { formatSyllabusFileSize, getSyllabusFileTypeDescription } from '../../services/syllabusFileService';

interface AdditionalCourseInfoProps {
  courseId: string;
  isAdmin?: boolean;
}

interface CourseAdditionalInfo {
  contactInfo?: {
    email?: string;
    phone?: string;
    office?: string;
    officeHours?: string;
    website?: string;
  };
  policies?: {
    attendance?: string;
    lateWork?: string;
    academicIntegrity?: string;
    accommodations?: string;
    communication?: string;
    safety?: string;
    groupWork?: string;
    makeupPolicy?: string;
  };
  additionalResources?: {
    software?: string[];
    equipment?: string[];
    websites?: string[];
    tutoring?: string;
    learningPlatform?: string;
  };
  labSpecific?: {
    safetyRequirements?: string[];
    requiredEquipment?: string[];
    dresscode?: string[];
    notebookRequirements?: string;
    groupWorkStructure?: string;
    makeupPolicy?: string;
  };
  textbooks?: {
    title: string;
    author?: string;
    edition?: string;
    isbn?: string;
    required: boolean;
  }[];
  gradingPolicy?: {
    component: string;
    percentage: number;
    description?: string;
  }[];
  assignments?: {
    name: string;
    description: string;
    type: string;
    dueDate?: string;
    points?: number;
    weight?: number;
  }[];
  prerequisites?: string[];
  lastUpdated?: Date;
  // Allow for additional fields not explicitly defined
  [key: string]: any;
}

interface SyllabusFile {
  url: string;
  path: string;
  metadata: {
    originalFilename: string;
    fileSize: number;
    fileType: string;
    uploadedAt: Date;
    uploadedBy: string;
    courseId?: string;
  };
}

const AdditionalCourseInfo: React.FC<AdditionalCourseInfoProps> = ({ courseId, isAdmin = false }) => {
  const [additionalInfo, setAdditionalInfo] = useState<CourseAdditionalInfo | null>(null);
  const [syllabusFile, setSyllabusFile] = useState<SyllabusFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syllabusDialogOpen, setSyllabusDialogOpen] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        setLoading(true);
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const courseData = courseSnap.data();
          setAdditionalInfo(courseData.additionalInfo || null);
          setSyllabusFile(courseData.syllabusFile || null);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('Error fetching course additional info:', err);
        setError('Failed to load course information');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseInfo();
    }
  }, [courseId, db]);

  const handleDownloadSyllabus = () => {
    if (syllabusFile?.url) {
      window.open(syllabusFile.url, '_blank');
    }
  };

  // Function to get additional fields not covered by our predefined structure
  const getAdditionalFields = () => {
    if (!additionalInfo) return {};
    
    const knownFields = new Set([
      'contactInfo', 'policies', 'additionalResources', 'labSpecific', 
      'textbooks', 'gradingPolicy', 'assignments', 'prerequisites', 'lastUpdated'
    ]);
    
    const additionalFields: { [key: string]: any } = {};
    
    Object.keys(additionalInfo).forEach(key => {
      if (!knownFields.has(key) && additionalInfo[key] != null) {
        additionalFields[key] = additionalInfo[key];
      }
    });
    
    return additionalFields;
  };

  const additionalFields = getAdditionalFields();
  const hasAdditionalFields = Object.keys(additionalFields).length > 0;

  const hasAnyInfo = additionalInfo && (
    additionalInfo.contactInfo ||
    additionalInfo.policies ||
    additionalInfo.additionalResources ||
    additionalInfo.labSpecific ||
    additionalInfo.textbooks?.length ||
    additionalInfo.gradingPolicy?.length ||
    additionalInfo.assignments?.length ||
    additionalInfo.prerequisites?.length ||
    hasAdditionalFields
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!hasAnyInfo && !syllabusFile) {
    return null; // Don't show the component if there's no additional information
  }

  return (
    <Paper sx={{ 
      p: 3, 
      mb: 4, 
      backgroundColor: '#f8f9fa', 
      borderRadius: '15px',
      border: '1px solid #e3f2fd'
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          fontFamily: 'Staatliches, sans-serif',
          fontWeight: 'bold',
          color: '#0B53C0',
          fontSize: '2rem'
        }}
      >
        <InfoIcon sx={{ color: '#0B53C0' }} />
        Course Information
      </Typography>

      {/* Syllabus File */}
      {syllabusFile && (
        <Box sx={{ mb: 3 }}>
                <Button
        variant="outlined"
        startIcon={<SyllabusIcon />}
        endIcon={<DownloadIcon />}
        onClick={() => setSyllabusDialogOpen(true)}
        sx={{ 
          mb: 2,
          fontFamily: 'Staatliches, sans-serif',
          fontSize: '1.2rem',
          textTransform: 'none',
          borderRadius: '15px',
          backgroundColor: '#CDDAFF',
          color: '#0B53C0',
          border: '1px solid #0B53C0',
          '&:hover': {
            backgroundColor: '#0B53C0',
            color: '#FFFFFF',
          }
        }}
      >
        Syllabus
      </Button>
        </Box>
      )}

      {hasAnyInfo && (
        <Box sx={{ mb: 2 }}>
          {/* Contact Information */}
          {additionalInfo?.contactInfo && Object.keys(additionalInfo.contactInfo).length > 0 && (
            <Accordion>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ color: '#0B53C0' }} />}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f0f7ff !important',
                  },
                  '&.Mui-expanded': {
                    backgroundColor: '#f0f7ff',
                  },
                  backgroundColor: 'transparent',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ContactIcon sx={{ color: '#0B53C0' }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'Staatliches, sans-serif',
                      fontWeight: 'bold',
                      color: '#0B53C0',
                      fontSize: '1.25rem'
                    }}
                  >
                    Contact Information
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {additionalInfo.contactInfo.email && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{additionalInfo.contactInfo.email}</Typography>
                    </Grid>
                  )}
                  {additionalInfo.contactInfo.phone && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{additionalInfo.contactInfo.phone}</Typography>
                    </Grid>
                  )}
                  {additionalInfo.contactInfo.office && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Office</Typography>
                      <Typography variant="body1">{additionalInfo.contactInfo.office}</Typography>
                    </Grid>
                  )}
                  {additionalInfo.contactInfo.officeHours && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Office Hours</Typography>
                      <Typography variant="body1">{additionalInfo.contactInfo.officeHours}</Typography>
                    </Grid>
                  )}
                  {additionalInfo.contactInfo.website && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Website</Typography>
                      <Typography variant="body1">
                        <a href={additionalInfo.contactInfo.website} target="_blank" rel="noopener noreferrer">
                          {additionalInfo.contactInfo.website}
                        </a>
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Textbooks */}
          {additionalInfo?.textbooks && additionalInfo.textbooks.length > 0 && (
            <Accordion>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ color: '#0B53C0' }} />}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f0f7ff !important',
                  },
                  '&.Mui-expanded': {
                    backgroundColor: '#f0f7ff',
                  },
                  backgroundColor: 'transparent',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LibraryIcon sx={{ color: '#0B53C0' }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'Staatliches, sans-serif',
                      fontWeight: 'bold',
                      color: '#0B53C0',
                      fontSize: '1.25rem'
                    }}
                  >
                    Textbooks & Resources
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {additionalInfo.textbooks.map((book, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {book.title}
                            </Typography>
                            <Chip 
                              label={book.required ? 'Required' : 'Optional'} 
                              size="small" 
                              color={book.required ? 'error' : 'default'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            {book.author && <Typography variant="body2">by {book.author}</Typography>}
                            {book.edition && <Typography variant="body2">Edition: {book.edition}</Typography>}
                            {book.isbn && <Typography variant="body2">ISBN: {book.isbn}</Typography>}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Grading Policy */}
          {additionalInfo?.gradingPolicy && additionalInfo.gradingPolicy.length > 0 && (
            <Accordion>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ color: '#0B53C0' }} />}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f0f7ff !important',
                  },
                  '&.Mui-expanded': {
                    backgroundColor: '#f0f7ff',
                  },
                  backgroundColor: 'transparent',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon sx={{ color: '#0B53C0' }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'Staatliches, sans-serif',
                      fontWeight: 'bold',
                      color: '#0B53C0',
                      fontSize: '1.25rem'
                    }}
                  >
                    Grading Policy
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {additionalInfo.gradingPolicy.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">{item.component}</Typography>
                            <Chip label={`${item.percentage}%`} size="small" color="primary" />
                          </Box>
                        }
                        secondary={item.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Lab-Specific Information */}
          {additionalInfo?.labSpecific && Object.keys(additionalInfo.labSpecific).length > 0 && (
            <Accordion>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ color: '#0B53C0' }} />}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f0f7ff !important',
                  },
                  '&.Mui-expanded': {
                    backgroundColor: '#f0f7ff',
                  },
                  backgroundColor: 'transparent',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LabIcon sx={{ color: '#0B53C0' }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'Staatliches, sans-serif',
                      fontWeight: 'bold',
                      color: '#0B53C0',
                      fontSize: '1.25rem'
                    }}
                  >
                    Laboratory Information
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {additionalInfo.labSpecific.safetyRequirements && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        Safety Requirements
                      </Typography>
                      <List dense>
                        {additionalInfo.labSpecific.safetyRequirements.map((req, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <Typography variant="body2">• {req}</Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  )}
                  {additionalInfo.labSpecific.dresscode && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        Dress Code
                      </Typography>
                      <List dense>
                        {additionalInfo.labSpecific.dresscode.map((item, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <Typography variant="body2">• {item}</Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  )}
                  {additionalInfo.labSpecific.requiredEquipment && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        Required Equipment
                      </Typography>
                      <List dense>
                        {additionalInfo.labSpecific.requiredEquipment.map((item, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <Typography variant="body2">• {item}</Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Policies */}
          {additionalInfo?.policies && Object.keys(additionalInfo.policies).length > 0 && (
            <Accordion>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ color: '#0B53C0' }} />}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f0f7ff !important',
                  },
                  '&.Mui-expanded': {
                    backgroundColor: '#f0f7ff',
                  },
                  backgroundColor: 'transparent',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PolicyIcon sx={{ color: '#0B53C0' }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'Staatliches, sans-serif',
                      fontWeight: 'bold',
                      color: '#0B53C0',
                      fontSize: '1.25rem'
                    }}
                  >
                    Course Policies
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {Object.entries(additionalInfo.policies).map(([key, value]) => {
                    if (!value) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <Grid item xs={12} key={key}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                          {label}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {value}
                        </Typography>
                        <Divider sx={{ mt: 1 }} />
                      </Grid>
                    );
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Additional Fields - Any fields not explicitly handled above */}
          {hasAdditionalFields && (
            <Accordion>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ color: '#0B53C0' }} />}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f0f7ff !important',
                  },
                  '&.Mui-expanded': {
                    backgroundColor: '#f0f7ff',
                  },
                  backgroundColor: 'transparent',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon sx={{ color: '#0B53C0' }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'Staatliches, sans-serif',
                      fontWeight: 'bold',
                      color: '#0B53C0',
                      fontSize: '1.25rem'
                    }}
                  >
                    Other Course Information
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {Object.entries(additionalFields).map(([key, value]) => {
                    const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    
                    return (
                      <Grid item xs={12} key={key}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                          {displayKey}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {Array.isArray(value) ? (
                            <List dense>
                              {value.map((item, index) => (
                                <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                                  <Typography variant="body2">
                                    • {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
                                  </Typography>
                                </ListItem>
                              ))}
                            </List>
                          ) : typeof value === 'object' ? (
                            <Box sx={{ p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
                              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                {JSON.stringify(value, null, 2)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2">
                              {String(value)}
                            </Typography>
                          )}
                        </Box>
                        {Object.keys(additionalFields).indexOf(key) < Object.keys(additionalFields).length - 1 && (
                          <Divider sx={{ mt: 2 }} />
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      )}

      {/* Syllabus File Dialog */}
      <Dialog 
        open={syllabusDialogOpen} 
        onClose={() => setSyllabusDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '15px',
            backgroundColor: '#f8f9fa',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontFamily: 'Staatliches, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#0B53C0',
            backgroundColor: '#ECF4FE',
            borderBottom: '1px solid #e3f2fd'
          }}
        >
          <SyllabusIcon sx={{ color: '#0B53C0' }} />
          Syllabus Document
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {syllabusFile && (
            <Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2,
                  fontFamily: 'Staatliches, sans-serif',
                  fontSize: '1.1rem',
                  color: '#0B53C0'
                }}
              >
                <strong>Filename:</strong> {syllabusFile.metadata.originalFilename}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Type:</strong> {getSyllabusFileTypeDescription(syllabusFile.metadata.fileType)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Size:</strong> {formatSyllabusFileSize(syllabusFile.metadata.fileSize)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Uploaded:</strong> {
                  (() => {
                    if (!syllabusFile.metadata.uploadedAt) return 'Date not available';
                    
                    const uploadedAt = syllabusFile.metadata.uploadedAt;
                    
                    // Handle Date object
                    if (uploadedAt instanceof Date) {
                      return uploadedAt.toLocaleDateString();
                    }
                    
                    // Handle Firestore Timestamp (has seconds property)
                    if (typeof uploadedAt === 'object' && uploadedAt !== null && 'seconds' in uploadedAt) {
                      return new Date((uploadedAt as any).seconds * 1000).toLocaleDateString();
                    }
                    
                    // Handle string or number
                    try {
                      return new Date(uploadedAt).toLocaleDateString();
                    } catch {
                      return 'Date not available';
                    }
                  })()
                }
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setSyllabusDialogOpen(false)}
            sx={{
              fontFamily: 'Staatliches, sans-serif',
              fontSize: '1.1rem',
              textTransform: 'none',
              borderRadius: '15px',
              color: '#666',
              '&:hover': {
                backgroundColor: '#f0f0f0'
              }
            }}
          >
            Close
          </Button>
          <Button 
            onClick={handleDownloadSyllabus} 
            variant="contained" 
            startIcon={<DownloadIcon />}
            sx={{
              fontFamily: 'Staatliches, sans-serif',
              fontSize: '1.1rem',
              textTransform: 'none',
              borderRadius: '15px',
              backgroundColor: '#CDDAFF',
              color: '#0B53C0',
              '&:hover': {
                backgroundColor: '#0B53C0',
                color: '#FFFFFF'
              }
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdditionalCourseInfo;
