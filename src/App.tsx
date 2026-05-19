import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Layout from './components/Layout';
import SosDialog from './components/SosDialog';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import MatchingPage from './pages/MatchingPage';
import ProfilePage from './pages/ProfilePage';

const theme = createTheme({
  palette: {
    primary: { main: '#030213' },
    secondary: { main: '#5B67F5' },
  },
});

export default function App() {
  const [sosOpen, setSosOpen] = useState(false);
  const openSos = () => setSosOpen(true);

  return (
    <ThemeProvider theme={theme}>
      <Layout onSosClick={openSos}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home"     element={<HomePage onSosClick={openSos} />} />
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
