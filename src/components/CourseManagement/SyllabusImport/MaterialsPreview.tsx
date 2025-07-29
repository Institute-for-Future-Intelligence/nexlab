import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useSyllabusStore, GeneratedMaterial } from '../../../stores/syllabusStore';

interface MaterialsPreviewProps {
  onContinue?: () => void;
  onBack?: () => void;
}

const MaterialsPreview: React.FC<MaterialsPreviewProps> = ({
  onContinue,
  onBack
}) => {
  const {
    generatedMaterials,
    editMaterial,
    error
  } = useSyllabusStore();

  const [editingMaterial, setEditingMaterial] = useState<{
    index: number;
    material: GeneratedMaterial;
  } | null>(null);

  const [previewMaterial, setPreviewMaterial] = useState<GeneratedMaterial | null>(null);

  if (!generatedMaterials.length) {
    return (
      <Alert severity="warning">
        No materials generated. Please go back and process a syllabus first.
      </Alert>
    );
  }

  const handleEditMaterial = (index: number) => {
    setEditingMaterial({
      index,
      material: { ...generatedMaterials[index] }
    });
  };

  const handleSaveEdit = () => {
    if (editingMaterial) {
      editMaterial(editingMaterial.index, editingMaterial.material);
      setEditingMaterial(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMaterial(null);
  };

  const handlePreviewMaterial = (material: GeneratedMaterial) => {
    setPreviewMaterial(material);
  };

  const handleTogglePublished = (index: number) => {
    const material = generatedMaterials[index];
    editMaterial(index, { published: !material.published });
  };

  const formatContentPreview = (content: string, maxLength: number = 150): string => {
    // Remove HTML tags for preview
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  const getMaterialIcon = (title: string) => {
    if (title.toLowerCase().includes('overview')) {
      return <SchoolIcon color="primary" />;
    }
    if (title.toLowerCase().includes('week')) {
      return <ScheduleIcon color="secondary" />;
    }
    return <SchoolIcon color="action" />;
  };

  const publishedCount = generatedMaterials.filter(m => m.published).length;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Generated Course Materials
          </Typography>
          <Chip 
            label={`${publishedCount}/${generatedMaterials.length} will be published`}
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Review and customize the course materials generated from your syllabus. 
          You can edit content, toggle publication status, and organize materials before creating your course.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Materials Grid */}
      <Grid container spacing={3}>
        {generatedMaterials.map((material, index) => (
          <Grid item xs={12} md={6} lg={4} key={material.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: material.published ? '2px solid' : '1px solid',
                borderColor: material.published ? 'success.main' : 'divider'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Material Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                  {getMaterialIcon(material.title)}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" sx={{ 
                      fontSize: '1rem',
                      lineHeight: 1.3,
                      mb: 1
                    }}>
                      {material.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={material.published}
                            onChange={() => handleTogglePublished(index)}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="caption">
                            {material.published ? 'Will publish' : 'Draft'}
                          </Typography>
                        }
                        sx={{ mr: 0 }}
                      />
                      {material.scheduledTimestamp && (
                        <Chip 
                          label="Scheduled" 
                          size="small" 
                          variant="outlined" 
                          color="info"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Content Preview */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Sections:</strong> {material.sections.length}
                </Typography>

                {/* First section preview */}
                {material.sections[0] && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {material.sections[0].title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      fontSize: '0.85rem',
                      fontStyle: 'italic'
                    }}>
                      {formatContentPreview(material.sections[0].content)}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handlePreviewMaterial(material)}
                >
                  Preview
                </Button>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditMaterial(index)}
                >
                  Edit
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        {onBack && (
          <Button
            variant="outlined"
            onClick={onBack}
            size="large"
          >
            Back to Course Info
          </Button>
        )}
        
        {onContinue && (
          <Button
            variant="contained"
            color="primary"
            onClick={onContinue}
            size="large"
            disabled={publishedCount === 0}
          >
            Create Course with {publishedCount} Materials
          </Button>
        )}
      </Box>

      {/* Edit Material Dialog */}
      <Dialog
        open={editingMaterial !== null}
        onClose={handleCancelEdit}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Material: {editingMaterial?.material.title}
        </DialogTitle>
        <DialogContent>
          {editingMaterial && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Material Title"
                value={editingMaterial.material.title}
                onChange={(e) => setEditingMaterial({
                  ...editingMaterial,
                  material: {
                    ...editingMaterial.material,
                    title: e.target.value
                  }
                })}
                sx={{ mb: 3 }}
              />

              {/* Header */}
              <Typography variant="h6" sx={{ mb: 2 }}>Header</Typography>
              <TextField
                fullWidth
                label="Header Title"
                value={editingMaterial.material.header.title}
                onChange={(e) => setEditingMaterial({
                  ...editingMaterial,
                  material: {
                    ...editingMaterial.material,
                    header: {
                      ...editingMaterial.material.header,
                      title: e.target.value
                    }
                  }
                })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Header Content"
                value={editingMaterial.material.header.content}
                onChange={(e) => setEditingMaterial({
                  ...editingMaterial,
                  material: {
                    ...editingMaterial.material,
                    header: {
                      ...editingMaterial.material.header,
                      content: e.target.value
                    }
                  }
                })}
                sx={{ mb: 3 }}
              />

              {/* Sections */}
              <Typography variant="h6" sx={{ mb: 2 }}>Sections</Typography>
              {editingMaterial.material.sections.map((section, sectionIndex) => (
                <Accordion key={section.id} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{section.title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      fullWidth
                      label="Section Title"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = [...editingMaterial.material.sections];
                        newSections[sectionIndex] = {
                          ...newSections[sectionIndex],
                          title: e.target.value
                        };
                        setEditingMaterial({
                          ...editingMaterial,
                          material: {
                            ...editingMaterial.material,
                            sections: newSections
                          }
                        });
                      }}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Section Content"
                      value={section.content}
                      onChange={(e) => {
                        const newSections = [...editingMaterial.material.sections];
                        newSections[sectionIndex] = {
                          ...newSections[sectionIndex],
                          content: e.target.value
                        };
                        setEditingMaterial({
                          ...editingMaterial,
                          material: {
                            ...editingMaterial.material,
                            sections: newSections
                          }
                        });
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Material Dialog */}
      <Dialog
        open={previewMaterial !== null}
        onClose={() => setPreviewMaterial(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewMaterial?.title}
        </DialogTitle>
        <DialogContent>
          {previewMaterial && (
            <Box sx={{ pt: 1 }}>
              {/* Header */}
              <Paper sx={{ p: 2, mb: 3, backgroundColor: 'primary.50' }}>
                <Typography variant="h6" color="primary">
                  {previewMaterial.header.title}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {previewMaterial.header.content.replace(/<[^>]*>/g, '')}
                </Typography>
              </Paper>

              {/* Sections */}
              {previewMaterial.sections.map((section) => (
                <Box key={section.id} sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {section.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {section.content.replace(/<[^>]*>/g, '')}
                  </Typography>
                  
                  {/* Subsections */}
                  {section.subsections.map((subsection) => (
                    <Box key={subsection.id} sx={{ ml: 2, mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        {subsection.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {subsection.content.replace(/<[^>]*>/g, '')}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ))}

              {/* Footer */}
              <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                  {previewMaterial.footer.content.replace(/<[^>]*>/g, '')}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewMaterial(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialsPreview; 