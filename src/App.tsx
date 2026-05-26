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
    secondary: { main: '#059669', light: '#ECFDF5', dark: '#047857' },
    warning: { main: '#D97706', light: '#FFFBEB', dark: '#92400E' },
    error: { main: '#B42318', light: '#FFF1F2', dark: '#991B1B' },
    background: { default: '#F5F8F6', paper: '#FFFFFF' },
    text: { primary: '#111827', secondary: '#6B7280' },
    divider: '#E2E8F0',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, sans-serif',
    fontSize: 15,
    h5: {
      fontWeight: 800,
      letterSpacing: 0,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F5F8F6',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
          minHeight: 44,
          boxShadow: 'none',
          textTransform: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: '#CBD5E1',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 8,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          alignItems: 'center',
        },
        message: {
          fontSize: '0.9375rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
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
