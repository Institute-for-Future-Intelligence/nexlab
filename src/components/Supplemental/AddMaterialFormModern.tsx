// src/components/Supplemental/AddMaterialFormModern.tsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  Typography,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Fade,
  Container,
  Divider,
  Chip,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';
import { v4 as uuidv4 } from 'uuid';
import { convertMaterialWithImageUpload, useMaterialImportStore } from '../../stores/materialImportStore';
import { useSearchParams } from 'react-router-dom';
import { Material, Section } from '../../types/Material';
import { designSystemTheme, borderRadius } from '../../config/designSystem';

// Lazy load components
import SideBarModern from './SideBarModern';
import ErrorBoundary from '../common/ErrorBoundary';
const MaterialImportWrapper = lazy(() => import('./MaterialImport/MaterialImportWrapper'));

// Icons
import {
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Edit as ManualIcon,
  AutoAwesome as AIIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// Import other components
import BackToAllMaterialsButton from './BackToAllMaterialsButton';
import ImageManager from './ImageManager';
import LinkManager from './LinkManager';
import TextEditor from './TextEditor';
import { useAdjacentSectionPreloader } from '../../hooks/useImagePreloader';
import SimpleTextEditor from './SimpleTextEditor';
import CourseDropdown from './CourseDropdown';
import DateTimePickerComponent from './DateTimePickerComponent';

interface AddMaterialFormModernProps {
  materialData?: Material;
  onSubmit?: (data: Material) => void;
}

const AddMaterialFormModern: React.FC<AddMaterialFormModernProps> = ({ materialData }) => {
  const navigate = useNavigate();
  const { userDetails } = useUser();
  const db = getFirestore();
  
  // Material import store
  const { uploadedFile, uploadOriginalFile, originalFileUrl, originalFileUploadProgress } = useMaterialImportStore();

  const [searchParams] = useSearchParams();
  const urlCourse = searchParams.get('course');
  const mode = searchParams.get('mode') || 'manual';

  // Form state
  const [course, setCourse] = useState<string>(materialData?.course || urlCourse || '');
  const [materialId, setMaterialId] = useState<string | null>(materialData?.id || null);
  const [title, setTitle] = useState<string>(materialData?.title || '');
  const [header, setHeader] = useState(materialData?.header || { title: 'Header', content: '' });
  const [footer, setFooter] = useState(materialData?.footer || { title: 'Footer', content: '' });
  const [sections, setSections] = useState<Section[]>(materialData?.sections || [
    { id: uuidv4(), title: 'Section 1', content: '', subsections: [], images: [], links: [] }
  ]);

  const [selectedSection, setSelectedSection] = useState<{ 
    sectionIndex?: number; 
    subsectionIndex?: number; 
    subSubsectionIndex?: number; 
    type?: 'header' | 'footer' 
  }>({ sectionIndex: 0 });

  // UI state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success' | 'info' | 'warning'>('success');
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [scheduledTimestamp, setScheduledTimestamp] = useState<Date | null>(materialData?.scheduledTimestamp?.toDate() || null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  
  // AI Import functionality
  const [importMode, setImportMode] = useState<'manual' | 'ai'>(mode as 'manual' | 'ai');
  const [isAIImported, setIsAIImported] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState<{ completed: number; total: number } | null>(null);
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isRetryingUpload, setIsRetryingUpload] = useState(false);

  // Preload images
  useAdjacentSectionPreloader(
    sections,
    selectedSection.sectionIndex || 0,
    sections.length > 1
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handleNavigate('prev');
      } else if (event.key === 'ArrowRight') {
        handleNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSection, sections]);

  const handleSubmit = async (e: React.FormEvent, shouldPublish: boolean = false, scheduleTimestamp?: Date | null) => {
    e.preventDefault();
    
    try {
      // Check if images need uploading for AI imported materials
      const hasUnuploadedImages = sections.some(section => 
        section.images?.some(img => img.url.startsWith('blob:')) ||
        section.subsections?.some(sub => 
          sub.images?.some(img => img.url.startsWith('blob:'))
        )
      );
      
      if (isAIImported && hasUnuploadedImages) {
        console.log('🚀 Starting AI material creation with image upload...');
        
        // Create material first to get ID for image uploads
        const docRef = await addDoc(collection(db, 'materials'), {
          course,
          title,
          header,
          footer,
          sections: [],
          author: userDetails?.uid || '',
          timestamp: serverTimestamp(),
          published: false,
          scheduledTimestamp: scheduleTimestamp ? Timestamp.fromDate(scheduleTimestamp) : null,
        });

        console.log('📄 Material created with ID:', docRef.id);
        setMaterialId(docRef.id);

        // Upload images and update material
        console.log('🖼️ Starting image upload process...');
        const updatedSections = await convertMaterialWithImageUpload(
          course,
          userDetails?.uid || '',
          docRef.id,
          (completed, total) => {
            console.log(`📤 Image upload progress: ${completed}/${total}`);
            setImageUploadProgress({ completed, total });
          }
        );

        console.log('✅ Image upload complete, updating material...');
        await updateDoc(docRef, {
          sections: updatedSections,
          published: shouldPublish,
          scheduledTimestamp: scheduleTimestamp ? Timestamp.fromDate(scheduleTimestamp) : null,
        });

        setImageUploadProgress(null);
        setIsAIImported(false); // Reset AI import flag to prevent duplicate processing
        
        // Reset the material import store to clear any cached data
        const { resetImport } = useMaterialImportStore.getState();
        resetImport();
        
        const message = shouldPublish 
          ? 'Material published successfully!' 
          : scheduleTimestamp 
            ? 'Material scheduled successfully!' 
            : 'Material saved successfully!';
        setSnackbarMessage(message);
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        
        if (shouldPublish || scheduleTimestamp) {
          navigate(`/supplemental-materials?course=${course}`);
        }
      } else {
        // Regular save/update
        const materialData = {
          course,
          title,
          header,
          footer,
          sections,
          author: userDetails?.uid || '',
          timestamp: serverTimestamp(),
          published: shouldPublish,
          scheduledTimestamp: scheduleTimestamp ? Timestamp.fromDate(scheduleTimestamp) : null,
          ...(originalFileUrl && { originalFile: { url: originalFileUrl } }),
        };

        if (materialId) {
          // Update existing material
          await updateDoc(doc(db, 'materials', materialId), materialData);
          const message = shouldPublish 
            ? 'Material updated and published!' 
            : scheduleTimestamp 
              ? 'Material updated and scheduled!' 
              : 'Material updated successfully!';
          setSnackbarMessage(message);
        } else {
          // Create new material
          const docRef = await addDoc(collection(db, 'materials'), materialData);
          setMaterialId(docRef.id);
          const message = shouldPublish 
            ? 'Material created and published!' 
            : scheduleTimestamp 
              ? 'Material created and scheduled!' 
              : 'Material created successfully!';
          setSnackbarMessage(message);
        }

        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        
        if (shouldPublish || scheduleTimestamp) {
          navigate(`/supplemental-materials?course=${course}`);
        }
      }
    } catch (error) {
      console.error('Error saving material:', error);
      setSnackbarMessage('Error saving material. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    // Navigation logic (simplified for brevity)
    // This would contain the same logic as the original component
  };

  const handleSelectSection = (
    sectionIndex: number | 'header' | 'footer', 
    subsectionIndex?: number, 
    subSubsectionIndex?: number
  ) => {
    setSelectedSection({ 
      sectionIndex: typeof sectionIndex === 'number' ? sectionIndex : undefined, 
      subsectionIndex, 
      subSubsectionIndex, 
      type: typeof sectionIndex === 'string' ? sectionIndex : undefined 
    });
  };

  // Get current content based on selected section
  const getCurrentContent = () => {
    if (selectedSection.type === 'header') return header.content;
    if (selectedSection.type === 'footer') return footer.content;
    
    if (selectedSection.sectionIndex !== undefined) {
      const section = sections[selectedSection.sectionIndex];
      if (selectedSection.subSubsectionIndex !== undefined) {
        return section?.subsections[selectedSection.subsectionIndex!]?.subSubsections[selectedSection.subSubsectionIndex]?.content || '';
      } else if (selectedSection.subsectionIndex !== undefined) {
        return section?.subsections[selectedSection.subsectionIndex]?.content || '';
      } else {
        return section?.content || '';
      }
    }
    return '';
  };

  const getCurrentTitle = () => {
    if (selectedSection.type === 'header') return header.title;
    if (selectedSection.type === 'footer') return footer.title;
    
    if (selectedSection.sectionIndex !== undefined) {
      const section = sections[selectedSection.sectionIndex];
      if (selectedSection.subSubsectionIndex !== undefined) {
        return section?.subsections[selectedSection.subsectionIndex!]?.subSubsections[selectedSection.subSubsectionIndex]?.title || '';
      } else if (selectedSection.subsectionIndex !== undefined) {
        return section?.subsections[selectedSection.subsectionIndex]?.title || '';
      } else {
        return section?.title || '';
      }
    }
    return '';
  };

  const updateCurrentContent = (content: string) => {
    if (selectedSection.type === 'header') {
      setHeader(prev => ({ ...prev, content }));
    } else if (selectedSection.type === 'footer') {
      setFooter(prev => ({ ...prev, content }));
    } else if (selectedSection.sectionIndex !== undefined) {
      setSections(prev => {
        const newSections = [...prev];
        const section = newSections[selectedSection.sectionIndex!];
        
        if (selectedSection.subSubsectionIndex !== undefined) {
          section.subsections[selectedSection.subsectionIndex!].subSubsections[selectedSection.subSubsectionIndex].content = content;
        } else if (selectedSection.subsectionIndex !== undefined) {
          section.subsections[selectedSection.subsectionIndex].content = content;
        } else {
          section.content = content;
        }
        
        return newSections;
      });
    }
  };

  const handleSchedulePublish = (e: React.FormEvent) => {
    if (showDatePicker && scheduledTimestamp) {
      handleSubmit(e, false, scheduledTimestamp); // shouldPublish: false for scheduling
    } else {
      setShowDatePicker(true);
    }
  };

  const updateCurrentTitle = (title: string) => {
    if (selectedSection.type === 'header') {
      setHeader(prev => ({ ...prev, title }));
    } else if (selectedSection.type === 'footer') {
      setFooter(prev => ({ ...prev, title }));
    } else if (selectedSection.sectionIndex !== undefined) {
      setSections(prev => {
        const newSections = [...prev];
        const section = newSections[selectedSection.sectionIndex!];
        
        if (selectedSection.subSubsectionIndex !== undefined) {
          section.subsections[selectedSection.subsectionIndex!].subSubsections[selectedSection.subSubsectionIndex].title = title;
        } else if (selectedSection.subsectionIndex !== undefined) {
          section.subsections[selectedSection.subsectionIndex].title = title;
        } else {
          section.title = title;
        }
        
        return newSections;
      });
    }
  };

  // Helper functions for images and links
  const getCurrentImages = () => {
    if (selectedSection.type === 'header' || selectedSection.type === 'footer') {
      return []; // Headers and footers don't have images
    }
    
    if (selectedSection.sectionIndex !== undefined) {
      const section = sections[selectedSection.sectionIndex];
      if (selectedSection.subSubsectionIndex !== undefined) {
        return section?.subsections[selectedSection.subsectionIndex!]?.subSubsections[selectedSection.subSubsectionIndex]?.images || [];
      } else if (selectedSection.subsectionIndex !== undefined) {
        return section?.subsections[selectedSection.subsectionIndex]?.images || [];
      } else {
        return section?.images || [];
      }
    }
    return [];
  };

  const getCurrentLinks = () => {
    if (selectedSection.type === 'header' || selectedSection.type === 'footer') {
      return []; // Headers and footers don't have links
    }
    
    if (selectedSection.sectionIndex !== undefined) {
      const section = sections[selectedSection.sectionIndex];
      if (selectedSection.subSubsectionIndex !== undefined) {
        return section?.subsections[selectedSection.subsectionIndex!]?.subSubsections[selectedSection.subSubsectionIndex]?.links || [];
      } else if (selectedSection.subsectionIndex !== undefined) {
        return section?.subsections[selectedSection.subsectionIndex]?.links || [];
      } else {
        return section?.links || [];
      }
    }
    return [];
  };

  const updateCurrentImages = (images: any[]) => {
    if (selectedSection.type === 'header' || selectedSection.type === 'footer') {
      return; // Headers and footers don't have images
    }
    
    if (selectedSection.sectionIndex !== undefined) {
      setSections(prev => {
        const newSections = [...prev];
        const section = newSections[selectedSection.sectionIndex!];
        
        if (selectedSection.subSubsectionIndex !== undefined) {
          section.subsections[selectedSection.subsectionIndex!].subSubsections[selectedSection.subSubsectionIndex].images = images;
        } else if (selectedSection.subsectionIndex !== undefined) {
          section.subsections[selectedSection.subsectionIndex].images = images;
        } else {
          section.images = images;
        }
        
        return newSections;
      });
    }
  };

  const updateCurrentLinks = (links: any[]) => {
    if (selectedSection.type === 'header' || selectedSection.type === 'footer') {
      return; // Headers and footers don't have links
    }
    
    if (selectedSection.sectionIndex !== undefined) {
      setSections(prev => {
        const newSections = [...prev];
        const section = newSections[selectedSection.sectionIndex!];
        
        if (selectedSection.subSubsectionIndex !== undefined) {
          section.subsections[selectedSection.subsectionIndex!].subSubsections[selectedSection.subSubsectionIndex].links = links;
        } else if (selectedSection.subsectionIndex !== undefined) {
          section.subsections[selectedSection.subsectionIndex].links = links;
        } else {
          section.links = links;
        }
        
        return newSections;
      });
    }
  };

  const getCurrentSectionId = () => {
    if (selectedSection.type === 'header') return 'header';
    if (selectedSection.type === 'footer') return 'footer';
    
    if (selectedSection.sectionIndex !== undefined) {
      if (selectedSection.subSubsectionIndex !== undefined) {
        return `section-${selectedSection.sectionIndex}-subsection-${selectedSection.subsectionIndex}-subsubsection-${selectedSection.subSubsectionIndex}`;
      } else if (selectedSection.subsectionIndex !== undefined) {
        return `section-${selectedSection.sectionIndex}-subsection-${selectedSection.subsectionIndex}`;
      } else {
        return `section-${selectedSection.sectionIndex}`;
      }
    }
    return 'unknown';
  };

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 2,
          backgroundColor: designSystemTheme.palette.background.paper,
          borderRadius: 0,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 3, gap: 2 }}>
          <BackToAllMaterialsButton courseId={materialData?.course || course} />
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
            {/* Mode Toggle */}
            <ToggleButtonGroup
              value={importMode}
              exclusive
              onChange={(_, newMode) => newMode && setImportMode(newMode)}
              size="small"
              sx={{
                backgroundColor: designSystemTheme.palette.background.paper,
                borderRadius: borderRadius.xl,
                width: { xs: '100%', sm: 'auto' },
                '& .MuiToggleButton-root': {
                  borderRadius: borderRadius.xl,
                  textTransform: 'none',
                  fontWeight: 600,
                  flex: { xs: 1, sm: 'none' },
                  '&.Mui-selected': {
                    backgroundColor: designSystemTheme.palette.primary.main,
                    color: designSystemTheme.palette.primary.contrastText,
                  },
                },
              }}
            >
              <ToggleButton value="manual">
                <ManualIcon sx={{ mr: 1 }} />
                Manual
              </ToggleButton>
              <ToggleButton value="ai">
                <AIIcon sx={{ mr: 1 }} />
                AI Import
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Course Selection */}
            <Box sx={{ width: { xs: '100%', sm: '200px', md: '250px' } }}>
              <CourseDropdown
                value={course}
                onChange={setCourse}
                disabled={!!materialId}
              />
            </Box>
          </Box>
        </Box>

        {/* Material Title */}
        <TextField
          fullWidth
          label="Material Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: borderRadius.xl,
            },
          }}
        />
      </Paper>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <ErrorBoundary>
          <SideBarModern
            sections={sections}
            selected={selectedSection}
            onAddSection={() => {
              const newSection: Section = {
                id: uuidv4(),
                title: `Section ${sections.length + 1}`,
                content: '',
                subsections: [],
                images: [],
                links: [],
              };
              setSections(prev => [...prev, newSection]);
              setSelectedSection({ sectionIndex: sections.length });
            }}
            onAddSubsection={(sectionIndex) => {
              setSections(prev => {
                const newSections = [...prev];
                const currentSubsections = newSections[sectionIndex].subsections;
                const newSubsection = {
                  id: uuidv4(),
                  title: `Subsection ${currentSubsections.length + 1}`,
                  content: '',
                  subSubsections: [],
                  images: [],
                  links: [],
                };
                newSections[sectionIndex].subsections = [...currentSubsections, newSubsection];
                return newSections;
              });
            }}
            onAddSubSubsection={(sectionIndex, subsectionIndex) => {
              setSections(prev => {
                const newSections = [...prev];
                const currentSubSubsections = newSections[sectionIndex].subsections[subsectionIndex].subSubsections;
                const newSubSubsection = {
                  id: uuidv4(),
                  title: `Sub-subsection ${currentSubSubsections.length + 1}`,
                  content: '',
                  images: [],
                  links: [],
                };
                newSections[sectionIndex].subsections[subsectionIndex].subSubsections = [...currentSubSubsections, newSubSubsection];
                return newSections;
              });
            }}
            onSelectSection={handleSelectSection}
            onUpdateSectionTitle={(sectionIndex, newTitle) => {
              setSections(prev => {
                const newSections = [...prev];
                newSections[sectionIndex].title = newTitle;
                return newSections;
              });
            }}
            onUpdateSubsectionTitle={(sectionIndex, subsectionIndex, newTitle) => {
              setSections(prev => {
                const newSections = [...prev];
                newSections[sectionIndex].subsections[subsectionIndex].title = newTitle;
                return newSections;
              });
            }}
            onUpdateSubSubsectionTitle={(sectionIndex, subsectionIndex, subSubsectionIndex, newTitle) => {
              setSections(prev => {
                const newSections = [...prev];
                newSections[sectionIndex].subsections[subsectionIndex].subSubsections[subSubsectionIndex].title = newTitle;
                return newSections;
              });
            }}
            onDeleteSection={(sectionIndex) => {
              setSections(prev => prev.filter((_, index) => index !== sectionIndex));
              setSelectedSection({ sectionIndex: 0 });
            }}
            onDeleteSubsection={(sectionIndex, subsectionIndex) => {
              setSections(prev => {
                const newSections = [...prev];
                newSections[sectionIndex].subsections = newSections[sectionIndex].subsections.filter((_, index) => index !== subsectionIndex);
                return newSections;
              });
            }}
            onDeleteSubSubsection={(sectionIndex, subsectionIndex, subSubsectionIndex) => {
              setSections(prev => {
                const newSections = [...prev];
                newSections[sectionIndex].subsections[subsectionIndex].subSubsections = 
                  newSections[sectionIndex].subsections[subsectionIndex].subSubsections.filter((_, index) => index !== subSubsectionIndex);
                return newSections;
              });
            }}
            isViewMode={false}
          />
        </ErrorBoundary>

        {/* Content Area */}
        <Box sx={{ flexGrow: 1, p: 4, overflow: 'auto' }}>
          {importMode === 'ai' ? (
            <Suspense fallback={<CircularProgress />}>
              <MaterialImportWrapper
                courseId={course}
                authorId={userDetails?.uid || ''}
                imageUploadProgress={imageUploadProgress}
                isSaving={isSavingMaterial}
                onMaterialReady={async (material) => {
                  console.log('🎯 AI Material ready callback triggered:', material);
                  
                  try {
                    setIsSavingMaterial(true);
                    setImageUploadProgress({ completed: 0, total: 1 }); // Initialize progress
                    // Generate a temporary material ID for image upload (will be replaced with Firestore ID)
                    const tempMaterialId = uuidv4();
                    
                    // Convert AI data to Material format with image upload
                    const materialWithImages = await convertMaterialWithImageUpload(
                      course,
                      userDetails?.uid || '',
                      tempMaterialId,
                      (completed, total) => {
                        console.log(`📸 Image upload progress: ${completed}/${total}`);
                        setImageUploadProgress({ completed, total });
                      }
                    );
                    
                    console.log('🎯 Material with images converted:', materialWithImages);
                    
                    // Ensure sections is an array
                    const sanitizedMaterial = {
                      ...materialWithImages,
                      sections: Array.isArray(materialWithImages.sections) 
                        ? materialWithImages.sections 
                        : []
                    };
                    
                    // Save the material to Firestore (without the id field - let Firestore generate it)
                    const materialRef = await addDoc(collection(db, 'materials'), {
                      ...sanitizedMaterial,
                      timestamp: serverTimestamp(),
                      scheduledTimestamp: null
                    });
                    
                    console.log('🎯 Material saved to Firestore with ID:', materialRef.id);
                    
                    // Update the material to include the Firestore document ID
                    await updateDoc(materialRef, {
                      id: materialRef.id
                    });
                    
                    console.log('🎯 Material updated with correct ID:', materialRef.id);
                    
                    // Show success message
                    setSnackbarMessage('AI-imported material saved successfully!');
                    setSnackbarSeverity('success');
                    setOpenSnackbar(true);
                    
                    // Reset AI import state and close import window
                    setIsAIImported(false);
                    useMaterialImportStore.getState().resetImport();
                    setImportMode('manual'); // Close AI import window
                    
                    // Clean up progress state
                    setIsSavingMaterial(false);
                    setImageUploadProgress(null);
                    
                    // Navigate to edit mode of the saved material
                    navigate(`/edit-material/${materialRef.id}`);
                    
                  } catch (error) {
                    console.error('❌ Failed to save AI material:', error);
                    setSnackbarMessage('Failed to save AI-imported material. Please try again.');
                    setSnackbarSeverity('error');
                    setOpenSnackbar(true);
                    
                    // Clean up progress state
                    setIsSavingMaterial(false);
                    setImageUploadProgress(null);
                  }
                }}
                onCancel={() => setImportMode('manual')}
                onError={(error, errorInfo) => {
                  console.error('Material Import Error:', error, errorInfo);
                  setSnackbarMessage(`Import error: ${error.message}`);
                  setSnackbarSeverity('error');
                  setOpenSnackbar(true);
                }}
              />
            </Suspense>
          ) : (
            <Box>
              {/* Section Title */}
              <TextField
                fullWidth
                label="Section Title"
                value={getCurrentTitle()}
                onChange={(e) => updateCurrentTitle(e.target.value)}
                variant="outlined"
                sx={{ mb: 3 }}
              />

              {/* Content Editor */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: designSystemTheme.palette.background.paper,
                  borderRadius: borderRadius.xl,
                  border: `1px solid ${designSystemTheme.palette.divider}`,
                }}
              >
                <TextEditor
                  content={getCurrentContent()}
                  onChange={updateCurrentContent}
                />
              </Paper>

              {/* Images and Links Section - Show for all section types except header/footer */}
              {selectedSection.sectionIndex !== undefined && (
                <Box sx={{ mb: 3 }}>
                  {/* Images */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 2,
                      backgroundColor: designSystemTheme.palette.background.paper,
                      borderRadius: borderRadius.xl,
                      border: `1px solid ${designSystemTheme.palette.divider}`,
                    }}
                  >
                    <ImageManager
                      sectionId={getCurrentSectionId()}
                      images={getCurrentImages()}
                      onImagesChange={updateCurrentImages}
                    />
                  </Paper>

                  {/* Links */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      backgroundColor: designSystemTheme.palette.background.paper,
                      borderRadius: borderRadius.xl,
                      border: `1px solid ${designSystemTheme.palette.divider}`,
                    }}
                  >
                    <LinkManager
                      links={getCurrentLinks()}
                      onLinksChange={updateCurrentLinks}
                    />
                  </Paper>
                </Box>
              )}

              {/* Schedule Publish Date Picker */}
              {showDatePicker && (
                <Box sx={{ mb: 3 }}>
                  <DateTimePickerComponent
                    value={scheduledTimestamp}
                    onChange={setScheduledTimestamp}
                  />
                </Box>
              )}

              {/* Image Upload Progress */}
              {imageUploadProgress && (
                <Box sx={{ mb: 3 }}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      backgroundColor: designSystemTheme.palette.background.paper,
                      borderRadius: borderRadius.xl,
                      border: `1px solid ${designSystemTheme.palette.divider}`,
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 1, color: designSystemTheme.palette.text.secondary }}>
                      Uploading images... ({imageUploadProgress.completed} of {imageUploadProgress.total})
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(imageUploadProgress.completed / imageUploadProgress.total) * 100}
                      sx={{
                        borderRadius: borderRadius.xl,
                        height: 8,
                        backgroundColor: designSystemTheme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          borderRadius: borderRadius.xl,
                          backgroundColor: designSystemTheme.palette.primary.main,
                        },
                      }}
                    />
                  </Paper>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={(e) => handleSubmit(e, false)}
                  startIcon={<SaveIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Save Draft
                </Button>
                
                <Button
                  variant="contained"
                  onClick={(e) => handleSubmit(e, true)}
                  startIcon={<PublishIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Publish
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleSchedulePublish}
                  startIcon={<ScheduleIcon />}
                  sx={{ 
                    textTransform: 'none',
                    borderColor: designSystemTheme.palette.primary.main,
                    color: designSystemTheme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: designSystemTheme.palette.primary.main,
                      color: designSystemTheme.palette.primary.contrastText,
                    }
                  }}
                >
                  {showDatePicker ? 'Schedule Publish' : 'Schedule Publish'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddMaterialFormModern;
