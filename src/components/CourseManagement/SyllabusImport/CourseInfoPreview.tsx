import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Chip,
  IconButton,
  Button,
  Grid,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSyllabusStore, ParsedCourseInfo, WeeklyTopic } from '../../../stores/syllabusStore';

interface CourseInfoPreviewProps {
  onContinue?: () => void;
}

const CourseInfoPreview: React.FC<CourseInfoPreviewProps> = ({
  onContinue
}) => {
  const {
    parsedCourseInfo,
    editCourseInfo,
    error,
    isProcessing,
    currentStep
  } = useSyllabusStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ParsedCourseInfo | null>(null);

  if (!parsedCourseInfo) {
    return (
      <Alert severity="warning">
        No course information available. Please upload and process a syllabus first.
      </Alert>
    );
  }

  // Don't show content if still processing - even if we have parsedCourseInfo
  if (isProcessing || currentStep === 'processing') {
    return (
      <Alert severity="info">
        <Typography variant="body2">
          📊 Processing complete! Preparing course information for review...
        </Typography>
      </Alert>
    );
  }

  const handleStartEdit = () => {
    setEditData({ ...parsedCourseInfo });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editData) {
      editCourseInfo(editData);
      setIsEditing(false);
      setEditData(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleAddObjective = () => {
    if (editData) {
      setEditData({
        ...editData,
        objectives: [...editData.objectives, 'New objective']
      });
    }
  };

  const handleDeleteObjective = (index: number) => {
    if (editData) {
      const newObjectives = editData.objectives.filter((_, i) => i !== index);
      setEditData({
        ...editData,
        objectives: newObjectives
      });
    }
  };

  const handleObjectiveChange = (index: number, value: string) => {
    if (editData) {
      const newObjectives = [...editData.objectives];
      newObjectives[index] = value;
      setEditData({
        ...editData,
        objectives: newObjectives
      });
    }
  };

  const handleScheduleChange = (index: number, field: keyof WeeklyTopic, value: string) => {
    if (editData) {
      const newSchedule = [...editData.schedule];
      newSchedule[index] = {
        ...newSchedule[index],
        [field]: value
      };
      setEditData({
        ...editData,
        schedule: newSchedule
      });
    }
  };

  const currentData = isEditing ? editData : parsedCourseInfo;

  if (!currentData) return null;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Course Information Preview
          </Typography>
          
          {!isEditing ? (
            <Button
              startIcon={<EditIcon />}
              onClick={handleStartEdit}
              variant="outlined"
            >
              Edit Details
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSaveEdit}
                variant="contained"
                color="primary"
              >
                Save
              </Button>
              <Button
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                variant="outlined"
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Basic Course Info */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Course Number"
              value={currentData.suggestedNumber}
              onChange={(e) => isEditing && editData && setEditData({
                ...editData,
                suggestedNumber: e.target.value
              })}
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Course Title"
              value={currentData.suggestedTitle}
              onChange={(e) => isEditing && editData && setEditData({
                ...editData,
                suggestedTitle: e.target.value
              })}
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Course Description"
              value={currentData.suggestedDescription}
              onChange={(e) => isEditing && editData && setEditData({
                ...editData,
                suggestedDescription: e.target.value
              })}
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Learning Objectives */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Learning Objectives ({currentData.objectives.length})
            </Typography>
            {isEditing && (
              <IconButton onClick={handleAddObjective} color="primary">
                <AddIcon />
              </IconButton>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {currentData.objectives.map((objective, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ minWidth: 24, color: 'text.secondary' }}>
                  {index + 1}.
                </Typography>
                {isEditing ? (
                  <>
                    <TextField
                      fullWidth
                      multiline
                      value={objective}
                      onChange={(e) => handleObjectiveChange(index, e.target.value)}
                      size="small"
                    />
                    <IconButton 
                      onClick={() => handleDeleteObjective(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                ) : (
                  <Typography variant="body2">
                    {objective}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Course Schedule */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Course Schedule ({currentData.schedule.length} weeks)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {currentData.schedule.slice(0, 8).map((week, index) => (
                <Paper key={index} sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={1}>
                      <Chip 
                        label={`W${week.week}`} 
                        size="small" 
                        color="primary" 
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          size="small"
                          label="Topic"
                          value={week.topic}
                          onChange={(e) => handleScheduleChange(index, 'topic', e.target.value)}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {week.topic}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          size="small"
                          label="Description"
                          value={week.description || ''}
                          onChange={(e) => handleScheduleChange(index, 'description', e.target.value)}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {week.description || 'No description'}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              
              {currentData.schedule.length > 8 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                  ... and {currentData.schedule.length - 8} more weeks
                </Typography>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Additional Info */}
        {(currentData.prerequisites?.length || currentData.textbook || currentData.grading) && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Additional Information
            </Typography>
            
            <Grid container spacing={2}>
              {currentData.prerequisites && currentData.prerequisites.length > 0 && (
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Prerequisites:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentData.prerequisites.join(', ')}
                  </Typography>
                </Grid>
              )}
              
              {currentData.textbook && (
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Textbook:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentData.textbook}
                  </Typography>
                </Grid>
              )}
              
              {currentData.grading && (
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Grading:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentData.grading}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {/* Continue Button */}
        {onContinue && (
          <Box sx={{ mt: 4, textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={onContinue}
              disabled={isEditing}
            >
              Continue to Materials Preview
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CourseInfoPreview; 