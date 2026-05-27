import { ReactNode } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Fab, Box } from '@mui/material';
import { Home, Map, Users, User, ShieldAlert, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { value: '/home',     label: '홈',     icon: Home },
  { value: '/map',      label: '지도',   icon: Map  },
  { value: '/matching', label: '매칭',   icon: Users },
  { value: '/support',  label: '지원',   icon: Sparkles },
  { value: '/profile',  label: '프로필', icon: User },
];

interface LayoutProps {
  children: ReactNode;
  onSosClick: () => void;
}

export default function Layout({ children, onSosClick }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = tabs.find((t) => location.pathname.startsWith(t.value))?.value ?? '/home';

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto overscroll-contain relative">
        {children}

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
            onClick={onSosClick}
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

      <Paper
        sx={{
          flexShrink: 0,
          zIndex: (t) => t.zIndex.appBar,
          paddingBottom: 'env(safe-area-inset-bottom)',
          borderTop: '1px solid #E5E7EB',
          boxShadow: '0 -2px 10px rgba(15,23,42,0.05)',
        }}
        elevation={0}
      >
        <BottomNavigation
          value={activeTab}
          onChange={(_e, value: string) => navigate(value)}
          showLabels
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <BottomNavigationAction
                key={t.value}
                value={t.value}
                label={t.label}
                icon={<Icon size={24} />}
              />
            );
          })}
        </BottomNavigation>
      </Paper>
    </div>
  );
}
