import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BottomNavigation, BottomNavigationAction, Paper, Fab, Box } from '@mui/material';
import { Home, Map, Users, User, ShieldAlert } from 'lucide-react';
import HomePage from './components/HomePage';
import MapPage from './components/MapPage';
import MatchingPage from './components/MatchingPage';
import ProfilePage from './components/ProfilePage';
import SosDialog from './components/SosDialog';

const theme = createTheme({
  palette: {
    primary: {
      main: '#030213',
    },
    secondary: {
      main: '#5B67F5',
    },
  },
});

export default function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [sosOpen, setSosOpen] = useState(false);

  const renderContent = () => {
    switch (currentTab) {
      case 0:
        return <HomePage onSosClick={() => setSosOpen(true)} />;
      case 1:
        return <MapPage />;
      case 2:
        return <MatchingPage />;
      case 3:
        return <ProfilePage />;
      default:
        return <HomePage onSosClick={() => setSosOpen(true)} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
        <main className="flex-1 overflow-y-auto overscroll-contain relative">
          {renderContent()}

          <Box
            sx={{
              position: 'sticky',
              bottom: 16,
              display: 'flex',
              justifyContent: 'flex-end',
              pr: 2,
              pointerEvents: 'none',
              zIndex: 50,
              marginTop: '-72px',
            }}
          >
            <Fab
              onClick={() => setSosOpen(true)}
              aria-label="긴급 도움 호출"
              sx={{
                bgcolor: '#B91C1C',
                color: '#fff',
                pointerEvents: 'auto',
                width: 64,
                height: 64,
                boxShadow: '0 6px 16px rgba(185,28,28,0.45)',
                '&:hover': { bgcolor: '#991B1B' },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                <ShieldAlert size={22} aria-hidden="true" />
                <Box
                  component="span"
                  sx={{ fontSize: '0.6875rem', fontWeight: 800, mt: 0.25 }}
                  aria-hidden="true"
                >
                  SOS
                </Box>
              </Box>
            </Fab>
          </Box>
        </main>

        <SosDialog open={sosOpen} onClose={() => setSosOpen(false)} />

        <Paper
          sx={{
            flexShrink: 0,
            zIndex: (t) => t.zIndex.appBar,
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
          elevation={3}
        >
          <BottomNavigation
            value={currentTab}
            onChange={(event, newValue) => {
              setCurrentTab(newValue);
            }}
            showLabels
          >
            <BottomNavigationAction
              label="홈"
              icon={<Home size={24} />}
            />
            <BottomNavigationAction
              label="지도"
              icon={<Map size={24} />}
            />
            <BottomNavigationAction
              label="매칭"
              icon={<Users size={24} />}
            />
            <BottomNavigationAction
              label="프로필"
              icon={<User size={24} />}
            />
          </BottomNavigation>
        </Paper>
      </div>
    </ThemeProvider>
  );
}
