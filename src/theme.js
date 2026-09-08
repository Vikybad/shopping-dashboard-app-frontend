import { alpha, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5b5bd6', dark: '#4545b8', light: '#8282eb' },
    secondary: { main: '#14b8a6' },
    background: { default: '#f5f6fa', paper: '#ffffff' },
    text: { primary: '#1d2433', secondary: '#687083' },
    success: { main: '#129b71' },
    warning: { main: '#dd8c16' },
    error: { main: '#d64b5f' },
    info: { main: '#3286d9' },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 750, letterSpacing: '-0.04em' },
    h2: { fontWeight: 750, letterSpacing: '-0.035em' },
    h3: { fontWeight: 720, letterSpacing: '-0.025em' },
    h4: { fontWeight: 720, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 680 },
    button: { fontWeight: 650, textTransform: 'none' },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { border: '1px solid #e8eaf1', boxShadow: '0 8px 30px rgba(33, 41, 65, 0.055)' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 10, minHeight: 42 } },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiFormControl: { defaultProps: { size: 'small' } },
    MuiChip: { styleOverrides: { root: { fontWeight: 650 } } },
    MuiTableCell: {
      styleOverrides: {
        head: { color: '#687083', fontWeight: 700, background: alpha('#f5f6fa', 0.7), whiteSpace: 'nowrap' },
        root: { borderColor: '#eceef4' },
      },
    },
  },
});

export default theme;
