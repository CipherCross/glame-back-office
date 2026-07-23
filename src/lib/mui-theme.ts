import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#17645d',
      dark: '#10544e'
    },
    text: {
      primary: '#193335',
      secondary: '#526d69'
    }
  },
  typography: {
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  components: {
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '13px',
          fontWeight: 680
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 6
        },
        input: {
          fontSize: '14px',
          lineHeight: 1.35
        },
        notchedOutline: {
          borderColor: '#cbd9d5'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 7,
          boxShadow: 'none',
          fontSize: '14px',
          fontWeight: 650,
          textTransform: 'none'
        }
      }
    }
  }
});
