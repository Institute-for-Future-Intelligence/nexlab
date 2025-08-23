// src/components/Supplemental/MaterialImport/MaterialPreview.tsx

import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Tabs,
  Tab,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Visibility as PreviewIcon,
  Code as RawIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Source as SourceIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material';
import { Material } from '../../../types/Material';

interface MaterialPreviewProps {
  extractedText: string | null;
  convertedMaterial: Omit<Material, 'id' | 'timestamp'> | null;
  onMaterialReady?: (materialData: any) => void;
  onCancel?: () => void;
}

const MaterialPreview: React.FC<MaterialPreviewProps> = ({
  extractedText,
  convertedMaterial,
  onMaterialReady,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleSaveMaterial = () => {
    if (convertedMaterial && onMaterialReady) {
      onMaterialReady(convertedMaterial);
    }
  };

  const renderRawText = () => (
    <Paper variant="outlined" sx={{ p: 2, maxHeight: 600, overflow: 'auto' }}>
      <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
        {extractedText}
      </Typography>
    </Paper>
  );

  const renderStructuredPreview = () => {
    if (!convertedMaterial) {
      return (
        <Alert severity="info">
          <Typography>
            Upload a file and process it with AI to see the structured preview.
          </Typography>
        </Alert>
      );
    }

    return (
      <Box>
        {/* Material Header */}
        <Paper elevation={1} sx={{ p: 3, mb: 2, bgcolor: 'primary.50' }}>
          <Typography variant="h4" gutterBottom color="primary">
            {convertedMaterial.title}
          </Typography>
          
          {/* Header Content */}
          {convertedMaterial.header?.content && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {convertedMaterial.header.title}
              </Typography>
              <Typography 
                variant="body1" 
                dangerouslySetInnerHTML={{ __html: convertedMaterial.header.content }}
                sx={{ '& > *': { mb: 1 } }}
              />
            </Box>
          )}

          {/* Source Info */}
          {(convertedMaterial as any).sourceInfo && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              <Chip 
                icon={<SourceIcon />}
                label={`Source: ${(convertedMaterial as any).sourceInfo.fileName}`}
                size="small"
                variant="outlined"
              />
              <Chip 
                icon={<AIIcon />}
                label={`Processed: ${new Date((convertedMaterial as any).sourceInfo.extractedAt).toLocaleString()}`}
                size="small"
                variant="outlined"
                color="secondary"
              />
            </Box>
          )}
        </Paper>

        {/* Sections */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {convertedMaterial.sections.map((section, index) => (
            <Accordion 
              key={section.id}
              expanded={expandedSections[section.id] !== false}
              onChange={() => handleSectionToggle(section.id)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {index + 1}. {section.title}
                  </Typography>
                  {section.subsections.length > 0 && (
                    <Chip 
                      label={`${section.subsections.length} subsections`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {/* Section Content */}
                {section.content && (
                  <Typography 
                    variant="body1" 
                    dangerouslySetInnerHTML={{ __html: section.content }}
                    sx={{ mb: 2, '& > *': { mb: 1 } }}
                  />
                )}

                {/* Section Images */}
                {section.images && section.images.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      📸 Images Referenced:
                    </Typography>
                    {section.images.map((image, imgIndex) => (
                      <Chip 
                        key={imgIndex}
                        label={image.title}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}

                {/* Section Links */}
                {section.links && section.links.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      🔗 Links Referenced:
                    </Typography>
                    {section.links.map((link, linkIndex) => (
                      <Box key={linkIndex} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{link.title}:</strong> {link.description}
                          {link.url && (
                            <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
                              ({link.url})
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Subsections */}
                {section.subsections.map((subsection, subIndex) => (
                  <Box key={subsection.id} sx={{ ml: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {index + 1}.{subIndex + 1} {subsection.title}
                    </Typography>
                    {subsection.content && (
                      <Typography 
                        variant="body2" 
                        dangerouslySetInnerHTML={{ __html: subsection.content }}
                        sx={{ mb: 1, '& > *': { mb: 1 } }}
                      />
                    )}

                    {/* Sub-subsections */}
                    {subsection.subSubsections.map((subSub, subSubIndex) => (
                      <Box key={subSub.id} sx={{ ml: 2, mb: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {index + 1}.{subIndex + 1}.{subSubIndex + 1} {subSub.title}
                        </Typography>
                        {subSub.content && (
                          <Typography 
                            variant="body2" 
                            dangerouslySetInnerHTML={{ __html: subSub.content }}
                            sx={{ '& > *': { mb: 1 } }}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Footer */}
        {convertedMaterial.footer?.content && (
          <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              {convertedMaterial.footer.title}
            </Typography>
            <Typography 
              variant="body2" 
              dangerouslySetInnerHTML={{ __html: convertedMaterial.footer.content }}
              sx={{ '& > *': { mb: 1 } }}
            />
          </Paper>
        )}
      </Box>
    );
  };

  return (
    <Paper elevation={2} sx={{ height: 'fit-content' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          📋 Material Preview
        </Typography>
        
        {/* Tabs */}
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            icon={<RawIcon />} 
            label="Raw Text" 
            disabled={!extractedText}
          />
          <Tab 
            icon={<PreviewIcon />} 
            label="Structured Preview" 
            disabled={!convertedMaterial}
          />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, maxHeight: 800, overflow: 'auto' }}>
        {activeTab === 0 && renderRawText()}
        {activeTab === 1 && renderStructuredPreview()}
      </Box>

      {/* Actions */}
      {convertedMaterial && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveMaterial}
            startIcon={<SaveIcon />}
            color="success"
          >
            Save Material
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default MaterialPreview;
