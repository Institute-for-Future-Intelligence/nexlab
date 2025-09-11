import React from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Chip,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  School as SchoolIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import { CourseInfo } from '../../../types/quiz';

interface CourseSelectorProps {
  courses: CourseInfo[];
  selectedCourse: CourseInfo | null;
  onSelect: (course: CourseInfo | null) => void;
  loading?: boolean;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  courses,
  selectedCourse,
  onSelect,
  loading = false
}) => {
  return (
    <Box>
      <Autocomplete
        value={selectedCourse}
        onChange={(_, newValue) => onSelect(newValue)}
        options={courses}
        getOptionLabel={(option) => option.courseTitle}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Course"
            placeholder="Choose a course to filter materials..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'Gabarito, sans-serif',
                '& fieldset': {
                  borderColor: '#CDDAFF',
                  borderWidth: 2
                },
                '&:hover fieldset': {
                  borderColor: '#0B53C0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#0B53C0',
                  borderWidth: 2
                }
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Gabarito, sans-serif',
                color: '#0B53C0',
                fontWeight: 'bold',
                '&.Mui-focused': {
                  color: '#0B53C0'
                }
              }
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <Box 
              component="li" 
              key={option.courseId} 
              {...otherProps}
              sx={{
                '&:hover': {
                  backgroundColor: '#F0F4FF !important'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', p: 2 }}>
                <SchoolIcon 
                  sx={{ 
                    mr: 2, 
                    flexShrink: 0, 
                    color: '#0B53C0',
                    fontSize: 28
                  }} 
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="subtitle1" 
                    noWrap
                    sx={{
                      fontFamily: 'Staatliches, sans-serif',
                      fontSize: '1.1rem',
                      color: '#0B53C0',
                      fontWeight: 'bold'
                    }}
                  >
                    {option.courseTitle}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{
                      fontFamily: 'Gabarito, sans-serif',
                      color: '#666666',
                      display: 'flex',
                      alignItems: 'center',
                      mt: 0.5
                    }}
                  >
                    <QuizIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    {option.chatbotCount} material{option.chatbotCount !== 1 ? 's' : ''} • {option.quizCount} quiz{option.quizCount !== 1 ? 'zes' : ''} available
                  </Typography>
                </Box>
                <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                  <Chip
                    label={`${option.chatbotCount} Material${option.chatbotCount !== 1 ? 's' : ''}`}
                    size="small"
                    sx={{ 
                      backgroundColor: '#CDDAFF',
                      color: '#0B53C0',
                      fontFamily: 'Gabarito, sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  />
                  {option.quizCount > 0 && (
                    <Chip
                      label={`${option.quizCount} Quiz${option.quizCount !== 1 ? 'zes' : ''}`}
                      size="small"
                      sx={{ 
                        backgroundColor: '#C8E6C9',
                        color: '#2E7D32',
                        fontFamily: 'Gabarito, sans-serif',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          );
        }}
        PaperComponent={(props) => (
          <Paper 
            {...props} 
            sx={{ 
              mt: 1,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid #CDDAFF',
              backgroundColor: '#FFFFFF'
            }} 
          />
        )}
        isOptionEqualToValue={(option, value) => option.courseId === value.courseId}
        noOptionsText={
          loading ? "Loading courses..." : "No courses found."
        }
        clearOnBlur
        selectOnFocus
      />
    </Box>
  );
};

export default CourseSelector;
