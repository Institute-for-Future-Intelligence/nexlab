// src/components/Supplemental/SideBarModern.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Collapse,
  Divider,
  Chip,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  MenuBook as SectionIcon,
  List as SubsectionIcon,
  Description as SubSubsectionIcon,
} from '@mui/icons-material';
import { designSystemTheme, sidebarStyles, borderRadius } from '../../config/designSystem';
import DeleteSectionSubsection from './DeleteSectionSubsection';

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

interface SideBarModernProps {
  sections: Section[];
  selected: { 
    sectionIndex?: number; 
    subsectionIndex?: number; 
    subSubsectionIndex?: number; 
    type?: 'header' | 'footer' 
  };
  onAddSection: () => void;
  onAddSubsection: (sectionIndex: number) => void;
  onAddSubSubsection: (sectionIndex: number, subsectionIndex: number) => void;
  onSelectSection: (
    sectionIndex: number | 'header' | 'footer', 
    subsectionIndex?: number, 
    subSubsectionIndex?: number
  ) => void;
  onUpdateSectionTitle: (sectionIndex: number, newTitle: string) => void;
  onUpdateSubsectionTitle: (sectionIndex: number, subsectionIndex: number, newTitle: string) => void;
  onUpdateSubSubsectionTitle: (
    sectionIndex: number, 
    subsectionIndex: number, 
    subSubsectionIndex: number, 
    newTitle: string
  ) => void;
  onDeleteSection: (sectionIndex: number) => void;
  onDeleteSubsection: (sectionIndex: number, subsectionIndex: number) => void;
  onDeleteSubSubsection: (
    sectionIndex: number, 
    subsectionIndex: number, 
    subSubsectionIndex: number
  ) => void;
  isViewMode?: boolean;
}

const SideBarModern: React.FC<SideBarModernProps> = ({
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
  isViewMode = false,
}) => {
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [editingSubsectionIndex, setEditingSubsectionIndex] = useState<{ section: number; subsection: number } | null>(null);
  const [editingSubSubsectionIndex, setEditingSubSubsectionIndex] = useState<{ 
    section: number; 
    subsection: number; 
    subSubsection: number 
  } | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [openSections, setOpenSections] = useState<boolean[]>(sections.map(() => true));
  const [openSubsections, setOpenSubsections] = useState<{ [key: number]: boolean[] }>(
    sections.reduce((acc, section, index) => {
      acc[index] = section.subsections.map(() => true);
      return acc;
    }, {} as { [key: number]: boolean[] })
  );

  // Sync state with sections prop
  useEffect(() => {
    setOpenSections(sections.map(() => true));
  }, [sections]);

  useEffect(() => {
    const newOpenSubsections = sections.reduce((acc, section, index) => {
      acc[index] = section.subsections.map(() => true);
      return acc;
    }, {} as { [key: number]: boolean[] });
    setOpenSubsections(newOpenSubsections);
  }, [sections]);

  // Toggle functions
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

  // Edit functions
  const handleEditSection = (index: number, currentTitle: string) => {
    if (editingSectionIndex !== null) {
      onUpdateSectionTitle(editingSectionIndex, newTitle);
    } else if (editingSubsectionIndex) {
      onUpdateSubsectionTitle(editingSubsectionIndex.section, editingSubsectionIndex.subsection, newTitle);
    } else if (editingSubSubsectionIndex) {
      onUpdateSubSubsectionTitle(
        editingSubSubsectionIndex.section, 
        editingSubSubsectionIndex.subsection, 
        editingSubSubsectionIndex.subSubsection, 
        newTitle
      );
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
      onUpdateSubSubsectionTitle(
        editingSubSubsectionIndex.section, 
        editingSubSubsectionIndex.subsection, 
        editingSubSubsectionIndex.subSubsection, 
        newTitle
      );
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

  const handleEditSubSubsection = (
    sectionIndex: number, 
    subsectionIndex: number, 
    subSubsectionIndex: number, 
    currentTitle: string
  ) => {
    if (editingSectionIndex !== null) {
      onUpdateSectionTitle(editingSectionIndex, newTitle);
    } else if (editingSubsectionIndex) {
      onUpdateSubsectionTitle(editingSubsectionIndex.section, editingSubsectionIndex.subsection, newTitle);
    } else if (editingSubSubsectionIndex) {
      onUpdateSubSubsectionTitle(
        editingSubSubsectionIndex.section, 
        editingSubSubsectionIndex.subsection, 
        editingSubSubsectionIndex.subSubsection, 
        newTitle
      );
    }

    setEditingSectionIndex(null);
    setEditingSubsectionIndex(null);
    setEditingSubSubsectionIndex({ 
      section: sectionIndex, 
      subsection: subsectionIndex, 
      subSubsection: subSubsectionIndex 
    });
    setNewTitle(currentTitle);
  };

  const handleSaveSubSubsection = (
    sectionIndex: number, 
    subsectionIndex: number, 
    subSubsectionIndex: number
  ) => {
    onUpdateSubSubsectionTitle(sectionIndex, subsectionIndex, subSubsectionIndex, newTitle);
    setEditingSubSubsectionIndex(null);
    setNewTitle('');
  };

  // Check if item is selected
  const isSelected = (
    sectionIndex?: number, 
    subsectionIndex?: number, 
    subSubsectionIndex?: number, 
    type?: 'header' | 'footer'
  ) => {
    return selected.sectionIndex === sectionIndex && 
           selected.subsectionIndex === subsectionIndex && 
           selected.subSubsectionIndex === subSubsectionIndex && 
           selected.type === type;
  };

  // Fallback styles in case design system is not available
  const fallbackStyles = {
    width: '320px',
    minWidth: '320px',
    maxWidth: '320px',
    backgroundColor: '#F8FAFC',
    borderRight: '1px solid #E2E8F0',
  };

  const styles = sidebarStyles || fallbackStyles;

  return (
    <Box
      sx={{
        width: styles.width,
        minWidth: styles.minWidth,
        maxWidth: styles.maxWidth,
        backgroundColor: styles.backgroundColor,
        borderRight: styles.borderRight,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: designSystemTheme.typography.h6.fontFamily,
            fontWeight: designSystemTheme.typography.h6.fontWeight,
            color: designSystemTheme.palette.text.primary,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <SectionIcon sx={{ fontSize: 20 }} />
          Outline
        </Typography>
        
        {!isViewMode && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddSection}
            sx={{
              width: '100%',
              borderRadius: borderRadius.xl,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add Section
          </Button>
        )}
      </Box>

      <Divider />

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ p: 0 }}>
          {/* Header Item */}
          <ListItem
            onClick={() => onSelectSection('header')}
            sx={{
              cursor: 'pointer',
              backgroundColor: isSelected(undefined, undefined, undefined, 'header') 
                ? designSystemTheme.palette.primary.light 
                : 'transparent',
              borderLeft: isSelected(undefined, undefined, undefined, 'header') 
                ? `4px solid ${designSystemTheme.palette.primary.main}` 
                : '4px solid transparent',
              transition: designSystemTheme.transitions.create(['background-color', 'border-color']),
              '&:hover': {
                backgroundColor: designSystemTheme.palette.action.hover,
              },
            }}
          >
            <ListItemText
              primary="Header"
              sx={{
                '& .MuiListItemText-primary': {
                  fontFamily: designSystemTheme.typography.body1.fontFamily,
                  fontWeight: isSelected(undefined, undefined, undefined, 'header') ? 600 : 400,
                  color: isSelected(undefined, undefined, undefined, 'header') 
                    ? designSystemTheme.palette.primary.main 
                    : designSystemTheme.palette.text.primary,
                },
              }}
            />
          </ListItem>

          {/* Sections */}
          {sections.map((section, sectionIndex) => (
            <Box key={section.id}>
              <ListItem
                onClick={() => onSelectSection(sectionIndex)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: isSelected(sectionIndex) 
                    ? designSystemTheme.palette.primary.light 
                    : 'transparent',
                  borderLeft: isSelected(sectionIndex) 
                    ? `4px solid ${designSystemTheme.palette.primary.main}` 
                    : '4px solid transparent',
                  transition: designSystemTheme.transitions.create(['background-color', 'border-color']),
                  '&:hover': {
                    backgroundColor: designSystemTheme.palette.action.hover,
                  },
                }}
              >
                {editingSectionIndex === sectionIndex ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <TextField
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      size="small"
                      variant="outlined"
                      disabled={isViewMode}
                      sx={{ flex: 1 }}
                    />
                    {!isViewMode && (
                      <IconButton 
                        onClick={() => handleSaveSection(sectionIndex)} 
                        size="small"
                        color="primary"
                      >
                        <SaveIcon />
                      </IconButton>
                    )}
                  </Box>
                ) : (
                  <>
                    <ListItemText
                      primary={section.title}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontFamily: designSystemTheme.typography.body1.fontFamily,
                          fontWeight: isSelected(sectionIndex) ? 600 : 400,
                          color: isSelected(sectionIndex) 
                            ? designSystemTheme.palette.primary.main 
                            : designSystemTheme.palette.text.primary,
                        },
                      }}
                    />
                    
                    {!isViewMode && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title="Edit Section" arrow>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSection(sectionIndex, section.title);
                            }}
                            size="small"
                            sx={{ color: designSystemTheme.palette.primary.main }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <DeleteSectionSubsection
                          onDelete={() => onDeleteSection(sectionIndex)}
                          itemType="section"
                        />
                      </Box>
                    )}
                    
                    {section.subsections.length > 0 && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSection(sectionIndex);
                        }}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        {openSections[sectionIndex] ? 
                          <ExpandLessIcon fontSize="small" /> : 
                          <ExpandMoreIcon fontSize="small" />
                        }
                      </IconButton>
                    )}
                    
                    {!isViewMode && (
                      <Tooltip title="Add Subsection" arrow>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddSubsection(sectionIndex);
                          }}
                          size="small"
                          sx={{ color: designSystemTheme.palette.success.main }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                )}
              </ListItem>

              {/* Subsections */}
              <Collapse in={openSections[sectionIndex]} timeout="auto" unmountOnExit>
                <List sx={{ pl: 2 }}>
                  {section.subsections.map((subsection, subsectionIndex) => (
                    <Box key={subsection.id}>
                      <ListItem
                        onClick={() => onSelectSection(sectionIndex, subsectionIndex)}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: isSelected(sectionIndex, subsectionIndex) 
                            ? designSystemTheme.palette.primary.light 
                            : 'transparent',
                          borderLeft: isSelected(sectionIndex, subsectionIndex) 
                            ? `4px solid ${designSystemTheme.palette.primary.main}` 
                            : '4px solid transparent',
                          transition: designSystemTheme.transitions.create(['background-color', 'border-color']),
                          '&:hover': {
                            backgroundColor: designSystemTheme.palette.action.hover,
                          },
                        }}
                      >
                        {editingSubsectionIndex &&
                          editingSubsectionIndex.section === sectionIndex &&
                          editingSubsectionIndex.subsection === subsectionIndex ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <TextField
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              size="small"
                              variant="outlined"
                              disabled={isViewMode}
                              sx={{ flex: 1 }}
                            />
                            {!isViewMode && (
                              <IconButton 
                                onClick={() => handleSaveSubsection(sectionIndex, subsectionIndex)} 
                                size="small"
                                color="primary"
                              >
                                <SaveIcon />
                              </IconButton>
                            )}
                          </Box>
                        ) : (
                          <>
                            <ListItemText
                              primary={subsection.title}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontFamily: designSystemTheme.typography.body2.fontFamily,
                                  fontWeight: isSelected(sectionIndex, subsectionIndex) ? 600 : 400,
                                  color: isSelected(sectionIndex, subsectionIndex) 
                                    ? designSystemTheme.palette.primary.main 
                                    : designSystemTheme.palette.text.primary,
                                },
                              }}
                            />
                            
                            {!isViewMode && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Tooltip title="Edit Subsection" arrow>
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditSubsection(sectionIndex, subsectionIndex, subsection.title);
                                    }}
                                    size="small"
                                    sx={{ color: designSystemTheme.palette.primary.main }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                <DeleteSectionSubsection
                                  onDelete={() => onDeleteSubsection(sectionIndex, subsectionIndex)}
                                  itemType="subsection"
                                />
                              </Box>
                            )}
                            
                            {subsection.subSubsections.length > 0 && (
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSubsection(sectionIndex, subsectionIndex);
                                }}
                                size="small"
                                sx={{ ml: 1 }}
                              >
                                {openSubsections[sectionIndex][subsectionIndex] ? 
                                  <ExpandLessIcon fontSize="small" /> : 
                                  <ExpandMoreIcon fontSize="small" />
                                }
                              </IconButton>
                            )}
                            
                            {!isViewMode && (
                              <Tooltip title="Add Sub-subsection" arrow>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddSubSubsection(sectionIndex, subsectionIndex);
                                  }}
                                  size="small"
                                  sx={{ color: designSystemTheme.palette.success.main }}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </>
                        )}
                      </ListItem>

                      {/* Sub-subsections */}
                      <Collapse 
                        in={openSubsections[sectionIndex][subsectionIndex]} 
                        timeout="auto" 
                        unmountOnExit
                      >
                        <List sx={{ pl: 2 }}>
                          {subsection.subSubsections.map((subSubsection, subSubsectionIndex) => (
                            <ListItem
                              key={subSubsection.id}
                              onClick={() => onSelectSection(sectionIndex, subsectionIndex, subSubsectionIndex)}
                              sx={{
                                cursor: 'pointer',
                                backgroundColor: isSelected(sectionIndex, subsectionIndex, subSubsectionIndex) 
                                  ? designSystemTheme.palette.primary.light 
                                  : 'transparent',
                                borderLeft: isSelected(sectionIndex, subsectionIndex, subSubsectionIndex) 
                                  ? `4px solid ${designSystemTheme.palette.primary.main}` 
                                  : '4px solid transparent',
                                transition: designSystemTheme.transitions.create(['background-color', 'border-color']),
                                '&:hover': {
                                  backgroundColor: designSystemTheme.palette.action.hover,
                                },
                              }}
                            >
                              {editingSubSubsectionIndex &&
                                editingSubSubsectionIndex.section === sectionIndex &&
                                editingSubSubsectionIndex.subsection === subsectionIndex &&
                                editingSubSubsectionIndex.subSubsection === subSubsectionIndex ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                  <TextField
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    size="small"
                                    variant="outlined"
                                    disabled={isViewMode}
                                    sx={{ flex: 1 }}
                                  />
                                  {!isViewMode && (
                                    <IconButton 
                                      onClick={() => handleSaveSubSubsection(sectionIndex, subsectionIndex, subSubsectionIndex)} 
                                      size="small"
                                      color="primary"
                                    >
                                      <SaveIcon />
                                    </IconButton>
                                  )}
                                </Box>
                              ) : (
                                <>
                                  <ListItemText
                                    primary={subSubsection.title}
                                    sx={{
                                      '& .MuiListItemText-primary': {
                                        fontFamily: designSystemTheme.typography.body2.fontFamily,
                                        fontWeight: isSelected(sectionIndex, subsectionIndex, subSubsectionIndex) ? 600 : 400,
                                        color: isSelected(sectionIndex, subsectionIndex, subSubsectionIndex) 
                                          ? designSystemTheme.palette.primary.main 
                                          : designSystemTheme.palette.text.secondary,
                                        fontSize: '0.875rem',
                                      },
                                    }}
                                  />
                                  
                                  {!isViewMode && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Tooltip title="Edit Sub-subsection" arrow>
                                        <IconButton
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditSubSubsection(sectionIndex, subsectionIndex, subSubsectionIndex, subSubsection.title);
                                          }}
                                          size="small"
                                          sx={{ color: designSystemTheme.palette.primary.main }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      
                                      <DeleteSectionSubsection
                                        onDelete={() => onDeleteSubSubsection(sectionIndex, subsectionIndex, subSubsectionIndex)}
                                        itemType="subSubsection"
                                      />
                                    </Box>
                                  )}
                                </>
                              )}
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </Box>
                  ))}
                </List>
              </Collapse>
            </Box>
          ))}

          {/* Footer Item */}
          <ListItem
            onClick={() => onSelectSection('footer')}
            sx={{
              cursor: 'pointer',
              backgroundColor: isSelected(undefined, undefined, undefined, 'footer') 
                ? designSystemTheme.palette.primary.light 
                : 'transparent',
              borderLeft: isSelected(undefined, undefined, undefined, 'footer') 
                ? `4px solid ${designSystemTheme.palette.primary.main}` 
                : '4px solid transparent',
              transition: designSystemTheme.transitions.create(['background-color', 'border-color']),
              '&:hover': {
                backgroundColor: designSystemTheme.palette.action.hover,
              },
            }}
          >
            <ListItemText
              primary="Footer"
              sx={{
                '& .MuiListItemText-primary': {
                  fontFamily: designSystemTheme.typography.body1.fontFamily,
                  fontWeight: isSelected(undefined, undefined, undefined, 'footer') ? 600 : 400,
                  color: isSelected(undefined, undefined, undefined, 'footer') 
                    ? designSystemTheme.palette.primary.main 
                    : designSystemTheme.palette.text.primary,
                },
              }}
            />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default SideBarModern;
