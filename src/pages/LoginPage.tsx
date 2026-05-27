import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  ButtonBase,
  IconButton,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  HandHeart,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

import { useAuth, TEST_ACCOUNTS } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? '/home';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error ?? '로그인에 실패했어요.');
      return;
    }
    setError(null);
    navigate(redirectTo, { replace: true });
  };

  const quickFill = (acc: (typeof TEST_ACCOUNTS)[number]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
  };

  return (
    <Box
      component="main"
      lang="ko"
      sx={{
        minHeight: '100dvh',
        bgcolor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        px: 2.5,
        pt: 6,
        pb: 4,
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          aria-hidden="true"
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 1.5,
            borderRadius: '20px',
            bgcolor: '#1E3A8A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 28px rgba(30,58,138,0.25)',
          }}
        >
          <HandHeart size={32} color="#fff" />
        </Box>
        <Typography
          component="h1"
          sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', mb: 0.25 }}
        >
          베프 (BEFF)
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: '#475569' }}>
          캠퍼스 동행과 무장애 이동을 함께
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography
            component="h2"
            sx={{ fontWeight: 800, fontSize: '1rem', mb: 1.5, color: '#111827' }}
          >
            로그인
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 1.5, borderRadius: 2, fontSize: '0.8125rem' }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={1.5}>
              <TextField
                fullWidth
                size="small"
                type="email"
                label="학교 이메일"
                placeholder="test01@ac.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
              <TextField
                fullWidth
                size="small"
                type={showPw ? 'text' : 'password'}
                label="비밀번호"
                placeholder="1234"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPw((v) => !v)}
                        aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!email || !password}
                sx={{
                  bgcolor: '#1E3A8A',
                  textTransform: 'none',
                  fontWeight: 800,
                  py: 1.25,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#172554' },
                }}
              >
                로그인
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, bgcolor: '#F1F5F9', border: '1px dashed #CBD5E1' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <Sparkles size={14} color="#1E3A8A" aria-hidden="true" />
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#1E3A8A' }}>
              데모 테스트 계정
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#475569', mb: 1.25 }}>
            아래를 탭하면 자동으로 입력돼요. 비밀번호는 모두 <b>1234</b>.
          </Typography>
          <Stack spacing={1}>
            {TEST_ACCOUNTS.map((acc) => (
              <ButtonBase
                key={acc.email}
                onClick={() => quickFill(acc)}
                aria-label={`${acc.label}으로 채우기`}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: '#fff',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  width: '100%',
                  textAlign: 'left',
                  '&:hover': { borderColor: '#1E3A8A' },
                }}
              >
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: '#EEF2FF',
                    color: '#1E3A8A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.875rem',
                  }}
                >
                  {acc.label.slice(-1)}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>
                    {acc.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#64748B' }}>
                    {acc.email} · {acc.hint}
                  </Typography>
                </Box>
              </ButtonBase>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Typography
        sx={{
          mt: 'auto',
          pt: 3,
          textAlign: 'center',
          fontSize: '0.6875rem',
          color: '#94A3B8',
        }}
      >
        프로토타입 데모. 실제 인증과 무관해요.
      </Typography>
    </Box>
  );
}
