// src/components/LaboratoryNotebookV2/index.tsx
import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert, useTheme, useMediaQuery } from '@mui/material';
import { useUser } from '../../hooks/useUser';
import { useLabNotebookStore } from '../../stores/labNotebookStore';
import { colors, spacing, typography, borderRadius } from '../../config/designSystem';
import { PageHeader } from '../common';
import LabToolbar from './Toolbar/LabToolbar';
import DesignsTable from './DesignsTable';
import CreatePanel from './Panels/CreatePanel';
import ExpandedCreatePanel from './Panels/ExpandedCreatePanel';

/**
 * Laboratory Notebook V2 - Main Page
 * Table view of all designs with summary statistics
 */
const LaboratoryNotebookV2: React.FC = () => {
  const { userDetails, loading: userLoading } = useUser();
  const [initialized, setInitialized] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isLoading = useLabNotebookStore((state) => state.isLoading);
  const error = useLabNotebookStore((state) => state.error);
  const fetchAllData = useLabNotebookStore((state) => state.fetchAllData);
  const designs = useLabNotebookStore((state) => state.designs);
  const activePanel = useLabNotebookStore((state) => state.activePanel);
  const isExpanded = useLabNotebookStore((state) => state.isExpanded);
  const searchQuery = useLabNotebookStore((state) => state.filters.searchQuery);
  const selectedCourse = useLabNotebookStore((state) => state.filters.courseId);

  // Filter designs based on search and course
  const filteredDesigns = React.useMemo(() => {
    let filtered = designs;

    // Filter by course
    if (selectedCourse) {
      filtered = filtered.filter(d => d.course === selectedCourse);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [designs, searchQuery, selectedCourse]);

  // Fetch data when component mounts
  useEffect(() => {
    if (!userLoading && userDetails && !initialized) {
      const courses = Object.keys(userDetails.classes || {});
      fetchAllData(userDetails.uid, userDetails.isAdmin, courses);
      setInitialized(true);
    }
  }, [userDetails, userLoading, fetchAllData, initialized]);

  // Show loading state
  if (userLoading || (isLoading && !initialized)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          gap: spacing[4],
        }}
      >
        <CircularProgress size={60} sx={{ color: colors.primary[500] }} />
        <Typography
          variant="h6"
          sx={{
            fontFamily: typography.fontFamily.display,
            color: colors.text.secondary,
          }}
        >
          Loading your laboratory notebook...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    const isPermissionError = error.includes('permission') || error.includes('rules');
    
    return (
      <Box sx={{ p: spacing[6] }}>
        <PageHeader
          title="Laboratory Notebook"
          subtitle="Visualize and manage your experimental designs"
        />
        <Alert
          severity="error"
          sx={{ mt: spacing[4], borderRadius: '12px' }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Error Loading Data
          </Typography>
          <Typography variant="body2" sx={{ mb: isPermissionError ? 2 : 0 }}>
            {error}
          </Typography>
          {isPermissionError && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                To fix this issue:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                <li>Deploy Firebase security rules using: <code>firebase deploy --only firestore:rules</code></li>
                <li>Or manually update rules in Firebase Console</li>
                <li>See <code>docs/FIREBASE_RULES_SETUP.md</code> for detailed instructions</li>
              </Typography>
            </Box>
          )}
        </Alert>
      </Box>
    );
  }

  // Check if user has access
  const hasAccess = userDetails && (
    userDetails.isAdmin ||
    userDetails.isSuperAdmin ||
    (userDetails.classes && Object.keys(userDetails.classes).length > 0)
  );

  if (!hasAccess) {
    return (
      <Box sx={{ p: spacing[6] }}>
        <PageHeader
          title="Laboratory Notebook"
          subtitle="Visualize and manage your experimental designs"
        />
        <Alert
          severity="info"
          sx={{ mt: spacing[4], borderRadius: '12px' }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Course Enrollment Required
          </Typography>
          <Typography variant="body2">
            The Laboratory Notebook is accessible to users enrolled in an academic course.
            Please enroll in a course via &apos;My Account&apos; by following the instructions provided
            by your academic instructor.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Main table view
  return (
    <Box
      sx={{
        p: isMobile ? spacing[3] : spacing[6],
        backgroundColor: colors.background.primary,
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <PageHeader
        title="Laboratory Notebook"
        subtitle="Manage your experimental designs, builds, and tests"
      />

      {/* Toolbar */}
      <Box sx={{ mb: spacing[6] }}>
        <LabToolbar />
      </Box>

      {/* Table Content */}
      {initialized && (
        <>
          {/* Summary Stats */}
          <Box
            sx={{
              display: 'flex',
              gap: spacing[4],
              mb: spacing[4],
              flexWrap: 'wrap',
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: 200,
                p: spacing[4],
                backgroundColor: colors.primary[50],
                borderRadius: borderRadius.xl,
                border: `1px solid ${colors.primary[200]}`,
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontFamily: typography.fontFamily.display,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.primary[700],
                  mb: spacing[1],
                }}
              >
                {filteredDesigns.length}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: colors.text.secondary, fontWeight: typography.fontWeight.medium }}
              >
                Total Designs
              </Typography>
            </Box>
          </Box>

          {/* Designs Table */}
          <DesignsTable designs={filteredDesigns} />
        </>
      )}

      {/* Create Panel */}
      {activePanel === 'create' && (
        isExpanded ? <ExpandedCreatePanel /> : <CreatePanel />
      )}
    </Box>
  );
};

export default LaboratoryNotebookV2;

