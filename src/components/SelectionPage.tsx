// src/components/SelectionPage.tsx
import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  AccountCircle as AccountIcon,
  Science as LabIcon,
  School as MaterialsIcon,
  Message as MessageIcon,
  PlayArrow as QuickStartIcon,
  VideoLibrary as TutorialIcon
} from '@mui/icons-material';

import { useUser } from '../hooks/useUser';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../config/designSystem';
import { PageHeader } from './common';

const SelectionPage: React.FC = () => {
  const { userDetails } = useUser();
  const navigate = useNavigate();

  const isLabNotebookDisabled = userDetails && !userDetails.isAdmin && 
    (!userDetails.classes || Object.keys(userDetails.classes).length === 0);

  const firstRowActions = [
    {
      title: 'My Account',
      description: 'Manage your profile and account settings',
      icon: <AccountIcon sx={{ fontSize: 40 }} />,
      path: '/my-profile',
      color: colors.primary[500],
      disabled: false,
      external: false
    },
    {
      title: 'Messages',
      description: 'View and manage course messages',
      icon: <MessageIcon sx={{ fontSize: 40 }} />,
      path: '/messages',
      color: colors.secondary[500],
      disabled: false,
      external: false
    }
  ];

  const secondRowActions = [
    {
      title: 'Course Materials',
      description: 'View and manage course materials',
      icon: <MaterialsIcon sx={{ fontSize: 40 }} />,
      path: '/supplemental-materials',
      color: colors.error,
      disabled: false,
      external: false
    },
    {
      title: 'Laboratory Notebook',
      description: 'Access your lab experiments and designs',
      icon: <LabIcon sx={{ fontSize: 40 }} />,
      path: '/laboratory-notebooks',
      color: colors.success,
      disabled: isLabNotebookDisabled,
      external: false
    }
  ];

  return (
    <Box className="profile-container">
      <PageHeader title="Welcome!" />
      
      {/* Getting Started Section */}
      <Box sx={{ 
        mb: spacing[6], 
        p: spacing[4], 
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: shadows.sm,
        position: 'relative',
        mt: spacing[8], // Increased space between header and getting started section
      }}>
        {/* File folder tab */}
        <Box sx={{
          position: 'absolute',
          top: '-25px',
          left: '40px',
          backgroundColor: colors.warning,
          borderRadius: `${borderRadius.lg} ${borderRadius.lg} 0 0`,
          px: spacing[3],
          py: spacing[1],
          zIndex: 1,
        }}>
          <Typography sx={{
            color: colors.text.inverse,
            fontFamily: typography.fontFamily.display,
            fontSize: '2rem',
            fontWeight: typography.fontWeight.bold,
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}>
            Getting Started
          </Typography>
        </Box>
        
        <Grid container spacing={spacing[4]} sx={{ mt: spacing[3], mb: spacing[4] }}>
          {/* What is NexLAB? (25%) */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              height: '100%',
              p: spacing[3],
              backgroundColor: colors.background.primary,
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.neutral[200]}`,
              boxShadow: shadows.sm,
            }}>
              <Typography 
                variant="h6" 
                component="h3"
                sx={{
                  fontFamily: typography.fontFamily.display,
                  fontSize: '2rem',
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  mb: spacing[3],
                  textAlign: 'left',
                }}
              >
                What is NexLAB?
              </Typography>
              
              <Typography 
                variant="body1" 
                paragraph 
                sx={{
                  fontFamily: typography.fontFamily.secondary,
                  fontSize: typography.fontSize.lg,
                  color: colors.text.secondary,
                  lineHeight: 1.6,
                  textAlign: 'left',
                }}
              >
                NexLAB enhances the Antibody Engineering curriculum with an adaptive content management platform designed for educators, students, and researchers.
              </Typography>
            </Box>
          </Grid>

          {/* Key Features (25%) */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              height: '100%',
              p: spacing[3],
              backgroundColor: colors.background.primary,
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.neutral[200]}`,
              boxShadow: shadows.sm,
            }}>
              <Typography 
                variant="h6" 
                component="h3"
                sx={{
                  fontFamily: typography.fontFamily.display,
                  fontSize: '2rem',
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  mb: spacing[3],
                  textAlign: 'left',
                }}
              >
                Key Features:
              </Typography>

              <Box component="ul" sx={{ 
                pl: spacing[3], 
                '& li': {
                  fontFamily: typography.fontFamily.secondary,
                  fontSize: typography.fontSize.lg,
                  color: colors.text.secondary,
                  lineHeight: 1.5,
                  mb: spacing[1],
                }
              }}>
                <li>Electronic Laboratory Notebook using the Design-Build-Test framework</li>
                <li>Platform for creating and sharing learning materials</li>
                <li>Student progress tracking and class content efficacy analysis</li>
                <li>Quiz AI & Chatbot Tools to support interactive learning</li>
              </Box>
            </Box>
          </Grid>

          {/* Quick-Start Guide (25%) */}
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                backgroundColor: colors.background.primary,
                borderRadius: borderRadius.xl,
                border: `1px solid ${colors.neutral[200]}`,
                boxShadow: shadows.sm,
                transition: animations.transitions.normal,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: shadows.xl,
                  border: `1px solid ${colors.warning}`,
                }
              }}
              onClick={() => window.open('http://localhost:3002/view-material/xsA42JCvfCUtmyoyx45s?material=xsA42JCvfCUtmyoyx45s', '_blank')}
            >
              <CardContent sx={{ 
                textAlign: 'center', 
                p: spacing[4],
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <Box sx={{ 
                  color: colors.warning, 
                  mb: spacing[3],
                  display: 'flex',
                  justifyContent: 'center',
                }}>
                  <QuickStartIcon sx={{ fontSize: 40 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: typography.fontWeight.bold,
                      fontFamily: typography.fontFamily.display,
                      fontSize: '2rem',
                      color: colors.text.primary,
                      mb: spacing[2],
                    }}
                  >
                    Quick-Start Guide
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: colors.text.secondary,
                      fontFamily: typography.fontFamily.secondary,
                      fontSize: typography.fontSize.lg,
                      lineHeight: 1.5,
                    }}
                  >
                    Get started with public course materials and learn the basics
                  </Typography>
                </Box>
              </CardContent>
            </Card>
        </Grid>

          {/* Tutorial (25%) */}
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                backgroundColor: colors.background.primary,
                borderRadius: borderRadius.xl,
                border: `1px solid ${colors.neutral[200]}`,
                boxShadow: shadows.sm,
                transition: animations.transitions.normal,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: shadows.xl,
                  border: `1px solid ${colors.primary[500]}`,
                }
              }}
              onClick={() => window.open('https://www.loom.com/share/f3ca701c66d34f84a13eb7ec12b0c6ec', '_blank')}
            >
              <CardContent sx={{ 
                textAlign: 'center', 
                p: spacing[4],
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <Box sx={{ 
                  color: colors.primary[500], 
                  mb: spacing[3],
                  display: 'flex',
                  justifyContent: 'center',
                }}>
                  <TutorialIcon sx={{ fontSize: 40 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: typography.fontWeight.bold,
                      fontFamily: typography.fontFamily.display,
                      fontSize: '2rem',
                      color: colors.text.primary,
                      mb: spacing[2],
                    }}
                  >
                    Tutorial
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: colors.text.secondary,
                      fontFamily: typography.fontFamily.secondary,
                      fontSize: typography.fontSize.lg,
                      lineHeight: 1.5,
                    }}
                  >
                    Watch our introduction video to learn how to use NexLAB
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Quick Actions Section */}
      <Box sx={{ 
        mb: spacing[6], 
        p: spacing[4], 
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: shadows.sm,
        position: 'relative',
        mt: spacing[8], // Increased space between getting started and quick actions sections
      }}>
        {/* File folder tab */}
        <Box sx={{
          position: 'absolute',
          top: '-25px',
          left: '40px',
          backgroundColor: colors.primary[500],
          borderRadius: `${borderRadius.lg} ${borderRadius.lg} 0 0`,
          px: spacing[3],
          py: spacing[1],
          zIndex: 1,
        }}>
          <Typography sx={{
            color: colors.text.inverse,
            fontFamily: typography.fontFamily.display,
            fontSize: '2rem',
            fontWeight: typography.fontWeight.bold,
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}>
            Quick Actions
          </Typography>
        </Box>

        {/* First Row: My Account and Messages */}
        <Grid container spacing={spacing[4]} sx={{ mb: spacing[4], mt: spacing[3] }}>
          {firstRowActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: action.disabled ? 'not-allowed' : 'pointer',
                  opacity: action.disabled ? 0.6 : 1,
                  backgroundColor: colors.background.primary,
                  borderRadius: borderRadius.xl,
                  border: `1px solid ${colors.neutral[200]}`,
                  boxShadow: shadows.sm,
                  transition: animations.transitions.normal,
                  '&:hover': action.disabled ? {} : {
                    transform: 'translateY(-8px)',
                    boxShadow: shadows.xl,
                    border: `1px solid ${action.color}`,
                  }
                }}
                onClick={() => {
                  if (!action.disabled) {
                    if (action.external) {
                      window.open(action.path, '_blank');
                    } else {
                      navigate(action.path);
                    }
                  }
                }}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  p: spacing[4],
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <Box sx={{ 
                    color: action.color, 
                    mb: spacing[3],
                    display: 'flex',
                    justifyContent: 'center',
                  }}>
                    {action.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="h6" 
                              component="h3" 
                              gutterBottom 
                              sx={{ 
                                fontWeight: typography.fontWeight.bold,
                                fontFamily: typography.fontFamily.display,
                                fontSize: '2rem',
                                color: colors.text.primary,
                                mb: spacing[2],
                              }}
                            >
                              {action.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: colors.text.secondary,
                                fontFamily: typography.fontFamily.secondary,
                                fontSize: typography.fontSize.lg,
                                lineHeight: 1.5,
                              }}
                            >
                              {action.description}
                            </Typography>
                    {action.disabled && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          mt: spacing[2], 
                          display: 'block',
                          color: colors.error,
                          fontFamily: typography.fontFamily.secondary,
                        }}
                      >
                        Enroll in a course to access this feature
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
      
        {/* Second Row: Course Materials and Laboratory Notebook */}
        <Grid container spacing={spacing[4]}>
          {secondRowActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: action.disabled ? 'not-allowed' : 'pointer',
                  opacity: action.disabled ? 0.6 : 1,
                  backgroundColor: colors.background.primary,
                  borderRadius: borderRadius.xl,
                  border: `1px solid ${colors.neutral[200]}`,
                  boxShadow: shadows.sm,
                  transition: animations.transitions.normal,
                  '&:hover': action.disabled ? {} : {
                    transform: 'translateY(-8px)',
                    boxShadow: shadows.xl,
                    border: `1px solid ${action.color}`,
                  }
                }}
                onClick={() => {
                  if (!action.disabled) {
                    if (action.external) {
                      window.open(action.path, '_blank');
                    } else {
                      navigate(action.path);
                    }
                  }
                }}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  p: spacing[4],
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <Box sx={{ 
                    color: action.color, 
                    mb: spacing[3],
                    display: 'flex',
                    justifyContent: 'center',
                  }}>
                    {action.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="h6" 
                              component="h3" 
                              gutterBottom 
                              sx={{ 
                                fontWeight: typography.fontWeight.bold,
                                fontFamily: typography.fontFamily.display,
                                fontSize: '2rem',
                                color: colors.text.primary,
                                mb: spacing[2],
                              }}
                            >
                              {action.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: colors.text.secondary,
                                fontFamily: typography.fontFamily.secondary,
                                fontSize: typography.fontSize.lg,
                                lineHeight: 1.5,
                              }}
                            >
                              {action.description}
                            </Typography>
                    {action.disabled && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          mt: spacing[2], 
                          display: 'block',
                          color: colors.error,
                          fontFamily: typography.fontFamily.secondary,
                        }}
                      >
                        Enroll in a course to access this feature
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>


    </Box>
  );
};

export default SelectionPage;