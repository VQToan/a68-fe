import { createTheme } from '@mui/material/styles';

// Theme dựa trên thiết kế crypto admin dashboard
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00E676', // Màu xanh lá neon
      light: '#33EB91',
      dark: '#00B248',
      contrastText: '#0A0A0A',
    },
    secondary: {
      main: '#03DAC6', // Màu xanh cyan
      light: '#33E2CF',
      dark: '#018786',
      contrastText: '#000000',
    },
    error: {
      main: '#F44336', // Đỏ
      light: '#E57373',
      dark: '#D32F2F',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#00E676', // Xanh lá
      contrastText: '#0A0A0A',
    },
    warning: {
      main: '#FFA726', // Cam
      light: '#FFB74D',
      dark: '#F57C00',
      contrastText: '#000000',
    },
    info: {
      main: '#29B6F6', // Xanh dương
      light: '#4FC3F7',
      dark: '#0288D1',
      contrastText: '#000000',
    },
    background: {
      default: '#0A0A0A', // Nền đen
      paper: '#121212', // Card màu đen nhạt hơn
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
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
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#6b6b6b #0A0A0A',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#0A0A0A',
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#6b6b6b',
            border: '2px solid #0A0A0A',
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: '#959595',
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: '#959595',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#959595',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212', // Header màu đen nhạt
          boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.5)',
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0A0A0A', // Sidebar màu đen
          color: '#FFFFFF',
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#00E676', // Icon màu xanh lá
          minWidth: '36px', // Giảm khoảng cách icon
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#FFFFFF', // Text màu trắng
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(0, 230, 118, 0.25)',
          },
        },
        containedPrimary: {
          backgroundColor: '#00E676', // Button primary màu xanh lá
          color: '#0A0A0A',
          '&:hover': {
            backgroundColor: '#00C853',
          },
        },
        containedSecondary: {
          backgroundColor: '#03DAC6', // Button secondary màu cyan
          '&:hover': {
            backgroundColor: '#018786',
          },
        },
        outlined: {
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
            borderColor: '#00E676',
          }
        },
        outlinedPrimary: {
          borderColor: '#00E676',
          color: '#00E676',
          '&:hover': {
            backgroundColor: 'rgba(0, 230, 118, 0.08)',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
        colorSuccess: {
          backgroundColor: 'rgba(0, 230, 118, 0.15)',
          color: '#00E676',
          '& .MuiChip-icon': {
            color: '#00E676',
          }
        },
        colorError: {
          backgroundColor: 'rgba(244, 67, 54, 0.15)',
          color: '#F44336',
          '& .MuiChip-icon': {
            color: '#F44336',
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212',
          backgroundImage: 'none',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#0A0A0A',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#6b6b6b',
            borderRadius: '4px',
            transition: 'background-color 0.3s ease',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#959595',
          },
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
            backgroundColor: '#0A0A0A',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#6b6b6b',
            borderRadius: '4px',
            transition: 'background-color 0.3s ease',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#959595',
          },
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        },
        head: {
          fontWeight: 600,
          color: '#B0B0B0',
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04) !important',
          }
        }
      }
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1E1E1E',
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.5)',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#6b6b6b',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#959595',
          }
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: 'rgba(0, 230, 118, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 230, 118, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(0, 230, 118, 0.18)',
            }
          }
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 8,
          '&.Mui-focused': {
            boxShadow: '0 0 0 2px rgba(0, 230, 118, 0.25)',
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          }
        },
        input: {
          '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.5)',
            opacity: 1,
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.15)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.25)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#00E676',
          }
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        listbox: {
          backgroundColor: '#1E1E1E',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#6b6b6b',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#959595',
          }
        },
        option: {
          '&[data-focus="true"]': {
            backgroundColor: 'rgba(0, 230, 118, 0.08)',
          },
          '&[aria-selected="true"]': {
            backgroundColor: 'rgba(0, 230, 118, 0.12)',
          }
        }
      }
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212',
          '&.Mui-expanded': {
            margin: 0,
            border: 'none',
            boxShadow: 'none',
          }
        }
      }
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '0 8px',
          minHeight: '48px',
          '&.Mui-expanded': {
            minHeight: '48px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }
        },
        content: {
          margin: '12px 0',
          '&.Mui-expanded': {
            margin: '12px 0',
          }
        }
      }
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '16px 8px',
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: 2,
            transitionDuration: '300ms',
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              color: '#0A0A0A',
              '& + .MuiSwitch-track': {
                backgroundColor: '#00E676',
                opacity: 1,
                border: 0,
              },
              '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
              },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
              color: '#00E676',
              border: '6px solid #0A0A0A',
            },
            '&.Mui-disabled .MuiSwitch-thumb': {
              color: '#303030',
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: 0.3,
            },
          },
          '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: 22,
            height: 22,
          },
          '& .MuiSwitch-track': {
            borderRadius: 26 / 2,
            backgroundColor: '#4D4D4D',
            opacity: 1,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
        bar: {
          borderRadius: 4,
        },
        colorPrimary: {
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#00E676',
          }
        }
      }
    },
    MuiBadge: {
      styleOverrides: {
        colorSuccess: {
          backgroundColor: '#00E676',
          color: '#0A0A0A',
        },
        colorError: {
          backgroundColor: '#F44336',
          color: '#FFFFFF',
        },
        colorWarning: {
          backgroundColor: '#FFA726',
          color: '#0A0A0A',
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          backgroundColor: 'rgba(0, 230, 118, 0.15)',
          color: '#00E676',
          '& .MuiAlert-icon': {
            color: '#00E676',
          }
        },
        standardError: {
          backgroundColor: 'rgba(244, 67, 54, 0.15)',
          color: '#F44336',
          '& .MuiAlert-icon': {
            color: '#F44336',
          }
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 167, 38, 0.15)',
          color: '#FFA726',
          '& .MuiAlert-icon': {
            color: '#FFA726',
          }
        },
        standardInfo: {
          backgroundColor: 'rgba(41, 182, 246, 0.15)',
          color: '#29B6F6',
          '& .MuiAlert-icon': {
            color: '#29B6F6',
          }
        }
      }
    }
  }
});

export default theme;