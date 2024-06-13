// src/components/Supplemental/AddMaterialForm.tsx
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Snackbar, Alert, Typography, IconButton, Tooltip, TextareaAutosize } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '../../contexts/UserContext';
import { v4 as uuidv4 } from 'uuid';
import SideBar from './SideBar';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BackToAllMaterialsButton from './BackToAllMaterialsButton';

import { Material, Section, Subsection, SubSubsection } from '../../types/Material';

import ImageUpload from './ImageUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageTitle from './ImageTitle';

import LinkManager from './LinkManager';
// import TextEditor from './TextEditor';

import SimpleTextEditor from './SimpleTextEditor';

interface AddMaterialFormProps {
  materialData?: Material;
  onSubmit?: (data: Material) => void;
}

const AddMaterialForm: React.FC<AddMaterialFormProps> = ({ materialData, onSubmit }) => {
  const navigate = useNavigate();
  const { userDetails } = useUser();
  const db = getFirestore();

  const [title, setTitle] = useState<string>(materialData?.title || '');
  const [header, setHeader] = useState(materialData?.header || { title: 'Header', content: '' });
  const [footer, setFooter] = useState(materialData?.footer || { title: 'Footer', content: '' });
  const [sections, setSections] = useState<Section[]>(materialData?.sections || [
    { id: uuidv4(), title: 'Section 1', content: '', subsections: [], images: [], links: [] }
  ]);

  const [selectedSection, setSelectedSection] = useState<{ sectionIndex?: number, subsectionIndex?: number, subSubsectionIndex?: number, type?: 'header' | 'footer' }>({ sectionIndex: 0 });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('success');

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
  }, [selectedSection, sections]);

  const handleSubmit = async (e: React.FormEvent, shouldPublish: boolean = false) => {
    e.preventDefault();
  
    try {
      if (materialData) {
        const docRef = doc(db, 'materials', materialData.id);
        await updateDoc(docRef, {
          title,
          header,
          footer,
          sections,
          published: shouldPublish,
        });
        setSnackbarMessage('Material updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'materials'), {
          title,
          header,
          footer,
          sections,
          author: userDetails?.uid || '',
          timestamp: serverTimestamp() as any,
          published: shouldPublish,
        });
        setSnackbarMessage('Material saved successfully');
      }
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      navigate('/supplemental-materials');
    } catch (error) {
      setSnackbarMessage('Failed to save material');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };  

  const handleCancel = () => {
    navigate('/supplemental-materials');
  };

  const handlePublish = (e: React.FormEvent) => {
    handleSubmit(e, true);
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

  const handleDeleteSubsection = (sectionIndex: number, subsectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].subsections = newSections[sectionIndex].subsections.filter((_, index) => index !== subsectionIndex);
    setSections(newSections);
    if (newSections[sectionIndex].subsections.length === 0) {
      setSelectedSection({ sectionIndex });
    } else if (subsectionIndex >= newSections[sectionIndex].subsections.length) {
      setSelectedSection({ sectionIndex, subsectionIndex: newSections[sectionIndex].subsections.length - 1 });
    } else {
      setSelectedSection({ sectionIndex, subsectionIndex });
    }
  };

  const handleDeleteSubSubsection = (sectionIndex: number, subsectionIndex: number, subSubsectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].subsections[subsectionIndex].subSubsections = newSections[sectionIndex].subsections[subsectionIndex].subSubsections.filter((_, index) => index !== subSubsectionIndex);
    setSections(newSections);
    if (newSections[sectionIndex].subsections[subsectionIndex].subSubsections.length === 0) {
      setSelectedSection({ sectionIndex, subsectionIndex });
    } else if (subSubsectionIndex >= newSections[sectionIndex].subsections[subsectionIndex].subSubsections.length) {
      setSelectedSection({ sectionIndex, subsectionIndex, subSubsectionIndex: newSections[sectionIndex].subsections[subsectionIndex].subSubsections.length - 1 });
    } else {
      setSelectedSection({ sectionIndex, subsectionIndex, subSubsectionIndex });
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

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ width: '450px', ml: 2, mt: 2 }}>
          <BackToAllMaterialsButton />
        </Box>
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <SideBar
            sections={sections}
            selected={selectedSection}
            onAddSection={handleAddSection}
            onAddSubsection={handleAddSubsection}
            onAddSubSubsection={handleAddSubSubsection} // Add this line
            onSelectSection={handleSelectSection}
            onUpdateSectionTitle={handleUpdateSectionTitle}
            onUpdateSubsectionTitle={handleUpdateSubsectionTitle}
            onUpdateSubSubsectionTitle={handleUpdateSubSubsectionTitle} // Add this line
            onDeleteSection={handleDeleteSection} // Pass delete section handler
            onDeleteSubsection={handleDeleteSubsection} // Pass delete subsection handler
            onDeleteSubSubsection={handleDeleteSubSubsection} // Add this line
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
                <TextareaAutosize
                  aria-label="content"
                  minRows={10}
                  placeholder="Content"
                  style={{
                    width: '100%',
                    padding: '16.5px 14px',
                    fontSize: '1rem',
                    borderRadius: '4px',
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                    marginBottom: '16px',
                  }}
                  value={currentContent}
                  onChange={(e) => handleUpdateContent(selectedSection.sectionIndex!, e.target.value, selectedSection.subsectionIndex, selectedSection.subSubsectionIndex)}
                />
                <ImageUpload
                  sectionId={selectedSection.subSubsectionIndex !== undefined 
                    ? sections[selectedSection.sectionIndex!].subsections[selectedSection.subsectionIndex!].subSubsections[selectedSection.subSubsectionIndex].id
                    : selectedSection.subsectionIndex !== undefined 
                      ? sections[selectedSection.sectionIndex!].subsections[selectedSection.subsectionIndex].id 
                      : sections[selectedSection.sectionIndex!].id}
                  onImagesUploaded={(urls) => handleImagesUploaded(selectedSection.sectionIndex!, urls, selectedSection.subsectionIndex, selectedSection.subSubsectionIndex)}
                />
                {(selectedSection.subSubsectionIndex !== undefined
                  ? sections[selectedSection.sectionIndex!].subsections[selectedSection.subsectionIndex!].subSubsections[selectedSection.subSubsectionIndex].images
                  : selectedSection.subsectionIndex !== undefined
                    ? sections[selectedSection.sectionIndex!].subsections[selectedSection.subsectionIndex].images
                    : sections[selectedSection.sectionIndex!].images
                ).map((image, index) => (
                  <Box key={index} sx={{ position: 'relative', mt: 2 }}>
                    <img src={image.url} alt={`Section ${selectedSection.sectionIndex! + 1} Image ${index + 1}`} style={{ maxWidth: '50%', marginBottom: '16px' }} />
                    <ImageTitle
                      imageTitle={image.title}
                      onTitleChange={(newTitle) => {
                        const newSections = [...sections];
                        if (selectedSection.subSubsectionIndex !== undefined) {
                          newSections[selectedSection.sectionIndex!].subsections[selectedSection.subsectionIndex!].subSubsections[selectedSection.subSubsectionIndex].images[index].title = newTitle;
                        } else if (selectedSection.subsectionIndex !== undefined) {
                          newSections[selectedSection.sectionIndex!].subsections[selectedSection.subsectionIndex].images[index].title = newTitle;
                        } else {
                          newSections[selectedSection.sectionIndex!].images[index].title = newTitle;
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
                  links={selectedSection.subSubsectionIndex !== undefined
                    ? sections[selectedSection.sectionIndex!].subsections[selectedSection.subsectionIndex!].subSubsections[selectedSection.subSubsectionIndex].links
                    : selectedSection.subsectionIndex !== undefined
                      ? sections[selectedSection.sectionIndex!].subsections[selectedSection.subsectionIndex].links
                      : sections[selectedSection.sectionIndex!].links}
                  onLinksChange={(newLinks) => handleLinksChange(selectedSection.sectionIndex!, newLinks, selectedSection.subsectionIndex, selectedSection.subSubsectionIndex)}
                />
              </>
            )}
            <Box sx={{ border: selectedSection.type === 'footer' ? '2px solid blue' : 'none', borderRadius: 1, padding: 2, mt: 2 }}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: 'gray', textAlign: 'center' }}>Footer</Typography>
              </Box>
              <SimpleTextEditor content={footer.content} onChange={handleUpdateFooterContent} />
            </Box>
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
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button type="button" variant="outlined" color="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" onClick={(e) => handleSubmit(e, false)}>
                Save
              </Button>
              <Button type="button" variant="contained" color="primary" onClick={handlePublish} sx={{ backgroundColor: 'green' }}>
                Publish
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddMaterialForm;