// src/components/LaboratoryNotebookV2/Toolbar/LabToolbar.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { colors, typography, spacing, borderRadius, shadows } from '../../../config/designSystem';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { CourseSelector, CourseOption } from '../../common';
import { useUser } from '../../../hooks/useUser';

const LabToolbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { userDetails } = useUser();

  // Local state for search input (to avoid triggering store updates on every keystroke)
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  const searchQuery = useLabNotebookStore((state) => state.filters.searchQuery);
  const setSearchQuery = useLabNotebookStore((state) => state.setSearchQuery);
  const selectedCourse = useLabNotebookStore((state) => state.filters.courseId);
  const setSelectedCourse = useLabNotebookStore((state) => state.setSelectedCourse);
  const viewMode = useLabNotebookStore((state) => state.viewMode);
  const setViewMode = useLabNotebookStore((state) => state.setViewMode);
  const setActivePanel = useLabNotebookStore((state) => state.setActivePanel);
  const fetchAllData = useLabNotebookStore((state) => state.fetchAllData);

  // Sync local state with store on mount
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, []);

  // Debounced search: update store after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        setSearchQuery(localSearchQuery);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [localSearchQuery, searchQuery, setSearchQuery]);

  // Convert user courses to CourseOption format
  const courseOptions: CourseOption[] = Object.entries(userDetails?.classes || {}).map(([id, course]) => ({
    id,
    number: course.number,
    title: course.title,
    isCourseAdmin: course.isCourseAdmin,
  }));

  const handleAddDesign = () => {
    setActivePanel('create');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: spacing[3],
        alignItems: isMobile ? 'stretch' : 'center',
      }}
    >
        {/* Left side - Course filter (40% width) */}
        <Box sx={{ 
          flex: isMobile ? '1' : '0 0 40%',
          minWidth: isMobile ? '100%' : 'auto'
        }}>
          <CourseSelector
            value={selectedCourse || ''}
            onChange={(courseId) => setSelectedCourse(courseId || null)}
            courses={[
              { id: '', number: 'All', title: 'My Designs', isCourseAdmin: false },
              ...courseOptions
            ]}
            size="medium"
            showAdminBadge={false}
            label="" // Remove the "Course" label
            placeholder="Filter by course..."
          />
        </Box>

        {/* Middle - Search (60% width) */}
        <Box sx={{ 
          flex: isMobile ? '1' : '0 0 60%',
          minWidth: isMobile ? '100%' : 'auto'
        }}>
          <TextField
            placeholder="Search designs..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            size="medium"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.text.tertiary }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: borderRadius.lg,
                backgroundColor: colors.background.secondary,
                '& fieldset': {
                  borderColor: colors.neutral[200],
                },
                '&:hover fieldset': {
                  borderColor: colors.neutral[300],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.primary[500],
                },
              },
            }}
          />
        </Box>
      </Box>
  );
};

export default LabToolbar;

