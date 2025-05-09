import { createTheme } from '@mui/material/styles';

// Theme dựa trên màu sắc logo AutoTrade68
const theme = createTheme({
  palette: {
    primary: {
      main: '#000000', // Đen từ viền logo
      light: '#333333',
      dark: '#000000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#008F39', // Xanh lá từ số 6 trong logo
      light: '#2CAF5F',
      dark: '#00692A',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#D92121', // Đỏ từ số 8 trong logo
      light: '#E54545',
      dark: '#B61919',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#008F39', // Xanh lá từ logo
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F5F5', // Background sáng
      paper: '#FFFFFF',
    },
    text: {
      primary: '#121212',
      secondary: '#676767',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000', // Đen từ logo
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0A0A0A', // Nền đen cho sidebar
          color: '#FFFFFF',
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#FFFFFF', // Icon màu trắng trong sidebar
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#FFFFFF', // Text màu trắng trong sidebar
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          backgroundColor: '#000000', // Đen từ logo
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
        containedSecondary: {
          backgroundColor: '#008F39', // Xanh lá từ logo
          '&:hover': {
            backgroundColor: '#006D2C',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: 12,
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        }
      }
    }
  }
});

export default theme;