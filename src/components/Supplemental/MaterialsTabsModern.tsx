// src/components/Supplemental/MaterialsTabsModern.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Container,
  Fade,
  Skeleton,
  Chip,
} from '@mui/material';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Material } from '../../types/Material';
import { useUser } from '../../hooks/useUser';
import { designSystemTheme, borderRadius } from '../../config/designSystem';
import MaterialCard from '../common/MaterialCard';

interface MaterialsTabsModernProps {
  courseId: string;
  isCourseAdmin: boolean;
  onDeleteClick: (id: string) => void;
  onUnpublishClick: (id: string) => void;
}

const MaterialsTabsModern: React.FC<MaterialsTabsModernProps> = ({
  courseId,
  isCourseAdmin,
  onDeleteClick,
  onUnpublishClick,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userDetails } = useUser();
  const navigate = useNavigate();
  const db = getFirestore();

  const categories = [
    { key: 'published', label: 'Published', icon: '📚' },
    { key: 'scheduled', label: 'Scheduled', icon: '⏰' },
    { key: 'saved', label: 'Drafts', icon: '💾' },
  ];

  // Fetch materials from Firestore
  useEffect(() => {
    if (!courseId) {
      setMaterials([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const q = userDetails?.isAdmin
      ? query(collection(db, 'materials'), where('course', '==', courseId), orderBy('timestamp', 'desc'))
      : query(collection(db, 'materials'), where('course', '==', courseId), where('published', '==', true), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const materialsData = querySnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Material[];
        setMaterials(materialsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching materials:', err);
        setError('Failed to fetch materials');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [courseId, db, userDetails]);

  const handleTabChange = (_: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
  };

  const handleViewMaterial = (materialId: string) => {
    navigate(`/view-material/${materialId}`);
  };

  const handleEditMaterial = (materialId: string) => {
    navigate(`/edit-material/${materialId}`);
  };

  // Filter materials based on their status
  const getFilteredMaterials = (category: string) => {
    return materials.filter((material) => {
      switch (category) {
        case 'published':
          return material.published === true;
        case 'scheduled':
          return material.scheduledTimestamp && !material.published;
        case 'saved':
          return !material.published && !material.scheduledTimestamp;
        default:
          return false;
      }
    });
  };

  const getCategoryCount = (category: string) => {
    return getFilteredMaterials(category).length;
  };

  const filteredMaterials = getFilteredMaterials(categories[tabIndex].key);

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
        </Box>
        
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          p: 4,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: designSystemTheme.palette.error.main,
            mb: 2,
            textAlign: 'center',
          }}
        >
          Error Loading Materials
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: designSystemTheme.palette.text.secondary,
            textAlign: 'center',
          }}
        >
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            backgroundColor: designSystemTheme.palette.background.paper,
            borderRadius: borderRadius.xl,
            boxShadow: designSystemTheme.shadows[1],
            '& .MuiTabs-indicator': {
              backgroundColor: designSystemTheme.palette.primary.main,
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTabs-flexContainer': {
              gap: 1,
            },
          }}
        >
          {categories.map((category, index) => {
            const count = getCategoryCount(category.key);
            return (
              <Tab
                key={category.key}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="button"
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                      }}
                    >
                      {category.label}
                    </Typography>
                    <Chip
                      label={count}
                      size="small"
                      sx={{
                        backgroundColor: designSystemTheme.palette.primary.light,
                        color: designSystemTheme.palette.primary.main,
                        fontWeight: 600,
                        minWidth: 24,
                        height: 20,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                }
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 48,
                  color: designSystemTheme.palette.text.primary,
                  '&.Mui-selected': {
                    color: designSystemTheme.palette.primary.main,
                    backgroundColor: designSystemTheme.palette.primary.light,
                    borderRadius: borderRadius.xl,
                  },
                  '&:hover': {
                    backgroundColor: designSystemTheme.palette.action.hover,
                    borderRadius: borderRadius.xl,
                  },
                }}
              />
            );
          })}
        </Tabs>
      </Box>

      {filteredMaterials.length === 0 ? (
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 300,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: designSystemTheme.palette.text.secondary,
                mb: 2,
              }}
            >
              {tabIndex === 0 && 'No published materials yet.'}
              {tabIndex === 1 && 'No scheduled materials.'}
              {tabIndex === 2 && 'No draft materials saved.'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: designSystemTheme.palette.text.disabled,
              }}
            >
              {tabIndex === 0 && 'Published materials will appear here once you publish them.'}
              {tabIndex === 1 && 'Scheduled materials will appear here once you schedule them.'}
              {tabIndex === 2 && 'Draft materials will appear here as you work on them.'}
            </Typography>
          </Box>
        </Container>
      ) : (
        <Fade in={true} timeout={300}>
          <Grid container spacing={3}>
            {filteredMaterials.map((material) => (
              <Grid item xs={12} sm={6} md={4} key={material.id}>
                <MaterialCard
                  material={material}
                  isCourseAdmin={isCourseAdmin}
                  onView={handleViewMaterial}
                  onEdit={handleEditMaterial}
                  onDelete={onDeleteClick}
                  onUnpublish={onUnpublishClick}
                />
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}
    </Box>
  );
};

export default MaterialsTabsModern;