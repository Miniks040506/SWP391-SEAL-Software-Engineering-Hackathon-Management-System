import { createTheme, type PaletteMode } from "@mui/material/styles";

export const createAppTheme = (mode: PaletteMode) => createTheme({
    palette: {
    mode,
    primary: {
      main: '#3B82F6',
    },
    secondary: {
      main: '#7c3aed',
    },
    background: {
      default: mode === 'dark' ? '#020617' : '#f8fafc',
      paper: mode === 'dark' ? '#0f172a' : '#ffffff',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export const theme = createAppTheme('light');
