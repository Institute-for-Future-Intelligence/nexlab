import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Grid,
} from "@mui/material";
import { getFirestore, collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { Material } from '../../types/Material';
import { useUser } from '../../hooks/useUser';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import UnpublishButton from './UnpublishButton';

interface MaterialsTabsProps {
  courseId: string;
  isCourseAdmin: boolean;
  onDeleteClick: (id: string) => void;
  onUnpublishClick: (id: string) => void;
}

const MaterialsTabs: React.FC<MaterialsTabsProps> = ({ 
  courseId, 
  isCourseAdmin, 
  onDeleteClick, 
  onUnpublishClick 
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userDetails } = useUser();
  const navigate = useNavigate();
  const db = getFirestore();

  const categories = ["published", "scheduled", "saved"]; // Published first as main category

  // Fetch materials from Firestore using the existing pattern
  useEffect(() => {
    if (!courseId) {
      setMaterials([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Use the same query pattern as MaterialGrid
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

  // Filter materials based on their actual status using the existing boolean system
  const getFilteredMaterials = () => {
    switch (tabIndex) {
      case 0: // Published (main category first)
        return materials.filter((material) => material.published);
      case 1: // Scheduled (has scheduledTimestamp but not published)
        return materials.filter((material) => material.scheduledTimestamp && !material.published);
      case 2: // Saved (unpublished and not scheduled)
        return materials.filter((material) => !material.published && !material.scheduledTimestamp);
      default:
        return [];
    }
  };

  const filteredMaterials = getFilteredMaterials();

  // Helper function to get material status for display
  const getMaterialStatus = (material: Material): string => {
    if (material.published) return 'published';
    if (material.scheduledTimestamp) return 'scheduled';
    return 'saved';
  };

  // Helper function to get status color
  const getStatusColor = (material: Material): string => {
    if (material.published) return '#2e7d32';
    if (material.scheduledTimestamp) return '#0288d1';
    return '#9e9e9e';
  };

  // Helper function to get background color
  const getBackgroundColor = (material: Material): string => {
    if (material.published) return '#C8E6C9';
    if (material.scheduledTimestamp) return '#BBDEFB';
    return '#F5F5F5';
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mt: 3,
        backgroundColor: '#F0F4FF',
        borderRadius: '15px',
        padding: 3
      }}>
        <Typography 
          variant="body1" 
          sx={{ 
            fontFamily: 'Gabarito, sans-serif',
            fontSize: '1.1rem',
            color: '#0B53C0'
          }}
        >
          Loading materials...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        mt: 3,
        backgroundColor: '#FFE5E5',
        borderRadius: '15px',
        padding: 3
      }}>
        <Typography 
          variant="body1" 
          color="error" 
          align="center"
          sx={{ 
            fontFamily: 'Gabarito, sans-serif',
            fontSize: '1.1rem',
            color: '#FF6B6B'
          }}
        >
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tabs with styling consistent with existing app */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{ 
          mb: 3,
          backgroundColor: '#F0F4FF',
          borderRadius: '15px',
          padding: '8px',
          '& .MuiTabs-flexContainer': {
            gap: '8px',
          },
          '& .MuiTab-root': {
            fontFamily: 'Staatliches, sans-serif',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            textTransform: 'none',
            borderRadius: '10px',
            minHeight: '50px',
            transition: 'all 0.3s ease-in-out',
            '&.Mui-selected': {
              backgroundColor: '#0B53C0',
              color: '#FFFFFF',
              boxShadow: '0px 2px 8px rgba(11, 83, 192, 0.3)',
            },
            '&:not(.Mui-selected)': {
              backgroundColor: '#CDDAFF',
              color: '#0B53C0',
              '&:hover': {
                backgroundColor: '#E0ECFF',
                transform: 'scale(1.02)',
              }
            }
          },
          '& .MuiTabs-indicator': {
            display: 'none', // Hide default indicator since we're using custom styling
          }
        }}
        variant="fullWidth"
      >
        <Tab 
          label={`Published ${materials.filter(m => m.published).length > 0 ? `(${materials.filter(m => m.published).length})` : ''}`}
        />
        <Tab 
          label={`Scheduled ${materials.filter(m => m.scheduledTimestamp && !m.published).length > 0 ? `(${materials.filter(m => m.scheduledTimestamp && !m.published).length})` : ''}`}
        />
        <Tab 
          label={`Saved ${materials.filter(m => !m.published && !m.scheduledTimestamp).length > 0 ? `(${materials.filter(m => !m.published && !m.scheduledTimestamp).length})` : ''}`}
        />
      </Tabs>

      {/* Content using Grid layout like existing MaterialGrid */}
      {filteredMaterials.length === 0 ? (
        <Typography 
          variant="body1" 
          align="center" 
          sx={{ 
            width: '100%', 
            mb: 4,
            fontFamily: 'Gabarito, sans-serif',
            fontSize: '1.1rem',
            color: '#0B53C0'
          }}
        >
          No materials in this category.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredMaterials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material.id}>
              <Box 
                sx={{ 
                  backgroundColor: '#F5F5F5',
                  border: 'none',
                  borderRadius: '15px', 
                  padding: 2, 
                  position: 'relative', 
                  minHeight: '140px',
                  transition: 'all 0.3s ease-in-out',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#E0ECFF',
                    transform: 'scale(1.02)',
                    boxShadow: '0px 4px 12px rgba(11, 83, 192, 0.15)',
                  }
                }}
              >
                {/* View button prominent like in original */}
                <IconButton 
                  onClick={() => navigate(`/view-material/${material.id}?course=${courseId}`)} 
                  aria-label="view"
                  sx={{ 
                    mb: 1,
                    color: '#0B53C0',
                    '&:hover': {
                      backgroundColor: '#CDDAFF',
                    }
                  }}
                >
                  <VisibilityIcon />
                </IconButton>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 1,
                    fontFamily: 'Staatliches, sans-serif',
                    fontSize: '1.3rem',
                    color: '#0B53C0',
                    fontWeight: 'bold'
                  }}
                >
                  {material.title || 'Untitled'}
                </Typography>

                {/* Status chip */}
                <Chip
                  label={getMaterialStatus(material)}
                  size="small"
                  sx={{
                    backgroundColor: material.published ? '#2ECC71' : material.scheduledTimestamp ? '#4A90E2' : '#F6C90E',
                    color: material.published ? '#FFFFFF' : material.scheduledTimestamp ? '#FFFFFF' : '#000000',
                    fontFamily: 'Gabarito, sans-serif',
                    fontWeight: 'bold',
                    textTransform: 'capitalize',
                    fontSize: '0.8rem',
                    borderRadius: '8px'
                  }}
                />

                {/* Action buttons in top right like original */}
                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                  {isCourseAdmin && (
                    <>
                      <IconButton 
                        onClick={() => navigate(`/edit-material/${material.id}?course=${courseId}`)} 
                        aria-label="edit"
                        size="small"
                        sx={{
                          color: '#0B53C0',
                          '&:hover': {
                            backgroundColor: '#CDDAFF',
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        onClick={() => onDeleteClick(material.id)} 
                        aria-label="delete"
                        size="small"
                        sx={{
                          color: '#FF6B6B',
                          '&:hover': {
                            backgroundColor: '#FFE5E5',
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      {material.published && (
                        <UnpublishButton 
                          materialId={material.id} 
                          onClick={onUnpublishClick}
                        />
                      )}
                    </>
                  )}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MaterialsTabs;
