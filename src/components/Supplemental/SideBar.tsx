// src/components/Supplemental/SideBar.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteSectionSubsection from './DeleteSectionSubsection';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface SubSubsection {
  id: string;
  title: string;
}

interface Subsection {
  id: string;
  title: string;
  subSubsections: SubSubsection[];
}

interface Section {
  id: string;
  title: string;
  subsections: Subsection[];
}

interface SidebarProps {
  sections: Section[];
  selected: { sectionIndex?: number, subsectionIndex?: number, subSubsectionIndex?: number, type?: 'header' | 'footer' };
  onAddSection: () => void;
  onAddSubsection: (sectionIndex: number) => void;
  onAddSubSubsection: (sectionIndex: number, subsectionIndex: number) => void;
  onSelectSection: (sectionIndex: number | 'header' | 'footer', subsectionIndex?: number, subSubsectionIndex?: number) => void;
  onUpdateSectionTitle: (sectionIndex: number, newTitle: string) => void;
  onUpdateSubsectionTitle: (sectionIndex: number, subsectionIndex: number, newTitle: string) => void;
  onUpdateSubSubsectionTitle: (sectionIndex: number, subsectionIndex: number, subSubsectionIndex: number, newTitle: string) => void;
  onDeleteSection: (sectionIndex: number) => void;
  onDeleteSubsection: (sectionIndex: number, subsectionIndex: number) => void;
  onDeleteSubSubsection: (sectionIndex: number, subsectionIndex: number, subSubsectionIndex: number) => void;
  isViewMode?: boolean; // New prop to disable editing
}

const SideBar: React.FC<SidebarProps> = ({
  sections,
  selected,
  onAddSection,
  onAddSubsection,
  onAddSubSubsection,
  onSelectSection,
  onUpdateSectionTitle,
  onUpdateSubsectionTitle,
  onUpdateSubSubsectionTitle,
  onDeleteSection,
  onDeleteSubsection,
  onDeleteSubSubsection,
  isViewMode,
}) => {
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [editingSubsectionIndex, setEditingSubsectionIndex] = useState<{ section: number; subsection: number } | null>(null);
  const [editingSubSubsectionIndex, setEditingSubSubsectionIndex] = useState<{ section: number; subsection: number; subSubsection: number } | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');

  const [openSections, setOpenSections] = useState<boolean[]>(sections.map(() => true));
  const [openSubsections, setOpenSubsections] = useState<{ [key: number]: boolean[] }>(
    sections.reduce((acc, section, index) => {
      acc[index] = section.subsections.map(() => true);
      return acc;
    }, {} as { [key: number]: boolean[] })
  );  

  useEffect(() => {
    // Ensure openSections state is in sync with the sections prop
    setOpenSections(sections.map(() => true));
  }, [sections]);

  useEffect(() => {
    // Ensure openSubsections state is in sync with the sections prop
    const newOpenSubsections = sections.reduce((acc, section, index) => {
      acc[index] = section.subsections.map(() => true);
      return acc;
    }, {} as { [key: number]: boolean[] });
    setOpenSubsections(newOpenSubsections);
  }, [sections]);

  const handleToggleSection = (index: number) => {
    const newOpenSections = [...openSections];
    newOpenSections[index] = !newOpenSections[index];
    setOpenSections(newOpenSections);
  };
  
  const handleToggleSubsection = (sectionIndex: number, subsectionIndex: number) => {
    const newOpenSubsections = { ...openSubsections };
    newOpenSubsections[sectionIndex][subsectionIndex] = !newOpenSubsections[sectionIndex][subsectionIndex];
    setOpenSubsections(newOpenSubsections);
  };

  const handleEditSection = (index: number, currentTitle: string) => {
    if (editingSectionIndex !== null) {
      onUpdateSectionTitle(editingSectionIndex, newTitle);
    } else if (editingSubsectionIndex) {
      onUpdateSubsectionTitle(editingSubsectionIndex.section, editingSubsectionIndex.subsection, newTitle);
    } else if (editingSubSubsectionIndex) {
      onUpdateSubSubsectionTitle(editingSubSubsectionIndex.section, editingSubSubsectionIndex.subsection, editingSubSubsectionIndex.subSubsection, newTitle);
    }

    setEditingSectionIndex(index);
    setEditingSubsectionIndex(null);
    setEditingSubSubsectionIndex(null);
    setNewTitle(currentTitle);
  };

  const handleSaveSection = (index: number) => {
    onUpdateSectionTitle(index, newTitle);
    setEditingSectionIndex(null);
    setNewTitle('');
  };

  const handleEditSubsection = (sectionIndex: number, subsectionIndex: number, currentTitle: string) => {
    if (editingSectionIndex !== null) {
      onUpdateSectionTitle(editingSectionIndex, newTitle);
    } else if (editingSubsectionIndex) {
      onUpdateSubsectionTitle(editingSubsectionIndex.section, editingSubsectionIndex.subsection, newTitle);
    } else if (editingSubSubsectionIndex) {
      onUpdateSubSubsectionTitle(editingSubSubsectionIndex.section, editingSubSubsectionIndex.subsection, editingSubSubsectionIndex.subSubsection, newTitle);
    }

    setEditingSectionIndex(null);
    setEditingSubsectionIndex({ section: sectionIndex, subsection: subsectionIndex });
    setEditingSubSubsectionIndex(null);
    setNewTitle(currentTitle);
  };

  const handleSaveSubsection = (sectionIndex: number, subsectionIndex: number) => {
    onUpdateSubsectionTitle(sectionIndex, subsectionIndex, newTitle);
    setEditingSubsectionIndex(null);
    setNewTitle('');
  };

  const handleEditSubSubsection = (sectionIndex: number, subsectionIndex: number, subSubsectionIndex: number, currentTitle: string) => {
    if (editingSectionIndex !== null) {
      onUpdateSectionTitle(editingSectionIndex, newTitle);
    } else if (editingSubsectionIndex) {
      onUpdateSubsectionTitle(editingSubsectionIndex.section, editingSubsectionIndex.subsection, newTitle);
    } else if (editingSubSubsectionIndex) {
      onUpdateSubSubsectionTitle(editingSubSubsectionIndex.section, editingSubSubsectionIndex.subsection, editingSubSubsectionIndex.subSubsection, newTitle);
    }

    setEditingSectionIndex(null);
    setEditingSubsectionIndex(null);
    setEditingSubSubsectionIndex({ section: sectionIndex, subsection: subsectionIndex, subSubsection: subSubsectionIndex });
    setNewTitle(currentTitle);
  };

  const handleSaveSubSubsection = (sectionIndex: number, subsectionIndex: number, subSubsectionIndex: number) => {
    onUpdateSubSubsectionTitle(sectionIndex, subsectionIndex, subSubsectionIndex, newTitle);
    setEditingSubSubsectionIndex(null);
    setNewTitle('');
  };

  return (
    <Box sx={{ width: '450px', borderRight: '1px solid #ddd', padding: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Outline
      </Typography>
      {!isViewMode && (
        <Button variant="contained" color="primary" onClick={onAddSection} sx={{ mb: 2 }}>
          + Add Section
        </Button>
      )}
      <List>
        <ListItem 
          component="div"
          onClick={() => onSelectSection('header')}
          sx={{ 
            backgroundColor: selected.type === 'header' ? 'lightgray' : 'transparent',
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          <ListItemText primary="Header" />
        </ListItem>
        {sections.map((section, sectionIndex) => (
          <Box key={section.id}>
            <ListItem 
              component="div"
              onClick={() => onSelectSection(sectionIndex)}
              sx={{ 
                backgroundColor: selected.sectionIndex === sectionIndex && selected.subsectionIndex === undefined ? 'lightgray' : 'transparent',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
              }}
            >
              {editingSectionIndex === sectionIndex ? (
                <>
                  <TextField
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    size="small"
                    sx={{ mr: 1 }}
                    disabled={isViewMode}
                  />
                  {!isViewMode && (
                    <IconButton onClick={() => handleSaveSection(sectionIndex)} size="small">
                      <SaveIcon />
                    </IconButton>
                  )}
                </>
              ) : (
                <>
                  <ListItemText primary={section.title} />
                  {!isViewMode && (
                    <>
                      <IconButton onClick={() => handleEditSection(sectionIndex, section.title)} size="small">
                        <EditIcon />
                      </IconButton>
                      <DeleteSectionSubsection // Add delete button for section
                        onDelete={() => onDeleteSection(sectionIndex)}
                        itemType="section"
                      />
                    </>
                  )}
                </>
              )}
              {section.subsections.length > 0 && (
                <IconButton 
                  onClick={() => handleToggleSection(sectionIndex)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                    '&:active': {
                      backgroundColor: 'transparent',
                    },
                    width: '24px', 
                    height: '24px',
                  }}
                >
                  {openSections[sectionIndex] ? <ExpandLessIcon sx={{ fontSize: '20px' }} /> : <ExpandMoreIcon sx={{ fontSize: '20px' }} />}
                </IconButton>
              )}
              {!isViewMode && (
                <Button variant="text" onClick={() => onAddSubsection(sectionIndex)} size="small">
                  + Add Subsection
                </Button>
              )}
            </ListItem>
            {openSections[sectionIndex] && (
              <List sx={{ pl: 4 }}>
                {section.subsections.map((subsection, subsectionIndex) => (
                  <Box key={subsection.id}>
                                      <ListItem 
                    component="div"
                    onClick={() => onSelectSection(sectionIndex, subsectionIndex)}
                    sx={{ 
                      backgroundColor: selected.sectionIndex === sectionIndex && selected.subsectionIndex === subsectionIndex && selected.subSubsectionIndex === undefined ? 'lightgray' : 'transparent',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                      {editingSubsectionIndex &&
                        editingSubsectionIndex.section === sectionIndex &&
                        editingSubsectionIndex.subsection === subsectionIndex ? (
                        <>
                          <TextField
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            size="small"
                            sx={{ mr: 1 }}
                            disabled={isViewMode}
                          />
                          {!isViewMode && (
                            <IconButton onClick={() => handleSaveSubsection(sectionIndex, subsectionIndex)} size="small">
                              <SaveIcon />
                            </IconButton>
                          )}
                        </>
                      ) : (
                        <>
                          <ListItemText primary={subsection.title} />
                          {!isViewMode && (
                            <>
                              <IconButton onClick={() => handleEditSubsection(sectionIndex, subsectionIndex, subsection.title)} size="small">
                                <EditIcon />
                              </IconButton>
                              <DeleteSectionSubsection // Add delete button for subsection
                                onDelete={() => onDeleteSubsection(sectionIndex, subsectionIndex)}
                                itemType="subsection"
                              />
                            </>
                          )}
                        </>
                      )}
                      {subsection.subSubsections.length > 0 && (
                        <IconButton 
                          onClick={() => handleToggleSubsection(sectionIndex, subsectionIndex)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'transparent',
                            },
                            '&:active': {
                              backgroundColor: 'transparent',
                            },
                            width: '24px', 
                            height: '24px',
                          }}
                        >
                          {openSubsections[sectionIndex][subsectionIndex] ? <ExpandLessIcon sx={{ fontSize: '20px' }} /> : <ExpandMoreIcon sx={{ fontSize: '20px' }} />}
                        </IconButton>
                      )}
                      {!isViewMode && (
                        <Button variant="text" onClick={() => onAddSubSubsection(sectionIndex, subsectionIndex)} size="small">
                          + Add Sub-Subsection
                        </Button>
                      )}
                    </ListItem>
                    {openSubsections[sectionIndex][subsectionIndex] && (
                      <List sx={{ pl: 4 }}>
                        {subsection.subSubsections.map((subSubsection, subSubsectionIndex) => (
                          <ListItem 
                            key={subSubsection.id} 
                            component="div"
                            onClick={() => onSelectSection(sectionIndex, subsectionIndex, subSubsectionIndex)}
                            sx={{ 
                              backgroundColor: selected.sectionIndex === sectionIndex && selected.subsectionIndex === subsectionIndex && selected.subSubsectionIndex === subSubsectionIndex ? 'lightgray' : 'transparent',
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                            }}
                          >
                            {editingSubSubsectionIndex &&
                              editingSubSubsectionIndex.section === sectionIndex &&
                              editingSubSubsectionIndex.subsection === subsectionIndex &&
                              editingSubSubsectionIndex.subSubsection === subSubsectionIndex ? (
                              <>
                                <TextField
                                  value={newTitle}
                                  onChange={(e) => setNewTitle(e.target.value)}
                                  size="small"
                                  sx={{ mr: 1 }}
                                  disabled={isViewMode}
                                />
                                {!isViewMode && (
                                  <IconButton onClick={() => handleSaveSubSubsection(sectionIndex, subsectionIndex, subSubsectionIndex)} size="small">
                                    <SaveIcon />
                                  </IconButton>
                                )}
                              </>
                            ) : (
                              <>
                                <ListItemText primary={subSubsection.title} />
                                {!isViewMode && (
                                  <>
                                    <IconButton onClick={() => handleEditSubSubsection(sectionIndex, subsectionIndex, subSubsectionIndex, subSubsection.title)} size="small">
                                      <EditIcon />
                                    </IconButton>
                                    <DeleteSectionSubsection // Add delete button for sub-subsection
                                      onDelete={() => onDeleteSubSubsection(sectionIndex, subsectionIndex, subSubsectionIndex)}
                                      itemType="subSubsection"
                                    />
                                  </>
                                )}
                              </>
                            )}
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                ))}
              </List>
            )}
          </Box>
        ))}
        <ListItem 
          component="div"
          onClick={() => onSelectSection('footer')}
          sx={{ 
            backgroundColor: selected.type === 'footer' ? 'lightgray' : 'transparent',
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          <ListItemText primary="Footer" />
        </ListItem>
      </List>
    </Box>
  );
};

export default SideBar;