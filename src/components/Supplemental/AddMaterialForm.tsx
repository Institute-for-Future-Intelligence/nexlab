// src/components/Supplemental/AddMaterialForm.tsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Box, TextField, Button, Snackbar, Alert, Typography, IconButton, Tooltip, ToggleButton, ToggleButtonGroup, Paper, Divider, CircularProgress, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';
import { v4 as uuidv4 } from 'uuid';
import { convertMaterialWithImageUpload } from '../../stores/materialImportStore';

import { useSearchParams } from 'react-router-dom'; // Import this at the top

import SideBar from './SideBar';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BackToAllMaterialsButton from './BackToAllMaterialsButton';
import { Material, Section } from '../../types/Material';

import ImageUpload from './ImageUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageTitle from './ImageTitle';

import LinkManager from './LinkManager';
import TextEditor from './TextEditor';

import SimpleTextEditor from './SimpleTextEditor';
import CourseDropdown from './CourseDropdown';
import DateTimePickerComponent from './DateTimePickerComponent';
import { Edit as ManualIcon, AutoAwesome as AIIcon } from '@mui/icons-material';

// Lazy load AI import wrapper component
const MaterialImportWrapper = lazy(() => import('./MaterialImport/MaterialImportWrapper'));

interface AddMaterialFormProps {
  materialData?: Material;
  onSubmit?: (data: Material) => void;
}

const AddMaterialForm: React.FC<AddMaterialFormProps> = ({ materialData }) => {
  const navigate = useNavigate();
  const { userDetails } = useUser();
  const db = getFirestore();

  const [searchParams] = useSearchParams();
  const urlCourse = searchParams.get('course'); // Get course ID from URL

  const [course, setCourse] = useState<string>(materialData?.course || urlCourse || '');

  const [materialId, setMaterialId] = useState<string | null>(materialData?.id || null); // Store material ID

  const [title, setTitle] = useState<string>(materialData?.title || '');
  const [header, setHeader] = useState(materialData?.header || { title: 'Header', content: '' });
  const [footer, setFooter] = useState(materialData?.footer || { title: 'Footer', content: '' });
  const [sections, setSections] = useState<Section[]>(materialData?.sections || [
    { id: uuidv4(), title: 'Section 1', content: '', subsections: [], images: [], links: [] }
  ]);

  const [selectedSection, setSelectedSection] = useState<{ sectionIndex?: number, subsectionIndex?: number, subSubsectionIndex?: number, type?: 'header' | 'footer' }>({ sectionIndex: 0 });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success' | 'info' | 'warning'>('success');
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const [scheduledTimestamp, setScheduledTimestamp] = useState<Date | null>(materialData?.scheduledTimestamp?.toDate() || null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  
  // AI Import functionality
  const [importMode, setImportMode] = useState<'manual' | 'ai'>('manual');
  const [isAIImported, setIsAIImported] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState<{ completed: number; total: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handleNavigate('prev');
      } else if (event.key === 'ArrowRight') {
        handleNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSection, sections]); // handleNavigate is defined later, dependency would cause ordering issues

  const handleSubmit = async (e: React.FormEvent, shouldPublish: boolean = false, scheduleTimestamp?: Date | null) => {
    e.preventDefault();
  
    try {
      // If this is an AI imported material and we need to upload images
      if (isAIImported && !materialId) {
        // First create the material to get an ID for image uploads
        const docRef = await addDoc(collection(db, 'materials'), {
          course,
          title,
          header,
          footer,
          sections: [], // Start with empty sections, will update after image upload
          author: userDetails?.uid || '',
          timestamp: serverTimestamp(),
          published: false, // Don't publish yet, need to upload images first
          scheduledTimestamp: null,
        });
        
        const newMaterialId = docRef.id;
        setMaterialId(newMaterialId);
        
        try {
          // Convert material with image upload
          setSnackbarMessage('Uploading images...');
          setSnackbarSeverity('info');
          setOpenSnackbar(true);
          
          const materialWithImages = await convertMaterialWithImageUpload(
            course,
            userDetails?.uid || '',
            newMaterialId,
            (completed, total) => {
              setImageUploadProgress({ completed, total });
              console.log(`Image upload progress: ${completed}/${total}`);
            }
          );
          
          // Update the material with uploaded images
          await updateDoc(docRef, {
            sections: materialWithImages.sections,
            published: shouldPublish,
            scheduledTimestamp: scheduleTimestamp ? Timestamp.fromDate(scheduleTimestamp) : null,
          });
          
          // Update local state
          setSections(materialWithImages.sections);
          setIsAIImported(false); // Reset flag
          setImageUploadProgress(null);
          
          setSnackbarMessage(`Material ${shouldPublish ? 'published' : 'saved'} successfully with images!`);
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          // Still save the material but without uploaded images
          await updateDoc(docRef, {
            sections,
            published: shouldPublish,
            scheduledTimestamp: scheduleTimestamp ? Timestamp.fromDate(scheduleTimestamp) : null,
          });
          setSnackbarMessage('Material saved, but some images failed to upload');
          setSnackbarSeverity('warning');
        }
      } else if (materialId) {
        // Update existing material
        const docRef = doc(db, 'materials', materialId);
        await updateDoc(docRef, {
          course,
          title,
          header,
          footer,
          sections,
          published: shouldPublish,
          scheduledTimestamp: scheduleTimestamp ? Timestamp.fromDate(scheduleTimestamp) : null,
        });
        setSnackbarMessage('Material updated successfully');
      } else {
        // Add new manual material (no image upload needed)
        console.log('Saving material with sections:', sections.map(s => ({ 
          title: s.title, 
          imageCount: s.images?.length || 0,
          images: s.images?.map(img => ({ url: img.url.substring(0, 100) + '...', title: img.title })) 
        })));
        
        const docRef = await addDoc(collection(db, 'materials'), {
          course,
          title,
          header,
          footer,
          sections,
          author: userDetails?.uid || '',
          timestamp: serverTimestamp(),
          published: shouldPublish,
          scheduledTimestamp: scheduleTimestamp ? Timestamp.fromDate(scheduleTimestamp) : null,
        });
  
        setMaterialId(docRef.id); // Store newly created document ID
        setSnackbarMessage('Material saved successfully');
      }
  
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setShowSaveMessage(true); // Show "Changes Saved" message

      // Hide the save message after 3 seconds
      setTimeout(() => setShowSaveMessage(false), 3000);
    } catch (error) {
      setSnackbarMessage('Failed to save material');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCancel = () => {
    if (urlCourse) {
      navigate(`/supplemental-materials?course=${urlCourse}`); // Go back to the course-specific page
    } else {
      navigate('/supplemental-materials'); // Default to course selection if no course is found
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    handleSubmit(e, true);
  };

  const handleSchedulePublish = (e: React.FormEvent) => {
    if (showDatePicker && scheduledTimestamp) {
      handleSubmit(e, false, scheduledTimestamp);
    } else {
      setShowDatePicker(true);
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { id: uuidv4(), title: `Section ${sections.length + 1}`, content: '', subsections: [], images: [], links: [] }]);
  };

  const handleAddSubsection = (sectionIndex: number) => {
    const newSections = [...sections];
    const section = newSections[sectionIndex];
    section.subsections.push({ id: uuidv4(), title: `Subsection ${section.subsections.length + 1}`, content: '', subSubsections: [], images: [], links: [] });
    setSections(newSections);
    setSelectedSection({ sectionIndex, subsectionIndex: section.subsections.length - 1 });
  };

  const handleAddSubSubsection = (sectionIndex: number, subsectionIndex: number) => {
    const newSections = [...sections];
    const subsection = newSections[sectionIndex].subsections[subsectionIndex];
    subsection.subSubsections.push({ id: uuidv4(), title: `Sub-Subsection ${subsection.subSubsections.length + 1}`, content: '', images: [], links: [] });
    setSections(newSections);
    setSelectedSection({ sectionIndex, subsectionIndex, subSubsectionIndex: subsection.subSubsections.length - 1 });
  };

  const handleImagesUploaded = (sectionIndex: number, images: { url: string; title: string }[], subsectionIndex?: number, subSubsectionIndex?: number) => {
    const newSections = [...sections];
    if (subSubsectionIndex !== undefined) {
      newSections[sectionIndex].subsections[subsectionIndex!].subSubsections[subSubsectionIndex].images = [...newSections[sectionIndex].subsections[subsectionIndex!].subSubsections[subSubsectionIndex].images, ...images];
    } else if (subsectionIndex !== undefined) {
      newSections[sectionIndex].subsections[subsectionIndex].images = [...newSections[sectionIndex].subsections[subsectionIndex].images, ...images];
    } else {
      newSections[sectionIndex].images = [...newSections[sectionIndex].images, ...images];
    }
    setSections(newSections);
  };

  const handleLinksChange = (sectionIndex: number, links: { title: string; url: string; description: string }[], subsectionIndex?: number, subSubsectionIndex?: number) => {
    const newSections = [...sections];
    if (subSubsectionIndex !== undefined) {
      newSections[sectionIndex].subsections[subsectionIndex!].subSubsections[subSubsectionIndex].links = links;
    } else if (subsectionIndex !== undefined) {
      newSections[sectionIndex].subsections[subsectionIndex].links = links;
    } else {
      newSections[sectionIndex].links = links;
    }
    setSections(newSections);
  };

  const handleSelectSection = (sectionIndex: number | 'header' | 'footer', subsectionIndex?: number, subSubsectionIndex?: number) => {
    setSelectedSection({ sectionIndex: typeof sectionIndex === 'number' ? sectionIndex : undefined, subsectionIndex, subSubsectionIndex, type: typeof sectionIndex === 'string' ? sectionIndex : undefined });
  };

  const handleUpdateSectionTitle = (sectionIndex: number, newTitle: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].title = newTitle;
    setSections(newSections);
  };

  const handleUpdateSubsectionTitle = (sectionIndex: number, subsectionIndex: number, newTitle: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].subsections[subsectionIndex].title = newTitle;
    setSections(newSections);
  };

  const handleUpdateSubSubsectionTitle = (sectionIndex: number, subsectionIndex: number, subSubsectionIndex: number, newTitle: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].subsections[subsectionIndex].subSubsections[subSubsectionIndex].title = newTitle;
    setSections(newSections);
  };

  const handleUpdateContent = (sectionIndex: number, content: string, subsectionIndex?: number, subSubsectionIndex?: number) => {
    const newSections = [...sections];
    if (subSubsectionIndex !== undefined) {
      newSections[sectionIndex].subsections[subsectionIndex!].subSubsections[subSubsectionIndex].content = content;
    } else if (subsectionIndex !== undefined) {
      newSections[sectionIndex].subsections[subsectionIndex].content = content;
    } else {
      newSections[sectionIndex].content = content;
    }
    setSections(newSections);
  };

  const handleUpdateHeaderContent = (content: string) => {
    setHeader({ ...header, content });
  };

  const handleUpdateFooterContent = (content: string) => {
    setFooter({ ...footer, content });
  };

  // Delete Section
  const handleDeleteSection = (sectionIndex: number) => {
    const newSections = sections.filter((_, index) => index !== sectionIndex);
    setSections(newSections);

    if (newSections.length === 0) {
      setSelectedSection({ sectionIndex: undefined, type: 'header' });
    } else if (sectionIndex >= newSections.length) {
      setSelectedSection({ sectionIndex: newSections.length - 1 });
    } else {
      setSelectedSection({ sectionIndex });
    }
  };

  // Delete Subsection
  const handleDeleteSubsection = (sectionIndex: number, subsectionIndex: number) => {
    const newSections = [...sections];
    if (newSections[sectionIndex]?.subsections) {
      newSections[sectionIndex].subsections = newSections[sectionIndex].subsections.filter((_, index) => index !== subsectionIndex);
      setSections(newSections);

      if (newSections[sectionIndex].subsections.length === 0) {
        setSelectedSection({ sectionIndex });
      } else if (subsectionIndex >= newSections[sectionIndex].subsections.length) {
        setSelectedSection({ sectionIndex, subsectionIndex: newSections[sectionIndex].subsections.length - 1 });
      } else {
        setSelectedSection({ sectionIndex, subsectionIndex });
      }
    }
  };

  // Delete Sub-Subsection
  const handleDeleteSubSubsection = (sectionIndex: number, subsectionIndex: number, subSubsectionIndex: number) => {
    const newSections = [...sections];
    const subsections = newSections[sectionIndex]?.subsections?.[subsectionIndex];
    if (subsections && subsections.subSubsections) {
      subsections.subSubsections = subsections.subSubsections.filter((_, index) => index !== subSubsectionIndex);
      setSections(newSections);

      if (!subsections.subSubsections.length) {
        setSelectedSection({ sectionIndex, subsectionIndex });
      } else if (subSubsectionIndex >= subsections.subSubsections.length) {
        setSelectedSection({ sectionIndex, subsectionIndex, subSubsectionIndex: subsections.subSubsections.length - 1 });
      } else {
        setSelectedSection({ sectionIndex, subsectionIndex, subSubsectionIndex });
      }
    }
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
        const prevSection = sections[sectionIndex! - 1];
        setSelectedSection({
          sectionIndex: sectionIndex! - 1,
          subsectionIndex: prevSection.subsections.length ? prevSection.subsections.length - 1 : undefined,
          subSubsectionIndex: prevSection.subsections.length ? prevSection.subsections[prevSection.subsections.length - 1].subSubsections.length - 1 : undefined,
        });
      } else if (type === 'footer') {
        setSelectedSection({ sectionIndex: sections.length - 1, type: 'footer' });
      } else if (sectionIndex === undefined && type === 'header') {
        setSelectedSection({ sectionIndex: sections.length - 1 });
      }
    } else if (direction === 'next') {
      if (subSubsectionIndex === undefined && subsectionIndex !== undefined && sections[sectionIndex!].subsections[subsectionIndex].subSubsections.length) {
        setSelectedSection({ sectionIndex, subsectionIndex, subSubsectionIndex: 0 });
      } else if (subSubsectionIndex !== undefined && subSubsectionIndex < sections[sectionIndex!].subsections[subsectionIndex!].subSubsections.length - 1) {
        setSelectedSection({ sectionIndex, subsectionIndex, subSubsectionIndex: subSubsectionIndex + 1 });
      } else if (subSubsectionIndex !== undefined && subSubsectionIndex === sections[sectionIndex!].subsections[subsectionIndex!].subSubsections.length - 1 && subsectionIndex! < sections[sectionIndex!].subsections.length - 1) {
        setSelectedSection({ sectionIndex, subsectionIndex: subsectionIndex! + 1 });
      } else if (subsectionIndex === undefined && sections[sectionIndex!].subsections.length) {
        setSelectedSection({ sectionIndex, subsectionIndex: 0 });
      } else if (subsectionIndex !== undefined && subsectionIndex < sections[sectionIndex!].subsections.length - 1) {
        setSelectedSection({ sectionIndex, subsectionIndex: subsectionIndex + 1 });
      } else if (subsectionIndex !== undefined && subsectionIndex === sections[sectionIndex!].subsections.length - 1 && sectionIndex! < sections.length - 1) {
        setSelectedSection({ sectionIndex: sectionIndex! + 1 });
      } else if (sectionIndex! < sections.length - 1) {
        setSelectedSection({ sectionIndex: sectionIndex! + 1 });
      } else if (sectionIndex === sections.length - 1 && subsectionIndex === undefined) {
        setSelectedSection({ sectionIndex: undefined, type: 'footer' });
      }
    }
  };

  const currentContent = selectedSection.type === 'header' || selectedSection.type === 'footer'
    ? ''
    : selectedSection.sectionIndex !== undefined
        ? selectedSection.subSubsectionIndex !== undefined
          ? sections[selectedSection.sectionIndex].subsections[selectedSection.subsectionIndex!].subSubsections[selectedSection.subSubsectionIndex]?.content || ''
          : selectedSection.subsectionIndex !== undefined
            ? sections[selectedSection.sectionIndex].subsections[selectedSection.subsectionIndex]?.content || ''
            : sections[selectedSection.sectionIndex]?.content || ''
        : '';

  const currentTitle = selectedSection.type === 'header' || selectedSection.type === 'footer'
    ? ''
    : selectedSection.sectionIndex !== undefined
        ? selectedSection.subSubsectionIndex !== undefined
          ? sections[selectedSection.sectionIndex].subsections[selectedSection.subsectionIndex!].subSubsections[selectedSection.subSubsectionIndex]?.title || ''
          : selectedSection.subsectionIndex !== undefined
            ? sections[selectedSection.sectionIndex].subsections[selectedSection.subsectionIndex]?.title || ''
            : sections[selectedSection.sectionIndex]?.title || ''
        : '';

  const handleDeleteImage = (sectionIndex: number, imageUrl: string, subsectionIndex?: number, subSubsectionIndex?: number) => {
    const newSections = [...sections];
    if (subSubsectionIndex !== undefined) {
      newSections[sectionIndex].subsections[subsectionIndex!].subSubsections[subSubsectionIndex].images = newSections[sectionIndex].subsections[subsectionIndex!].subSubsections[subSubsectionIndex].images.filter((img) => img.url !== imageUrl);
    } else if (subsectionIndex !== undefined) {
      newSections[sectionIndex].subsections[subsectionIndex].images = newSections[sectionIndex].subsections[subsectionIndex].images.filter((img) => img.url !== imageUrl);
    } else {
      newSections[sectionIndex].images = newSections[sectionIndex].images.filter((img) => img.url !== imageUrl);
    }
    setSections(newSections);
  };

  // Handle AI Import mode switching
  const handleImportModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'manual' | 'ai' | null) => {
    if (newMode !== null) {
      setImportMode(newMode);
    }
  };

  // Handle material ready from AI import
  const handleMaterialReady = (materialData: Omit<Material, 'id' | 'timestamp'>) => {
    // Populate the form with AI-generated data
    setTitle(materialData.title);
    setHeader(materialData.header);
    setFooter(materialData.footer);
    setSections(materialData.sections);
    setCourse(materialData.course);
    setIsAIImported(true); // Mark as AI imported for special image handling
    
    // Switch back to manual mode for editing
    setImportMode('manual');
    
    // Show success message
    setSnackbarMessage('Material imported successfully! You can now edit and save it.');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    
    // Auto-select first section for editing
    setSelectedSection({ sectionIndex: 0 });
  };

  // Handle AI import cancellation
  const handleImportCancel = () => {
    setImportMode('manual');
  };

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ width: '450px', ml: 2, mt: 2 }}>
          <BackToAllMaterialsButton />
        </Box>
        
        {/* Import Mode Toggle */}
        <Paper elevation={2} sx={{ mx: 2, mt: 2, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            📝 Create Material
          </Typography>
          <ToggleButtonGroup
            value={importMode}
            exclusive
            onChange={handleImportModeChange}
            aria-label="import mode"
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="manual" aria-label="manual creation">
              <ManualIcon sx={{ mr: 1 }} />
              Manual Creation
            </ToggleButton>
            <ToggleButton value="ai" aria-label="ai import">
              <AIIcon sx={{ mr: 1 }} />
              AI Import
            </ToggleButton>
          </ToggleButtonGroup>
          
          {importMode === 'ai' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Upload your presentation, document, or material and let AI automatically structure it into course content.
              </Typography>
            </Alert>
          )}
        </Paper>
        
        {/* Conditional Content Based on Import Mode */}
        <>
          {importMode === 'ai' ? (
            <Box sx={{ flexGrow: 1, p: 2 }}>
              <Suspense 
                fallback={
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Loading AI Import...
                    </Typography>
                  </Box>
                }
              >
                <MaterialImportWrapper
                  courseId={course}
                  authorId={userDetails?.uid || ''}
                  onMaterialReady={handleMaterialReady}
                  onCancel={handleImportCancel}
                  onError={(error, errorInfo) => {
                    console.error('Material Import Error:', error, errorInfo);
                    // Optionally show a snackbar notification
                    setSnackbarMessage(`Import error: ${error.message}`);
                    setSnackbarSeverity('error');
                    setOpenSnackbar(true);
                  }}
                />
              </Suspense>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexGrow: 1 }}>
              <SideBar
                sections={sections}
                selected={selectedSection}
                onAddSection={handleAddSection}
                onAddSubsection={handleAddSubsection}
                onAddSubSubsection={handleAddSubSubsection}
                onSelectSection={handleSelectSection}
                onUpdateSectionTitle={handleUpdateSectionTitle}
                onUpdateSubsectionTitle={handleUpdateSubsectionTitle}
                onUpdateSubSubsectionTitle={handleUpdateSubSubsectionTitle}
                onDeleteSection={handleDeleteSection}
                onDeleteSubsection={handleDeleteSubsection}
                onDeleteSubSubsection={handleDeleteSubSubsection}
              />
              <Box sx={{ flexGrow: 1, padding: 3 }}>
                <TextField
                  label="Material Title"
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <CourseDropdown value={course} onChange={setCourse} />
                {scheduledTimestamp && (
                  <Typography variant="body1" gutterBottom>
                    Scheduled Publish Date & Time: {scheduledTimestamp.toLocaleString()}
                  </Typography>
                )}
                <Box sx={{ border: selectedSection.type === 'header' ? '2px solid blue' : 'none', borderRadius: 1, padding: 2, mb: 2 }}>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ color: 'gray', textAlign: 'center' }}>Header</Typography>
                  </Box>
                  <SimpleTextEditor content={header.content} onChange={handleUpdateHeaderContent} />
                </Box>
                <Typography variant="h4" align="center" gutterBottom>
                  {currentTitle}
                </Typography>
                {selectedSection.type !== 'header' && selectedSection.type !== 'footer' && (
                  <>
                    <TextEditor
                      key={`${selectedSection.sectionIndex}-${selectedSection.subsectionIndex}-${selectedSection.subSubsectionIndex}`}
                      content={currentContent}
                      onChange={(content) => handleUpdateContent(
                        selectedSection.sectionIndex!,
                        content,
                        selectedSection.subsectionIndex,
                        selectedSection.subSubsectionIndex
                      )}
                    />
                    <ImageUpload
                      sectionId={
                        selectedSection.sectionIndex !== undefined
                          ? selectedSection.subSubsectionIndex !== undefined && selectedSection.subsectionIndex !== undefined
                            ? sections[selectedSection.sectionIndex]?.subsections?.[selectedSection.subsectionIndex]?.subSubsections?.[selectedSection.subSubsectionIndex]?.id || ''
                            : selectedSection.subsectionIndex !== undefined
                              ? sections[selectedSection.sectionIndex]?.subsections?.[selectedSection.subsectionIndex]?.id || ''
                              : sections[selectedSection.sectionIndex]?.id || ''
                          : ''
                      }
                      onImagesUploaded={(urls) => handleImagesUploaded(
                        selectedSection.sectionIndex!,
                        urls,
                        selectedSection.subsectionIndex,
                        selectedSection.subSubsectionIndex
                      )}
                    />
                    {(selectedSection.subSubsectionIndex !== undefined
                      ? sections[selectedSection.sectionIndex!]?.subsections?.[selectedSection.subsectionIndex!]?.subSubsections?.[selectedSection.subSubsectionIndex]?.images || []
                      : selectedSection.subsectionIndex !== undefined
                        ? sections[selectedSection.sectionIndex!]?.subsections?.[selectedSection.subsectionIndex]?.images || []
                        : sections[selectedSection.sectionIndex!]?.images || []
                    ).map((image, index) => (
                      <Box key={index} sx={{ position: 'relative', mt: 2 }}>
                        <img src={image.url} alt={`Section ${selectedSection.sectionIndex! + 1} Image ${index + 1}`} style={{ maxWidth: '50%', marginBottom: '16px' }} />
                        <ImageTitle
                          imageTitle={image.title}
                          onTitleChange={(newTitle) => {
                            const newSections = [...sections];

                            // Check each level of the nested structure before assigning
                            if (selectedSection.sectionIndex !== undefined) {
                              if (selectedSection.subSubsectionIndex !== undefined && selectedSection.subsectionIndex !== undefined) {
                                const subSubsections = newSections[selectedSection.sectionIndex].subsections?.[selectedSection.subsectionIndex]?.subSubsections;
                                if (subSubsections && subSubsections[selectedSection.subSubsectionIndex]) {
                                  subSubsections[selectedSection.subSubsectionIndex].images[index].title = newTitle;
                                }
                              } else if (selectedSection.subsectionIndex !== undefined) {
                                const subsections = newSections[selectedSection.sectionIndex].subsections;
                                if (subsections && subsections[selectedSection.subsectionIndex]) {
                                  subsections[selectedSection.subsectionIndex].images[index].title = newTitle;
                                }
                              } else {
                                newSections[selectedSection.sectionIndex].images[index].title = newTitle;
                              }
                            }

                            setSections(newSections);
                          }}
                        />
                        <IconButton
                          sx={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                          onClick={() => handleDeleteImage(selectedSection.sectionIndex!, image.url, selectedSection.subsectionIndex, selectedSection.subSubsectionIndex)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <LinkManager
                      links={
                        selectedSection.sectionIndex !== undefined
                          ? selectedSection.subSubsectionIndex !== undefined && selectedSection.subsectionIndex !== undefined
                            ? sections[selectedSection.sectionIndex]?.subsections?.[selectedSection.subsectionIndex]?.subSubsections?.[selectedSection.subSubsectionIndex]?.links || []
                            : selectedSection.subsectionIndex !== undefined
                              ? sections[selectedSection.sectionIndex]?.subsections?.[selectedSection.subsectionIndex]?.links || []
                              : sections[selectedSection.sectionIndex]?.links || []
                          : []
                      }
                      onLinksChange={(newLinks) => handleLinksChange(
                        selectedSection.sectionIndex!,
                        newLinks,
                        selectedSection.subsectionIndex,
                        selectedSection.subSubsectionIndex
                      )}
                    />
                  </>
                )}
                <Box sx={{ border: selectedSection.type === 'footer' ? '2px solid blue' : 'none', borderRadius: 1, padding: 2, mt: 2 }}>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ color: 'gray', textAlign: 'center' }}>Footer</Typography>
                  </Box>
                  <SimpleTextEditor content={footer.content} onChange={handleUpdateFooterContent} />
                </Box>
                                  {/* Image Upload Progress */}
                  {imageUploadProgress && (
                    <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#f5f5f5' }}>
                      <Typography variant="body2" gutterBottom>
                        Uploading images: {imageUploadProgress.completed} / {imageUploadProgress.total}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(imageUploadProgress.completed / imageUploadProgress.total) * 100}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
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
                          selectedSection.sectionIndex === sections.length - 1 &&
                          (selectedSection.subsectionIndex === undefined ||
                            selectedSection.subsectionIndex === sections[selectedSection.sectionIndex!].subsections.length - 1) &&
                          selectedSection.type === 'footer'
                        }
                      >
                        <ArrowForwardIosIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* Cancel Button */}
                  <Button 
                    type="button" 
                    variant="outlined" 
                    onClick={handleCancel} 
                    className="supplemental-button cancel-button"
                  >
                    Cancel
                  </Button>

                  {/* Save Button with Save Message */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button 
                      type="submit" 
                      variant="outlined" 
                      onClick={(e) => handleSubmit(e, false)}
                      className="supplemental-button save-button"
                    >
                      Save
                    </Button>
                    {showSaveMessage && (
                      <Typography variant="body2" sx={{ fontStyle: 'italic', ml: 1 }}>
                        Changes Saved
                      </Typography>
                    )}
                  </Box>

                  {/* Publish Button */}
                  <Button 
                    type="button" 
                    variant="outlined" 
                    onClick={handlePublish} 
                    className="supplemental-button publish-button"
                  >
                    Publish
                  </Button>

                  {/* Schedule Publish Button with Date Picker */}
                  <div>
                    {showDatePicker && (
                      <DateTimePickerComponent
                        value={scheduledTimestamp}
                        onChange={setScheduledTimestamp}
                      />
                    )}
                    <Button 
                      type="button" 
                      variant="outlined" 
                      onClick={handleSchedulePublish} 
                      className="supplemental-button schedule-publish-button"
                    >
                      {showDatePicker ? 'Schedule Publish' : 'Schedule Publish'}
                    </Button>
                  </div>
                </Box>
              </Box>
            </Box>
          )}
          
          {/* Snackbar for notifications */}
          <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
            <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </>
      </Box>
    </Box>
  );
};

export default AddMaterialForm;