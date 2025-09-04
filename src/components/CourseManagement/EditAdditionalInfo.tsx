// src/components/CourseManagement/EditAdditionalInfo.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  FormControlLabel,
  Switch,
  Divider,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContactMail as ContactIcon,
  Policy as PolicyIcon,
  LibraryBooks as LibraryIcon,
  Assignment as AssignmentIcon,
  Science as LabIcon
} from '@mui/icons-material';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

interface EditAdditionalInfoProps {
  selectedCourse: string;
  onInfoUpdate: () => void;
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
}

const EditAdditionalInfo: React.FC<EditAdditionalInfoProps> = ({ selectedCourse, onInfoUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState<CourseAdditionalInfo>({});
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('contact');
  
  const db = getFirestore();

  useEffect(() => {
    if (open && selectedCourse) {
      fetchCourseInfo();
    }
  }, [open, selectedCourse]);

  const fetchCourseInfo = async () => {
    try {
      setLoading(true);
      const courseRef = doc(db, 'courses', selectedCourse);
      const courseSnap = await getDoc(courseRef);

      if (courseSnap.exists()) {
        const courseData = courseSnap.data();
        setAdditionalInfo(courseData.additionalInfo || {});
      }
    } catch (err) {
      console.error('Error fetching course info:', err);
      setError('Failed to load course information');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const courseRef = doc(db, 'courses', selectedCourse);
      
      await updateDoc(courseRef, {
        'additionalInfo': {
          ...additionalInfo,
          lastUpdated: new Date()
        }
      });

      onInfoUpdate();
      handleClose();
    } catch (err) {
      console.error('Error updating course info:', err);
      setError('Failed to save course information');
    } finally {
      setLoading(false);
    }
  };

  const updateContactInfo = (field: string, value: string) => {
    setAdditionalInfo(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };

  const updatePolicy = (field: string, value: string) => {
    setAdditionalInfo(prev => ({
      ...prev,
      policies: {
        ...prev.policies,
        [field]: value
      }
    }));
  };

  const addTextbook = () => {
    setAdditionalInfo(prev => ({
      ...prev,
      textbooks: [
        ...(prev.textbooks || []),
        { title: '', author: '', edition: '', isbn: '', required: true }
      ]
    }));
  };

  const updateTextbook = (index: number, field: string, value: string | boolean) => {
    setAdditionalInfo(prev => ({
      ...prev,
      textbooks: prev.textbooks?.map((book, i) => 
        i === index ? { ...book, [field]: value } : book
      )
    }));
  };

  const removeTextbook = (index: number) => {
    setAdditionalInfo(prev => ({
      ...prev,
      textbooks: prev.textbooks?.filter((_, i) => i !== index)
    }));
  };

  const addGradingComponent = () => {
    setAdditionalInfo(prev => ({
      ...prev,
      gradingPolicy: [
        ...(prev.gradingPolicy || []),
        { component: '', percentage: 0, description: '' }
      ]
    }));
  };

  const updateGradingComponent = (index: number, field: string, value: string | number) => {
    setAdditionalInfo(prev => ({
      ...prev,
      gradingPolicy: prev.gradingPolicy?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeGradingComponent = (index: number) => {
    setAdditionalInfo(prev => ({
      ...prev,
      gradingPolicy: prev.gradingPolicy?.filter((_, i) => i !== index)
    }));
  };

  const addListItem = (section: string, field: string) => {
    setAdditionalInfo(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof CourseAdditionalInfo],
        [field]: [...((prev[section as keyof CourseAdditionalInfo] as any)?.[field] || []), '']
      }
    }));
  };

  const updateListItem = (section: string, field: string, index: number, value: string) => {
    setAdditionalInfo(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof CourseAdditionalInfo],
        [field]: ((prev[section as keyof CourseAdditionalInfo] as any)?.[field] || []).map((item: string, i: number) => 
          i === index ? value : item
        )
      }
    }));
  };

  const removeListItem = (section: string, field: string, index: number) => {
    setAdditionalInfo(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof CourseAdditionalInfo],
        [field]: ((prev[section as keyof CourseAdditionalInfo] as any)?.[field] || []).filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="outlined"
        onClick={handleOpen}
        startIcon={<EditIcon />}
        sx={{
          fontFamily: 'Staatliches, sans-serif',
          fontSize: '1rem',
          backgroundColor: '#2196F3',
          color: '#FFFFFF',
          borderRadius: 1,
          textTransform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          transition: 'background-color 0.3s ease, transform 0.3s ease',
          '&:hover': {
            backgroundColor: '#1976D2',
            transform: 'scale(1.03)',
          },
        }}
      >
        Edit Additional Info
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5">Edit Additional Course Information</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ minHeight: '500px' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Contact Information */}
          <Accordion expanded={expandedAccordion === 'contact'} onChange={handleAccordionChange('contact')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ContactIcon color="primary" />
                <Typography variant="h6">Contact Information</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email"
                    fullWidth
                    value={additionalInfo.contactInfo?.email || ''}
                    onChange={(e) => updateContactInfo('email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Phone"
                    fullWidth
                    value={additionalInfo.contactInfo?.phone || ''}
                    onChange={(e) => updateContactInfo('phone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Office"
                    fullWidth
                    value={additionalInfo.contactInfo?.office || ''}
                    onChange={(e) => updateContactInfo('office', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Office Hours"
                    fullWidth
                    value={additionalInfo.contactInfo?.officeHours || ''}
                    onChange={(e) => updateContactInfo('officeHours', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Website"
                    fullWidth
                    value={additionalInfo.contactInfo?.website || ''}
                    onChange={(e) => updateContactInfo('website', e.target.value)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Textbooks */}
          <Accordion expanded={expandedAccordion === 'textbooks'} onChange={handleAccordionChange('textbooks')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LibraryIcon color="primary" />
                <Typography variant="h6">Textbooks & Resources</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Button startIcon={<AddIcon />} onClick={addTextbook} variant="outlined">
                  Add Textbook
                </Button>
              </Box>
              {additionalInfo.textbooks?.map((book, index) => (
                <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Title"
                        fullWidth
                        value={book.title}
                        onChange={(e) => updateTextbook(index, 'title', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Author"
                        fullWidth
                        value={book.author || ''}
                        onChange={(e) => updateTextbook(index, 'author', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Edition"
                        fullWidth
                        value={book.edition || ''}
                        onChange={(e) => updateTextbook(index, 'edition', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="ISBN"
                        fullWidth
                        value={book.isbn || ''}
                        onChange={(e) => updateTextbook(index, 'isbn', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={book.required}
                              onChange={(e) => updateTextbook(index, 'required', e.target.checked)}
                            />
                          }
                          label="Required"
                        />
                        <IconButton onClick={() => removeTextbook(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>

          {/* Grading Policy */}
          <Accordion expanded={expandedAccordion === 'grading'} onChange={handleAccordionChange('grading')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="primary" />
                <Typography variant="h6">Grading Policy</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Button startIcon={<AddIcon />} onClick={addGradingComponent} variant="outlined">
                  Add Grading Component
                </Button>
              </Box>
              {additionalInfo.gradingPolicy?.map((component, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Component"
                        fullWidth
                        value={component.component}
                        onChange={(e) => updateGradingComponent(index, 'component', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="Percentage"
                        type="number"
                        fullWidth
                        value={component.percentage}
                        onChange={(e) => updateGradingComponent(index, 'percentage', parseInt(e.target.value) || 0)}
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Description"
                        fullWidth
                        value={component.description || ''}
                        onChange={(e) => updateGradingComponent(index, 'description', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <IconButton onClick={() => removeGradingComponent(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>

          {/* Policies */}
          <Accordion expanded={expandedAccordion === 'policies'} onChange={handleAccordionChange('policies')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PolicyIcon color="primary" />
                <Typography variant="h6">Course Policies</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {[
                  { key: 'attendance', label: 'Attendance Policy' },
                  { key: 'lateWork', label: 'Late Work Policy' },
                  { key: 'academicIntegrity', label: 'Academic Integrity' },
                  { key: 'accommodations', label: 'Accommodations' },
                  { key: 'communication', label: 'Communication Policy' },
                  { key: 'safety', label: 'Safety Policy' },
                  { key: 'groupWork', label: 'Group Work Policy' },
                  { key: 'makeupPolicy', label: 'Make-up Policy' }
                ].map(({ key, label }) => (
                  <Grid item xs={12} key={key}>
                    <TextField
                      label={label}
                      multiline
                      rows={3}
                      fullWidth
                      value={(additionalInfo.policies as any)?.[key] || ''}
                      onChange={(e) => updatePolicy(key, e.target.value)}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Lab-Specific Information */}
          <Accordion expanded={expandedAccordion === 'lab'} onChange={handleAccordionChange('lab')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LabIcon color="primary" />
                <Typography variant="h6">Laboratory Information</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Safety Requirements</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Button 
                      startIcon={<AddIcon />} 
                      onClick={() => addListItem('labSpecific', 'safetyRequirements')}
                      size="small"
                      variant="outlined"
                    >
                      Add Safety Requirement
                    </Button>
                  </Box>
                  {additionalInfo.labSpecific?.safetyRequirements?.map((req, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={req}
                        onChange={(e) => updateListItem('labSpecific', 'safetyRequirements', index, e.target.value)}
                        placeholder="Safety requirement"
                      />
                      <IconButton 
                        onClick={() => removeListItem('labSpecific', 'safetyRequirements', index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Required Equipment</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Button 
                      startIcon={<AddIcon />} 
                      onClick={() => addListItem('labSpecific', 'requiredEquipment')}
                      size="small"
                      variant="outlined"
                    >
                      Add Equipment
                    </Button>
                  </Box>
                  {additionalInfo.labSpecific?.requiredEquipment?.map((equipment, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={equipment}
                        onChange={(e) => updateListItem('labSpecific', 'requiredEquipment', index, e.target.value)}
                        placeholder="Equipment item"
                      />
                      <IconButton 
                        onClick={() => removeListItem('labSpecific', 'requiredEquipment', index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Dress Code</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Button 
                      startIcon={<AddIcon />} 
                      onClick={() => addListItem('labSpecific', 'dresscode')}
                      size="small"
                      variant="outlined"
                    >
                      Add Dress Code Item
                    </Button>
                  </Box>
                  {additionalInfo.labSpecific?.dresscode?.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={item}
                        onChange={(e) => updateListItem('labSpecific', 'dresscode', index, e.target.value)}
                        placeholder="Dress code requirement"
                      />
                      <IconButton 
                        onClick={() => removeListItem('labSpecific', 'dresscode', index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditAdditionalInfo;
