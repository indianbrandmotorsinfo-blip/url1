import { createTheme } from '@mui/material/styles';

export const INDIGO = '#4F46E5';
export const INDIGO_DARK = '#4338CA';
export const INDIGO_TINT = '#EEF0FF';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: INDIGO, dark: INDIGO_DARK, light: '#818CF8', contrastText: '#FFFFFF' },
    error: { main: '#DC2626' },
    success: { main: '#16A34A' },
    background: { default: '#F6F7F9', paper: '#FFFFFF' },
    text: { primary: '#1B1F2A', secondary: '#667085' },
    divider: '#E6E8EE',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '"Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
    h2: { fontSize: '1.25rem', fontWeight: 650, letterSpacing: '-0.02em', lineHeight: 1.3 },
    body1: { fontSize: '0.9375rem' },
    body2: { fontSize: '0.875rem', lineHeight: 1.55 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-0.005em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'radial-gradient(1100px 420px at 50% -120px, rgba(79,70,229,0.08), transparent 70%), #F6F7F9',
          backgroundAttachment: 'fixed',
          WebkitFontSmoothing: 'antialiased',
        },
        '::selection': { backgroundColor: 'rgba(79,70,229,0.18)' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 16, paddingBlock: 8 },
        containedPrimary: {
          boxShadow: '0 1px 2px rgba(67,56,202,0.35), inset 0 1px 0 rgba(255,255,255,0.14)',
          '&:hover': {
            boxShadow: '0 4px 12px -2px rgba(67,56,202,0.45), inset 0 1px 0 rgba(255,255,255,0.14)',
          },
        },
      },
    },
    MuiTextField: { defaultProps: { variant: 'outlined', fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          '& fieldset': { borderColor: '#DDE0E8' },
          '&:hover fieldset': { borderColor: '#C3C8D6' },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 24px 60px -12px rgba(16,24,40,0.28)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { borderRadius: 8, fontSize: '0.75rem', fontWeight: 500 } },
    },
  },
});
