import { createTheme } from '@mui/material/styles';

const createMyTheme = (themeMode) =>
  createTheme({
    palette: {
      mode: themeMode ? 'dark' : 'light',
      primary: {
        main: '#A78BFA',
      },
      secondary: {
        main: '#B8C1C1',
      },
      background: {
        default: themeMode ? '#212121' : '#F5F5F5',
        paper: themeMode ? '#333' : '#FFFFFF',
      },
    },
    typography: {
      fontFamily: 'San Francisco, Arial, sans-serif',
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
            transition: 'background-color 0.3s ease-in-out',
          },
          containedPrimary: {
            backgroundColor: '#8B5CF6',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#7C3AED',
            },
          },
          containedSecondary: {
            backgroundColor: '#F0F4F8',
            color: '#333',
            '&:hover': {
              backgroundColor: '#D1D5DB',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
            transition: 'background-color 0.3s ease-in-out',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
            transition: 'background-color 0.3s ease-in-out',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: themeMode ? '#1C1C1E' : '#F5F5F5',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
            transition: 'background-color 0.3s ease-in-out',
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            display: 'flex',
            justifyContent: 'space-between',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: themeMode ? '#181818' : '#F5F5F5',
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            paddingTop: 0,
            paddingBottom: 0,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            paddingTop: '16px',
            paddingBottom: '16px',
            '&$selected': {
              color: '#fff',
              backgroundColor: '#8B5CF6',
              '&:hover': {
                backgroundColor: '#7C3AED',
              },

            },
          },
          button: {
            '&:hover': {
              backgroundColor: '#7C3AED',
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: '40px',
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          root: {
            marginTop: '4px',
            marginBottom: '4px',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            backgroundColor: '#D1D5DB',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          body1: {
            fontSize: '14px',
          },
          body2: {
            fontSize: '12px',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            width: '40px',
            height: '40px',
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: themeMode ? '#fff' : '#333',
            '&:hover': {
              color: themeMode ? '#fff' : '#7C3AED',
            },
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            transition: 'fill 0.3s ease-in-out',
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            '&$expanded': {
              margin: '8px 0',
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            '&$expanded': {
              borderBottom: 'none',
            },
            '&:hover': {
              backgroundColor: themeMode ? '#1E1E1E' : '#F5F5F5',
            },
          },
          content: {
            margin: '12px 0 !important',
            '&$expanded': {
              margin: '12px 0 !important',
            },
          },
          expandIconWrapper: {
            marginRight: '-12px',
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            padding: '8px 16px 16px',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            padding: '12px 16px',
            '&:hover': {
              backgroundColor: themeMode ? '#1E1E1E' : '#F5F5F5',
            },
          },
          textColorPrimary: {
            color: themeMode ? '#fff' : '#333',
            '&$selected': {
              color: '#8B5CF6',
            },
          },
        },
      },
      MuiTabsIndicator: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            backgroundColor: '#8B5CF6',
          },
        },
      },
      MuiTabPanel: {
        styleOverrides: {
          root: {
            padding: 0,
          },
        },
      },
      MuiMobileStepper: {
        styleOverrides: {
          root: {
            background: 'none',
          },
          dotActive: {
            backgroundColor: '#8B5CF6',
          },
        },
      },
    },
  });

export default createMyTheme;