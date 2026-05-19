import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import SosDialog from './components/SosDialog';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import MatchingPage from './pages/MatchingPage';
import ProfilePage from './pages/ProfilePage';

const theme = createTheme({
  palette: {
    primary: { main: '#1E3A8A', light: '#EEF2FF', dark: '#172554' },
    secondary: { main: '#16A34A', light: '#ECFDF5', dark: '#15803D' },
    warning: { main: '#F59E0B', light: '#FFFBEB', dark: '#B45309' },
    error: { main: '#DC2626', light: '#FEF2F2', dark: '#991B1B' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#111827', secondary: '#6B7280' },
    divider: '#E5E7EB',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    h5: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E5E7EB',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 64,
          borderTop: '1px solid #E5E7EB',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#6B7280',
          minWidth: 0,
          '&.Mui-selected': {
            color: '#1E3A8A',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default function App() {
  const [sosOpen, setSosOpen] = useState(false);
  const openSos = () => setSosOpen(true);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout onSosClick={openSos}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home"     element={<HomePage />} />
          <Route path="/map"      element={<MapPage />} />
          <Route path="/matching" element={<MatchingPage />} />
          <Route path="/profile"  element={<ProfilePage />} />
          <Route path="*"         element={<Navigate to="/home" replace />} />
        </Routes>
      </Layout>
      <SosDialog open={sosOpen} onClose={() => setSosOpen(false)} />
    </ThemeProvider>
  );
}
