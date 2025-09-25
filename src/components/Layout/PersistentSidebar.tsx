import React, { useState } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Divider,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  Typography,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  AccountCircle as AccountIcon,
  Science as LabIcon,
  School as MaterialsIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  SupervisedUserCircle as SuperAdminIcon,
  Quiz as QuizIcon,
  SmartToy as ChatbotIcon,
  Group as UserManagementIcon,
  Chat as ConversationsIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Feedback as FeedbackIcon,
  Logout as LogoutIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { UserDetails } from '../../contexts/UserContext';
import { useSidebar } from '../../hooks/useSidebar';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../config/designSystem';
import { authService } from '../../services/authService';

interface PersistentSidebarProps {
  children: React.ReactNode;
}

const PersistentSidebar: React.FC<PersistentSidebarProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userDetails, isSuperAdmin } = useUser();
  const [copied, setCopied] = useState(false);
  
  const { 
    isOpen, 
    isMobile, 
    messagesExpanded, 
    setOpen, 
    toggleMessages, 
    toggleSidebar 
  } = useSidebar();

  // Handle mobile-specific behavior
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleCopyUserId = () => {
    if (userDetails?.uid) {
      navigator.clipboard.writeText(userDetails.uid)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        })
        .catch(err => console.error('Could not copy text: ', err));
    } else {
      console.error('User details are null or undefined');
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const getRoleChip = () => {
    if (isSuperAdmin) {
      return (
        <Tooltip title="Super Admin Account" placement="top" enterDelay={300} leaveDelay={200}>
          <Chip 
            label="Super-Admin" 
            variant="outlined"
            sx={{
              borderRadius: '15px',
              fontWeight: typography.fontWeight.bold,
              background: '#ffcdd2',
              color: '#c62828',
              fontFamily: typography.fontFamily.display,
              fontSize: typography.fontSize.base,
              height: 28,
              border: `1px solid #c62828`,
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: '#ffb3ba',
              },
            }} 
          />
        </Tooltip>
      );
    }
    if (userDetails?.isAdmin) {
      return (
        <Tooltip title="Educator Account" placement="top" enterDelay={300} leaveDelay={200}>
          <Chip 
            label="Educator" 
            variant="outlined"
            sx={{
              borderRadius: '15px',
              fontWeight: typography.fontWeight.bold,
              background: '#ffcdd2',
              color: '#c62828',
              fontFamily: typography.fontFamily.display,
              fontSize: typography.fontSize.base,
              height: 28,
              border: `1px solid #c62828`,
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: '#ffb3ba',
              },
            }} 
          />
        </Tooltip>
      );
    }
    return (
      <Tooltip title="Student Account" placement="top" enterDelay={300} leaveDelay={200}>
        <Chip 
          label="Student" 
          variant="outlined"
          sx={{
            borderRadius: '15px',
            fontWeight: typography.fontWeight.bold,
            background: '#bbdefb',
            color: '#1e88e5',
            fontFamily: typography.fontFamily.display,
            fontSize: typography.fontSize.base,
            height: 28,
            border: `1px solid #1e88e5`,
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            '&:hover': {
              backgroundColor: '#90caf9',
            },
          }} 
        />
      </Tooltip>
    );
  };

  const getUserRoleDisplay = () => {
    if (isSuperAdmin) {
      return 'Super Admin Account';
    }
    if (userDetails?.isAdmin) {
      return 'Educator Account';
    }
    return 'Student Account';
  };

  const sidebarWidth = isOpen ? 320 : 64;

  const navigationItems = [
    {
      title: 'Home',
      icon: <HomeIcon />,
      path: '/',
      roles: ['student', 'educator', 'superadmin'],
      color: colors.primary[500]
    },
    {
      title: 'My Account',
      icon: <AccountIcon />,
      path: '/my-profile',
      roles: ['student', 'educator', 'superadmin'],
      color: colors.primary[500]
    },
    {
      title: 'Messages',
      icon: <MessageIcon />,
      path: '/messages',
      roles: ['student', 'educator', 'superadmin'],
      expandable: true,
      color: colors.info
    },
    {
      title: 'Course Materials',
      icon: <MaterialsIcon />,
      path: '/supplemental-materials',
      roles: ['student', 'educator', 'superadmin'],
      color: colors.warning
    },
    {
      title: 'Laboratory Notebook',
      icon: <LabIcon />,
      path: '/laboratory-notebooks',
      roles: ['student', 'educator', 'superadmin'],
      disabled: userDetails && !userDetails.isAdmin && 
        (!userDetails.classes || Object.keys(userDetails.classes).length === 0),
      color: colors.secondary[500]
    }
  ];

  const educatorItems = [
    {
      title: 'Course Management',
      icon: <SettingsIcon />,
      path: '/course-management',
      roles: ['educator', 'superadmin'],
      color: colors.primary[600]
    },
    {
      title: 'Chatbot Management',
      icon: <ChatbotIcon />,
      path: '/chatbot-management',
      roles: ['educator', 'superadmin'],
      color: colors.secondary[600]
    },
    {
      title: 'Quiz Management',
      icon: <QuizIcon />,
      path: '/quiz-management',
      roles: ['educator', 'superadmin'],
      color: colors.warning
    },
    {
      title: 'Request Chatbot',
      icon: <ChatbotIcon />,
      path: '/request-chatbot',
      roles: ['educator', 'superadmin'],
      color: colors.info
    }
  ];

  const superAdminItems = [
    {
      title: 'User Management',
      icon: <UserManagementIcon />,
      path: '/user-management',
      roles: ['superadmin'],
      color: colors.error
    },
    {
      title: 'Educator Requests',
      icon: <AdminIcon />,
      path: '/educator-requests',
      roles: ['superadmin'],
      color: colors.info
    },
    {
      title: 'Course Requests',
      icon: <SettingsIcon />,
      path: '/course-requests',
      roles: ['superadmin'],
      color: colors.primary[600]
    },
    {
      title: 'Super Admin Chatbot Requests',
      icon: <AdminIcon />,
      path: '/super-admin-chatbot-requests',
      roles: ['superadmin'],
      color: colors.warning
    },
    {
      title: 'Chatbot Conversations',
      icon: <ConversationsIcon />,
      path: '/chatbot-conversations',
      roles: ['superadmin'],
      color: colors.primary[700]
    },
    {
      title: 'Super Admin Course Management',
      icon: <SuperAdminIcon />,
      path: '/super-admin-course-management',
      roles: ['superadmin'],
      color: colors.secondary[700]
    }
  ];

  const renderNavigationItem = (item: any) => {
    const isActive = isActiveRoute(item.path);
    const userRole = isSuperAdmin ? 'superadmin' : userDetails?.isAdmin ? 'educator' : 'student';
    const hasAccess = item.roles.includes(userRole);

    if (!hasAccess) return null;

    const content = (
      <ListItemButton
        onClick={() => {
          if (item.expandable) {
            if (isOpen) {
              toggleMessages();
            } else {
              // When sidebar is collapsed, navigate to messages page directly
              handleNavigation(item.path);
            }
          } else {
            handleNavigation(item.path);
          }
        }}
        disabled={item.disabled}
        sx={{
          minHeight: 56,
          justifyContent: isOpen ? 'initial' : 'center',
          px: isOpen ? 3 : 2,
          mx: 1,
          borderRadius: borderRadius.lg,
          backgroundColor: isActive ? item.color : 'transparent',
          color: isActive ? colors.text.inverse : colors.text.primary,
          fontFamily: typography.fontFamily.display, // Use Staatliches font like app page titles
          fontWeight: isActive ? typography.fontWeight.bold : typography.fontWeight.medium,
          fontSize: typography.fontSize.lg, // Increased from md to lg
          transition: animations.transitions.normal,
          boxShadow: isActive ? shadows.sm : 'none',
          '&:hover': {
            backgroundColor: isActive ? item.color : colors.neutral[100],
            transform: 'translateY(-1px)',
            boxShadow: isActive ? shadows.md : shadows.sm,
          },
          '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: isOpen ? 2 : 'auto',
            justifyContent: 'center',
            color: isActive ? colors.text.inverse : item.color,
            transition: animations.transitions.fast,
          }}
        >
          {item.icon}
        </ListItemIcon>
        {isOpen && (
          <ListItemText 
            primary={item.title} 
            sx={{ 
              opacity: isOpen ? 1 : 0,
              '& .MuiListItemText-primary': {
                fontSize: typography.fontSize.lg, // Increased from md to lg
                fontWeight: isActive ? typography.fontWeight.bold : typography.fontWeight.medium,
                fontFamily: typography.fontFamily.display, // Use Staatliches font like app page titles
              }
            }} 
          />
        )}
        {item.expandable && isOpen && (
          <Box sx={{ ml: 'auto' }}>
            {messagesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
        )}
      </ListItemButton>
    );

    if (item.disabled && isOpen) {
      return (
        <Tooltip title="Enroll in a course to access this feature" placement="right">
          <span>{content}</span>
        </Tooltip>
      );
    }

    return content;
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: colors.background.secondary,
      borderRight: `1px solid ${colors.neutral[200]}`,
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: isOpen ? 3 : 2,
        minHeight: 80,
        backgroundColor: colors.background.primary,
        borderBottom: `1px solid ${colors.neutral[200]}`,
        boxShadow: shadows.sm,
      }}>
        {isOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Box sx={{ flex: 1 }}>
              {/* Role chip removed - now shown in user controls section below */}
            </Box>
          </Box>
        )}
        <IconButton 
          onClick={toggleSidebar}
          sx={{
            backgroundColor: colors.primary[100],
            color: colors.primary[600],
            '&:hover': {
              backgroundColor: colors.primary[200],
              transform: 'scale(1.05)',
            },
            transition: animations.transitions.fast,
            borderRadius: borderRadius.lg,
            zIndex: 1001, // Ensure it's always visible
          }}
        >
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      {/* User Controls Section - Moved to top */}
      {userDetails && isOpen && (
        <Box sx={{ 
          p: 2,
          borderBottom: `1px solid ${colors.neutral[200]}`,
          backgroundColor: colors.background.primary,
        }}>
          {/* User Status & ID */}
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: typography.fontFamily.secondary,
                color: colors.text.secondary,
                fontSize: typography.fontSize.xs,
                display: 'block',
                mb: 1,
              }}
            >
              User Status & ID
            </Typography>
            <Box sx={{ 
              p: 1.5,
              backgroundColor: colors.neutral[50],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.neutral[200]}`,
            }}>
              {/* Account Status */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1.5,
              }}>
                {getRoleChip()}
              </Box>
              
              {/* User ID */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
              }}>
                <Tooltip title={copied ? "Copied!" : "Click to Copy"} enterDelay={300} leaveDelay={200}>
                  <Chip
                    label={`User ID: ${userDetails.uid}`}
                    variant="outlined"
                    onClick={handleCopyUserId}
                    sx={{
                      borderRadius: '15px',
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.bold,
                      background: '#e0f2f1',
                      color: '#00695c',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                      fontFamily: typography.fontFamily.display,
                      flex: 1,
                      '&:hover': {
                        backgroundColor: '#b2dfdb',
                      },
                    }}
                  />
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        py: 2,
        // Custom scrollbar styling
        '&::-webkit-scrollbar': {
          width: isOpen ? '8px' : '6px', // Smaller when collapsed
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: isOpen ? colors.neutral[300] : colors.neutral[200],
          borderRadius: '4px',
          '&:hover': {
            background: isOpen ? colors.neutral[400] : colors.neutral[300],
          },
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: isOpen ? colors.neutral[400] : colors.neutral[300],
        },
        // Firefox scrollbar styling
        scrollbarWidth: 'thin',
        scrollbarColor: `${isOpen ? colors.neutral[300] : colors.neutral[200]} transparent`,
      }}>
        <List sx={{ px: 1 }}>
          {navigationItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              {renderNavigationItem(item)}
              {item.expandable && isOpen && (
                <Collapse in={messagesExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ mt: 1 }}>
                    <ListItemButton
                      sx={{ 
                        pl: 6, 
                        mx: 1,
                        borderRadius: borderRadius.lg,
                        backgroundColor: colors.neutral[50],
                        '&:hover': {
                          backgroundColor: colors.neutral[100],
                        },
                      }}
                      onClick={() => handleNavigation('/messages')}
                    >
                      <ListItemText 
                        primary="View Messages" 
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: typography.fontSize.sm,
                            fontFamily: typography.fontFamily.secondary,
                          }
                        }}
                      />
                    </ListItemButton>
                    <ListItemButton
                      sx={{ 
                        pl: 6, 
                        mx: 1,
                        borderRadius: borderRadius.lg,
                        backgroundColor: colors.neutral[50],
                        '&:hover': {
                          backgroundColor: colors.neutral[100],
                        },
                      }}
                      onClick={() => handleNavigation('/add-message')}
                    >
                      <ListItemText 
                        primary="Add Message" 
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: typography.fontSize.sm,
                            fontFamily: typography.fontFamily.secondary,
                          }
                        }}
                      />
                    </ListItemButton>
                  </List>
                </Collapse>
              )}
            </ListItem>
          ))}
        </List>

        {/* Educator Section */}
        {userDetails?.isAdmin && (
          <>
            <Divider sx={{ 
              my: 3, 
              mx: 2,
              borderColor: colors.neutral[200],
            }} />
            <Box sx={{ px: 3, py: 1 }}>
              {isOpen && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: typography.fontFamily.display,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.warning,
                    fontSize: typography.fontSize.xs,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Educator Tools
                </Typography>
              )}
            </Box>
            <List sx={{ px: 1 }}>
              {educatorItems.map((item, index) => (
                <ListItem key={`educator-${index}`} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                  {renderNavigationItem(item)}
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <>
            <Divider sx={{ 
              my: 3, 
              mx: 2,
              borderColor: colors.neutral[200],
            }} />
            <Box sx={{ px: 3, py: 1 }}>
              {isOpen && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: typography.fontFamily.display,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.error,
                    fontSize: typography.fontSize.xs,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Super Admin Tools
                </Typography>
              )}
            </Box>
            <List sx={{ px: 1 }}>
              {superAdminItems.map((item, index) => (
                <ListItem key={`superadmin-${index}`} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                  {renderNavigationItem(item)}
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Bottom Controls Section */}
        <Box sx={{ 
          mt: 'auto',
          p: 2,
          borderTop: `1px solid ${colors.neutral[200]}`,
          backgroundColor: colors.background.primary,
        }}>
          {/* Feedback Button */}
          <Box sx={{ mb: 2 }}>
            <ListItemButton
              onClick={() => {
                window.open('https://help.waveshi.org', '_blank', 'noopener,noreferrer');
              }}
              sx={{
                borderRadius: borderRadius.lg,
                backgroundColor: colors.secondary[50],
                color: colors.secondary[700],
                fontFamily: typography.fontFamily.display,
                fontWeight: typography.fontWeight.medium,
                fontSize: typography.fontSize.lg,
                '&:hover': {
                  backgroundColor: colors.secondary[100],
                  transform: 'translateY(-1px)',
                  boxShadow: shadows.sm,
                },
                transition: animations.transitions.normal,
              }}
            >
              <ListItemIcon sx={{ color: colors.secondary[600] }}>
                <FeedbackIcon />
              </ListItemIcon>
              {isOpen && (
                <ListItemText 
                  primary="Provide Feedback" 
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.medium,
                      fontFamily: typography.fontFamily.display,
                    }
                  }}
                />
              )}
            </ListItemButton>
          </Box>

          {/* Logout Button */}
          <ListItemButton
            onClick={async () => {
              try {
                await authService.signOut();
                // The auth state change will automatically redirect to login
                // No need to manually navigate as the auth context will handle it
              } catch (error) {
                console.error('Logout failed:', error);
                // You could show a toast notification here
              }
            }}
            sx={{
              borderRadius: borderRadius.lg,
              backgroundColor: colors.error + '20',
              color: colors.error,
              fontFamily: typography.fontFamily.display,
              fontWeight: typography.fontWeight.medium,
              fontSize: typography.fontSize.lg,
              '&:hover': {
                backgroundColor: colors.error + '30',
                transform: 'translateY(-1px)',
                boxShadow: shadows.sm,
              },
              transition: animations.transitions.normal,
            }}
          >
            <ListItemIcon sx={{ color: colors.error }}>
              <LogoutIcon />
            </ListItemIcon>
            {isOpen && (
              <ListItemText 
                primary="Logout" 
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.medium,
                    fontFamily: typography.fontFamily.display,
                  }
                }}
              />
            )}
          </ListItemButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: isOpen ? 320 : 100,
          height: '100%',
          flexShrink: 0,
          transition: animations.transitions.normal,
          backgroundColor: colors.primary[100], // Match header/footer background
          borderRight: `1px solid ${colors.primary[200]}`,
          boxShadow: shadows.lg,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1000,
          // Custom scrollbar styling for the entire sidebar
          '&::-webkit-scrollbar': {
            width: isOpen ? '8px' : '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isOpen ? colors.neutral[300] : colors.neutral[200],
            borderRadius: '4px',
            '&:hover': {
              background: isOpen ? colors.neutral[400] : colors.neutral[300],
            },
          },
          scrollbarWidth: 'thin',
          scrollbarColor: `${isOpen ? colors.neutral[300] : colors.neutral[200]} transparent`,
        }}
      >
        {drawer}
      </Box>
      
      {/* Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          height: '100%',
          backgroundColor: '#F0F4FF', // Match the profile-container background
          overflow: 'auto',
          transition: animations.transitions.normal,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PersistentSidebar;
