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
          color: 'inherit', // Để icon thừa kế màu từ parent context
          minWidth: '36px', // Giảm khoảng cách icon
          '.MuiDrawer-paper &': {
            color: '#FFFFFF', // Icon màu trắng chỉ trong sidebar
          }
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: 'inherit', // Để text thừa kế màu từ parent context  
          '.MuiDrawer-paper &': {
            color: '#FFFFFF', // Text màu trắng chỉ trong sidebar
          }
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
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 143, 57, 0.4)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(0, 143, 57, 0.7)',
          }
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#121212', // Đảm bảo text trong menu item có màu đen
          '&:hover': {
            backgroundColor: 'rgba(0, 143, 57, 0.08)', // Hover màu xanh nhạt
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 143, 57, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(0, 143, 57, 0.18)',
            }
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
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 143, 57, 0.4)',
            borderRadius: '4px',
            transition: 'background-color 0.3s ease',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(0, 143, 57, 0.7)',
          },
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiPaper-root': {
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 143, 57, 0.4)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: 'rgba(0, 143, 57, 0.7)',
            }
          }
        }
      }
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 143, 57, 0.4)',
            borderRadius: '4px',
            transition: 'background-color 0.3s ease',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(0, 143, 57, 0.7)',
          },
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        listbox: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 143, 57, 0.4)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(0, 143, 57, 0.7)',
          }
        }
      }
    }
  }
});

export default theme;