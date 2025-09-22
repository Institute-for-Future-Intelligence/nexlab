// src/components/Supplemental/ViewMaterial.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Box, Typography, IconButton, Tooltip, CircularProgress, Button, LinearProgress, Fade } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Material } from '../../types/Material';
import SideBar from './SideBar';
import BackToAllMaterialsButton from './BackToAllMaterialsButton';
import { useAdjacentSectionPreloader } from '../../hooks/useImagePreloader';
import { v4 as uuidv4 } from 'uuid';

import ImageGallery from './ImageGallery';
import ViewLinksTable from './ViewLinksTable';

import { handleDownloadPDF } from '../../utils/generatePDF';
import { GetApp as DownloadIcon, Description as FileIcon, Slideshow as SlideshowIcon } from '@mui/icons-material';

const ViewMaterial: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const db = getFirestore();
  const [materialData, setMaterialData] = useState<Material | null>(null);
  const [selectedSection, setSelectedSection] = useState<{ sectionIndex?: number, subsectionIndex?: number, subSubsectionIndex?: number, type?: 'header' | 'footer' }>({ sectionIndex: 0 });

  const [progress, setProgress] = useState<number | null>(null);
  const [contentKey, setContentKey] = useState(0); // Key for triggering transitions

  // Preload images from adjacent sections for smooth navigation
  useAdjacentSectionPreloader(
    materialData?.sections || [],
    selectedSection.sectionIndex || 0,
    !!materialData // Only enable when material is loaded
  );

  // Trigger transition when section changes
  useEffect(() => {
    setContentKey(prev => prev + 1);
  }, [selectedSection]);

  // Handle original file download
  const handleDownloadOriginalFile = async () => {
    if (!materialData?.originalFile) {
      return;
    }

    try {
      console.log('🚀 Starting original file download:', materialData.originalFile.name);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = materialData.originalFile.url;
      link.download = materialData.originalFile.name;
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Original file download initiated');
      
    } catch (error) {
      console.error('❌ Original file download failed:', error);
    }
  };

  useEffect(() => {
    if (id) {
      const fetchMaterial = async () => {
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
            allImages: docData.sections?.flatMap(s => s.images || []).map(img => ({ 
              url: img.url.substring(0, 100) + '...', 
              title: img.title 
            }))
          });
          setMaterialData(docData);
        }
      };
      fetchMaterial();
    }
  }, [id, db]);

  // Ensure material ID is always present in the URL as a query parameter (only when first loading the page)
  useEffect(() => {
    if (id && searchParams.get('material') !== id) {
      console.log("🔹 Updating URL: Adding material ID to query parameters:", id);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('material', id);
        return newParams;
      }, { replace: true });
    } else {
      console.log("Material ID already in URL:", searchParams.get('material'));
    }
  }, [id, searchParams, setSearchParams]);  

  const handleSelectSection = (sectionIndex: number | 'header' | 'footer', subsectionIndex?: number, subSubsectionIndex?: number) => {
    setSelectedSection({ sectionIndex: typeof sectionIndex === 'number' ? sectionIndex : undefined, subsectionIndex, subSubsectionIndex, type: typeof sectionIndex === 'string' ? sectionIndex : undefined });
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

  if (!materialData) return <CircularProgress />;

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
    <Box sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mx: 2 }}>
          <Box sx={{ width: '450px', ml: 2, mt: 2 }}>
            <BackToAllMaterialsButton />
          </Box>
          <Box sx={{ width: '450px', mr: 2, mt: 2, textAlign: 'right' }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {/* Original File Download Button - Only show for AI-imported materials */}
              {materialData?.originalFile && (
                <Tooltip title={`Download original file: ${materialData.originalFile.name}`}>
                  <Button
                    variant="outlined"
                    startIcon={<SlideshowIcon />}
                    endIcon={<DownloadIcon />}
                    onClick={handleDownloadOriginalFile}
                    sx={{
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      color: '#436850',
                      border: '2px solid #436850',
                      borderRadius: '12px', // More rounded corners
                      cursor: 'pointer',
                      fontFamily: 'Gabarito',
                      '&:hover': { 
                        backgroundColor: '#436850', 
                        color: '#FBFADA' 
                      },
                    }}
                  >
                    PPTX
                  </Button>
                </Tooltip>
              )}

              {/* PDF Download Button */}
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
                sx={{
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  color: '#436850',
                  border: '2px solid #436850',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Gabarito',
                  '&:hover': { 
                    backgroundColor: '#436850', 
                    color: '#FBFADA' 
                  },
                  '&:disabled': { backgroundColor: '#A8BDA8', cursor: 'not-allowed' } // Muted color when disabled
                }}
                disabled={progress !== null}
              >
                {progress !== null ? 'Generating...' : 'PDF'}
              </Button>
            </Box>

            {progress !== null && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <Box sx={{ width: '450px', minWidth: '450px', maxWidth: '450px', borderRight: '1px solid #ddd', padding: 2 }}>
            <SideBar
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
              isViewMode={true} // New prop to disable editing
            />
          </Box>
          <Box sx={{ flexGrow: 1, padding: 3 }}>
            <hr /> {/* Horizontal line above the header */}
            <Box sx={{ borderRadius: 1, padding: 2, mb: 2 }}>
              <Typography dangerouslySetInnerHTML={{ __html: materialData.header.content.replace(/\n/g, '<br />') }} />
            </Box>
            <hr /> {/* Horizontal line below the header */}
            <Typography variant="h3" align="center" gutterBottom>
              {materialData.title}
            </Typography>
            <hr /> {/* Horizontal line below the title */}
            <Typography variant="h4" align="center" gutterBottom>
              {currentTitle}
            </Typography>
            {selectedSection.type !== 'header' && selectedSection.type !== 'footer' && (
              <Fade key={contentKey} in={true} timeout={400}>
                <Box>
                  <Box
                    sx={{
                      mb: 2,
                      borderRadius: 1,
                      padding: 2,
                    }}
                  >
                    <Typography dangerouslySetInnerHTML={{ __html: currentContent.replace(/\n/g, '<br />') }} />
                    <Box>
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
                  </Box>
                  <ViewLinksTable links={currentLinks} />
                </Box>
              </Fade>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Tooltip title="Previous Section/Subsection (Left Arrow)" arrow>
                <span>
                  <IconButton
                    onClick={() => handleNavigate('prev')}
                    disabled={selectedSection.sectionIndex === 0 && selectedSection.subsectionIndex === undefined && selectedSection.type === 'header'}
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
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
            <hr /> {/* Horizontal line above the footer */}
            <Box sx={{ borderRadius: 1, padding: 2, mt: 2 }}>
              <Typography dangerouslySetInnerHTML={{ __html: materialData.footer.content.replace(/\n/g, '<br />') }} />
            </Box>
            <hr /> {/* Horizontal line below the footer */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ViewMaterial;