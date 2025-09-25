// src/components/Supplemental/ViewMaterialModern.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  LinearProgress,
  Fade,
  Container,
  Paper,
  Chip,
} from '@mui/material';
import {
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  GetApp as DownloadIcon,
  Description as FileIcon,
  Slideshow as SlideshowIcon,
} from '@mui/icons-material';
import { Material } from '../../types/Material';
import SideBarModern from './SideBarModern';
import BackToAllMaterialsButton from './BackToAllMaterialsButton';
import ErrorBoundary from '../common/ErrorBoundary';
import { useAdjacentSectionPreloader } from '../../hooks/useImagePreloader';
import { designSystemTheme, borderRadius } from '../../config/designSystem';
import ImageGallery from './ImageGallery';
import ViewLinksTable from './ViewLinksTable';
import { handleDownloadPDF } from '../../utils/generatePDF';
import { v4 as uuidv4 } from 'uuid';

const ViewMaterialModern: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const db = getFirestore();
  const [materialData, setMaterialData] = useState<Material | null>(null);
  const [selectedSection, setSelectedSection] = useState<{ 
    sectionIndex?: number; 
    subsectionIndex?: number; 
    subSubsectionIndex?: number; 
    type?: 'header' | 'footer' 
  }>({ sectionIndex: 0 });

  const [progress, setProgress] = useState<number | null>(null);
  const [contentKey, setContentKey] = useState(0);
  const [loading, setLoading] = useState(true);

  // Preload images from adjacent sections for smooth navigation
  useAdjacentSectionPreloader(
    materialData?.sections || [],
    selectedSection.sectionIndex || 0,
    !!materialData
  );

  // Trigger transition when section changes
  useEffect(() => {
    setContentKey(prev => prev + 1);
  }, [selectedSection]);

  // Handle original file download
  const handleDownloadOriginalFile = async () => {
    if (!materialData?.originalFile) return;

    try {
      console.log('🚀 Starting original file download:', materialData.originalFile.name);
      
      const link = document.createElement('a');
      link.href = materialData.originalFile.url;
      link.download = materialData.originalFile.name;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Original file download initiated');
    } catch (error) {
      console.error('❌ Original file download failed:', error);
    }
  };

  // Fetch material data
  useEffect(() => {
    if (id) {
      const fetchMaterial = async () => {
        try {
          setLoading(true);
          const docRef = doc(db, 'materials', id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const docData = { id: docSnap.id, ...docSnap.data() } as Material;
            
            // Debug: Log the material data structure
            console.log('Material data from Firestore:', docData);
            console.log('Sections type:', typeof docData.sections);
            console.log('Sections value:', docData.sections);
            
            // Ensure sections is an array
            if (!Array.isArray(docData.sections)) {
              console.warn('Sections is not an array, initializing as empty array. Original value:', docData.sections);
              docData.sections = [];
            }
            
            // Ensure all nested arrays are properly initialized
            docData.sections = docData.sections.map(section => {
              const processedSection = {
                id: section.id || uuidv4(),
                title: section.title || 'Untitled Section',
                content: section.content || '',
                images: Array.isArray(section.images) ? section.images.map(image => ({ 
                  ...image, 
                  title: image.title || '' 
                })) : [],
                links: Array.isArray(section.links) ? section.links : [],
                subsections: Array.isArray(section.subsections) ? section.subsections.map(subsection => ({
                  id: subsection.id || uuidv4(),
                  title: subsection.title || 'Untitled Subsection',
                  content: subsection.content || '',
                  images: Array.isArray(subsection.images) ? subsection.images.map(image => ({ 
                    ...image, 
                    title: image.title || '' 
                  })) : [],
                  links: Array.isArray(subsection.links) ? subsection.links : [],
                  subSubsections: Array.isArray(subsection.subSubsections) ? subsection.subSubsections.map(subSubsection => ({
                    id: subSubsection.id || uuidv4(),
                    title: subSubsection.title || 'Untitled Sub-subsection',
                    content: subSubsection.content || '',
                    images: Array.isArray(subSubsection.images) ? subSubsection.images.map(image => ({ 
                      ...image, 
                      title: image.title || '' 
                    })) : [],
                    links: Array.isArray(subSubsection.links) ? subSubsection.links : [],
                  })) : [],
                })) : [],
              };
              return processedSection;
            });
            
            console.log('Loaded material from database:', {
              title: docData.title,
              sectionsCount: docData.sections?.length || 0,
              sectionsWithImages: docData.sections?.filter(s => s.images?.length > 0).length || 0,
            });
            setMaterialData(docData);
          }
        } catch (error) {
          console.error('Error fetching material:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMaterial();
    }
  }, [id, db]);

  // Ensure material ID is always present in the URL as a query parameter
  useEffect(() => {
    if (id && searchParams.get('material') !== id) {
      console.log("🔹 Updating URL: Adding material ID to query parameters:", id);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('material', id);
        return newParams;
      }, { replace: true });
    }
  }, [id, searchParams, setSearchParams]);

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

  const handleNavigate = (direction: 'prev' | 'next') => {
    const { sectionIndex, subsectionIndex, subSubsectionIndex, type } = selectedSection;

    if (direction === 'prev') {
      if (subSubsectionIndex !== undefined && subSubsectionIndex > 0) {
        setSelectedSection({ sectionIndex, subsectionIndex, subSubsectionIndex: subSubsectionIndex - 1 });
      } else if (subSubsectionIndex !== undefined && subSubsectionIndex === 0) {
        setSelectedSection({ sectionIndex, subsectionIndex });
      } else if (subsectionIndex !== undefined && subsectionIndex > 0) {
        setSelectedSection({ sectionIndex, subsectionIndex: subsectionIndex - 1 });
      } else if (subsectionIndex !== undefined && subsectionIndex === 0) {
        setSelectedSection({ sectionIndex });
      } else if (sectionIndex! > 0) {
        const prevSection = materialData?.sections[sectionIndex! - 1];
        setSelectedSection({
          sectionIndex: sectionIndex! - 1,
          subsectionIndex: prevSection?.subsections?.length ? prevSection.subsections.length - 1 : undefined,
          subSubsectionIndex: prevSection?.subsections?.length ? prevSection.subsections[prevSection.subsections.length - 1]?.subSubsections?.length - 1 : undefined,
        });
      } else if (type === 'footer') {
        setSelectedSection({ sectionIndex: (materialData?.sections.length ?? 1) - 1, type: 'footer' });
      } else if (sectionIndex === undefined && type === 'header') {
        setSelectedSection({ sectionIndex: (materialData?.sections.length ?? 1) - 1 });
      }
    } else if (direction === 'next') {
      if (subSubsectionIndex === undefined && subsectionIndex !== undefined && materialData?.sections[sectionIndex ?? 0]?.subsections?.[subsectionIndex]?.subSubsections?.length) {
        setSelectedSection({ sectionIndex, subsectionIndex, subSubsectionIndex: 0 });
      } else if (subSubsectionIndex !== undefined && subSubsectionIndex < (materialData?.sections[sectionIndex ?? 0]?.subsections?.[subsectionIndex ?? 0]?.subSubsections?.length ?? 1) - 1) {
        setSelectedSection({ sectionIndex, subsectionIndex, subSubsectionIndex: subSubsectionIndex + 1 });
      } else if (subSubsectionIndex !== undefined && subSubsectionIndex === (materialData?.sections[sectionIndex ?? 0]?.subsections?.[subsectionIndex ?? 0]?.subSubsections?.length ?? 1) - 1 && (subsectionIndex ?? 0) < (materialData?.sections[sectionIndex ?? 0]?.subsections?.length ?? 1) - 1) {
        setSelectedSection({ sectionIndex, subsectionIndex: (subsectionIndex ?? 0) + 1 });
      } else if (subsectionIndex === undefined && materialData?.sections[sectionIndex ?? 0]?.subsections?.length) {
        setSelectedSection({ sectionIndex, subsectionIndex: 0 });
      } else if (subsectionIndex !== undefined && subsectionIndex < (materialData?.sections[sectionIndex ?? 0]?.subsections?.length ?? 1) - 1) {
        setSelectedSection({ sectionIndex, subsectionIndex: subsectionIndex + 1 });
      } else if (subsectionIndex !== undefined && subsectionIndex === (materialData?.sections[sectionIndex ?? 0]?.subsections?.length ?? 1) - 1 && (sectionIndex ?? 0) < (materialData?.sections?.length ?? 1) - 1) {
        setSelectedSection({ sectionIndex: (sectionIndex ?? 0) + 1 });
      } else if ((sectionIndex ?? 0) < (materialData?.sections?.length ?? 1) - 1) {
        setSelectedSection({ sectionIndex: (sectionIndex ?? 0) + 1 });
      } else if (sectionIndex === (materialData?.sections?.length ?? 1) - 1 && subsectionIndex === undefined) {
        setSelectedSection({ sectionIndex: undefined, type: 'footer' });
      }
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress
          size={60}
          sx={{
            color: designSystemTheme.palette.primary.main,
          }}
        />
      </Box>
    );
  }

  if (!materialData) {
    return (
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            backgroundColor: designSystemTheme.palette.background.paper,
            borderRadius: borderRadius['2xl'],
            border: `1px solid ${designSystemTheme.palette.divider}`,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: designSystemTheme.typography.h5.fontFamily,
              fontWeight: designSystemTheme.typography.h5.fontWeight,
              color: designSystemTheme.palette.text.secondary,
              mb: 2,
            }}
          >
            Material Not Found
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: designSystemTheme.palette.text.secondary,
            }}
          >
            The requested material could not be found or you don&apos;t have permission to view it.
          </Typography>
        </Box>
      </Container>
    );
  }

  const currentContent = selectedSection.type === 'header' || selectedSection.type === 'footer'
    ? ''
    : selectedSection.sectionIndex !== undefined
        ? selectedSection.subSubsectionIndex !== undefined
          ? materialData.sections[selectedSection.sectionIndex]?.subsections[selectedSection.subsectionIndex!]?.subSubsections[selectedSection.subSubsectionIndex]?.content || ''
          : selectedSection.subsectionIndex !== undefined
            ? materialData.sections[selectedSection.sectionIndex]?.subsections[selectedSection.subsectionIndex!]?.content || ''
            : materialData.sections[selectedSection.sectionIndex]?.content || ''
        : '';

  const currentTitle = selectedSection.type === 'header' || selectedSection.type === 'footer'
    ? ''
    : selectedSection.sectionIndex !== undefined
        ? selectedSection.subSubsectionIndex !== undefined
          ? materialData.sections[selectedSection.sectionIndex]?.subsections[selectedSection.subsectionIndex!]?.subSubsections[selectedSection.subSubsectionIndex]?.title || ''
          : selectedSection.subsectionIndex !== undefined
            ? materialData.sections[selectedSection.sectionIndex]?.subsections[selectedSection.subsectionIndex!]?.title || ''
            : materialData.sections[selectedSection.sectionIndex]?.title || ''
        : '';

  const currentLinks = selectedSection.sectionIndex !== undefined
      ? selectedSection.subSubsectionIndex !== undefined
        ? materialData.sections[selectedSection.sectionIndex]?.subsections[selectedSection.subsectionIndex!]?.subSubsections[selectedSection.subSubsectionIndex]?.links || []
        : selectedSection.subsectionIndex !== undefined
            ? materialData.sections[selectedSection.sectionIndex]?.subsections[selectedSection.subsectionIndex!]?.links || []
            : materialData.sections[selectedSection.sectionIndex]?.links || []
      : [];

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header with Back Button and Actions */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 2,
          backgroundColor: designSystemTheme.palette.background.paper,
          borderRadius: 0,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Material Status */}
            <Chip
              label={materialData.published ? 'Published' : materialData.scheduledTimestamp ? 'Scheduled' : 'Draft'}
              color={materialData.published ? 'success' : materialData.scheduledTimestamp ? 'info' : 'warning'}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />

            {/* Download Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {materialData?.originalFile && (
                <Tooltip title={`Download original file: ${materialData.originalFile.name}`} arrow>
                  <Button
                    variant="outlined"
                    startIcon={<SlideshowIcon />}
                    endIcon={<DownloadIcon />}
                    onClick={handleDownloadOriginalFile}
                    sx={{
                      borderRadius: '12px', // More rounded corners
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    PPTX
                  </Button>
                </Tooltip>
              )}

              <Button
                variant="outlined"
                startIcon={<FileIcon />}
                endIcon={<DownloadIcon />}
                onClick={async () => {
                  if (materialData) {
                    setProgress(0);
                    await handleDownloadPDF(materialData, setProgress);
                    setProgress(null);
                  }
                }}
                disabled={progress !== null}
                sx={{
                  borderRadius: '12px', // More rounded corners
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {progress !== null ? 'Generating...' : 'PDF'}
              </Button>
            </Box>
          </Box>
        </Box>

        {progress !== null && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{
                borderRadius: borderRadius.xl,
                height: 8,
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <ErrorBoundary>
          <SideBarModern
          sections={materialData.sections}
          selected={selectedSection}
          onAddSection={() => {}}
          onAddSubsection={() => {}}
          onAddSubSubsection={() => {}}
          onSelectSection={handleSelectSection}
          onUpdateSectionTitle={() => {}}
          onUpdateSubsectionTitle={() => {}}
          onUpdateSubSubsectionTitle={() => {}}
          onDeleteSection={() => {}}
          onDeleteSubsection={() => {}}
          onDeleteSubSubsection={() => {}}
          isViewMode={true}
        />
        </ErrorBoundary>

        {/* Content Area */}
        <Box sx={{ flexGrow: 1, p: 4, overflow: 'auto' }}>
          {/* Header Content */}
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
            <Typography
              dangerouslySetInnerHTML={{ 
                __html: materialData.header.content.replace(/\n/g, '<br />') 
              }}
              sx={{
                fontFamily: designSystemTheme.typography.body1.fontFamily,
                color: designSystemTheme.palette.text.secondary,
                lineHeight: 1.6,
              }}
            />
          </Paper>

          {/* Material Title */}
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontFamily: designSystemTheme.typography.h3.fontFamily,
              fontWeight: designSystemTheme.typography.h3.fontWeight,
              color: designSystemTheme.palette.text.primary,
              mb: 4,
            }}
          >
            {materialData.title}
          </Typography>

          {/* Section Title */}
          {currentTitle && (
            <Typography
              variant="h4"
              align="center"
              sx={{
                fontFamily: designSystemTheme.typography.h4.fontFamily,
                fontWeight: designSystemTheme.typography.h4.fontWeight,
                color: designSystemTheme.palette.text.primary,
                mb: 4,
              }}
            >
              {currentTitle}
            </Typography>
          )}

          {/* Section Content */}
          {selectedSection.type !== 'header' && selectedSection.type !== 'footer' && (
            <Fade key={contentKey} in={true} timeout={400}>
              <Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mb: 3,
                    backgroundColor: designSystemTheme.palette.background.paper,
                    borderRadius: borderRadius.xl,
                    border: `1px solid ${designSystemTheme.palette.divider}`,
                  }}
                >
                  <Typography
                    dangerouslySetInnerHTML={{ 
                      __html: currentContent.replace(/\n/g, '<br />') 
                    }}
                    sx={{
                      fontFamily: designSystemTheme.typography.body1.fontFamily,
                      color: designSystemTheme.palette.text.primary,
                      lineHeight: 1.7,
                      '& p': {
                        mb: 2,
                      },
                    }}
                  />
                  
                  {/* Images */}
                  <Box sx={{ mt: 3 }}>
                    {selectedSection.sectionIndex !== undefined && (
                      <>
                        {selectedSection.subSubsectionIndex !== undefined
                          ? (materialData.sections[selectedSection.sectionIndex]?.subsections?.[selectedSection.subsectionIndex!]?.subSubsections?.[selectedSection.subSubsectionIndex]?.images?.length || 0) > 0 && (
                            <ImageGallery images={materialData.sections[selectedSection.sectionIndex]?.subsections?.[selectedSection.subsectionIndex!]?.subSubsections?.[selectedSection.subSubsectionIndex]?.images || []} />
                          )
                          : selectedSection.subsectionIndex !== undefined
                            ? (materialData.sections[selectedSection.sectionIndex]?.subsections?.[selectedSection.subsectionIndex]?.images?.length || 0) > 0 && (
                              <ImageGallery images={materialData.sections[selectedSection.sectionIndex]?.subsections?.[selectedSection.subsectionIndex]?.images || []} />
                            )
                            : (materialData.sections[selectedSection.sectionIndex]?.images?.length || 0) > 0 && (
                              <ImageGallery images={materialData.sections[selectedSection.sectionIndex]?.images || []} />
                            )}
                      </>
                    )}
                  </Box>
                </Paper>

                {/* Links */}
                {currentLinks.length > 0 && (
                  <ViewLinksTable links={currentLinks} />
                )}
              </Box>
            </Fade>
          )}

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Tooltip title="Previous Section/Subsection (Left Arrow)" arrow>
              <span>
                <IconButton
                  onClick={() => handleNavigate('prev')}
                  disabled={selectedSection.sectionIndex === 0 && selectedSection.subsectionIndex === undefined && selectedSection.type === 'header'}
                  sx={{
                    backgroundColor: designSystemTheme.palette.primary.main,
                    color: designSystemTheme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: designSystemTheme.palette.primary.dark,
                    },
                    '&:disabled': {
                      backgroundColor: designSystemTheme.palette.action.disabled,
                      color: designSystemTheme.palette.action.disabled,
                    },
                  }}
                >
                  <ArrowBackIosIcon />
                </IconButton>
              </span>
            </Tooltip>
            
            <Tooltip title="Next Section/Subsection (Right Arrow)" arrow>
              <span>
                <IconButton
                  onClick={() => handleNavigate('next')}
                  disabled={
                    selectedSection.sectionIndex === (materialData.sections?.length ?? 1) - 1 &&
                    (selectedSection.subsectionIndex === undefined ||
                      selectedSection.subsectionIndex === (materialData.sections[selectedSection.sectionIndex!]?.subsections?.length ?? 1) - 1) &&
                    selectedSection.type === 'footer'
                  }
                  sx={{
                    backgroundColor: designSystemTheme.palette.primary.main,
                    color: designSystemTheme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: designSystemTheme.palette.primary.dark,
                    },
                    '&:disabled': {
                      backgroundColor: designSystemTheme.palette.action.disabled,
                      color: designSystemTheme.palette.action.disabled,
                    },
                  }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {/* Footer Content */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mt: 4,
              backgroundColor: designSystemTheme.palette.background.paper,
              borderRadius: borderRadius.xl,
              border: `1px solid ${designSystemTheme.palette.divider}`,
            }}
          >
            <Typography
              dangerouslySetInnerHTML={{ 
                __html: materialData.footer.content.replace(/\n/g, '<br />') 
              }}
              sx={{
                fontFamily: designSystemTheme.typography.body1.fontFamily,
                color: designSystemTheme.palette.text.secondary,
                lineHeight: 1.6,
              }}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ViewMaterialModern;
