import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Card,
  CardActionArea,
  TextField,
  Divider,
  Alert,
} from '@mui/material';
import {
  X,
  Phone,
  ShieldAlert,
  MapPin,
  Users,
  Building2,
  HeartPulse,
  MessageSquareWarning,
  Mic,
  Send,
  Check,
} from 'lucide-react';
import { sosTargets, sosQuickMessages } from '../data/mockData';
import { sendSosCall } from '../services/api';
import type { SosTargetId } from '../types';

const targetVisual: Record<SosTargetId, { icon: typeof Phone; color: string; bg: string }> = {
  guardian: { icon: Users,       color: '#4338CA', bg: '#EEF0FF' },
  support:  { icon: Building2,   color: '#047857', bg: '#D1FAE5' },
  security: { icon: ShieldAlert, color: '#B45309', bg: '#FEF3C7' },
  '119':    { icon: HeartPulse,  color: '#B91C1C', bg: '#FEE2E2' },
};

export default function SosDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [sent, setSent] = useState(false);

  const reset = () => {
    setSelectedTarget(null);
    setSelectedMessages([]);
    setCustomMessage('');
    setSent(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const handleSend = async () => {
    if (!selectedTarget) return;
    await sendSosCall({
      targetId: selectedTarget as SosTargetId,
      messages: selectedMessages,
      customMessage: customMessage || undefined,
      location: '중앙도서관 3층',
    });
    setSent(true);
  };

  const toggleMessage = (m: string) => {
    setSelectedMessages((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen
      aria-labelledby="sos-title"
      PaperProps={{
        sx: { bgcolor: '#FFF8F8' },
      }}
    >
      <Box
        sx={{
          bgcolor: '#B91C1C',
          color: '#fff',
          px: 2,
          pt: 2,
          pb: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldAlert size={24} aria-hidden="true" />
            <Typography
              id="sos-title"
              component="h1"
              sx={{ fontSize: '1.25rem', fontWeight: 800 }}
            >
              긴급 도움 호출
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            aria-label="긴급 호출 화면 닫기"
            sx={{ color: '#fff', minWidth: 44, minHeight: 44 }}
          >
            <X size={22} aria-hidden="true" />
          </IconButton>
        </Box>
        <Typography sx={{ fontSize: '0.875rem', color: '#FECACA' }}>
          호출 대상과 메시지를 선택하면 위치가 함께 전송됩니다
        </Typography>
        <Box
          sx={{
            mt: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            px: 1.5,
            py: 1,
          }}
          aria-label="현재 위치"
        >
          <MapPin size={16} aria-hidden="true" />
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
            현재 위치: 중앙도서관 3층 (자동 감지)
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ p: 2 }}>
        {sent ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Check size={40} color="#047857" aria-hidden="true" />
            </Box>
            <Typography
              component="h2"
              sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 1 }}
            >
              호출이 전송되었습니다
            </Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '0.9375rem', mb: 3 }}>
              {sosTargets.find((t) => t.id === selectedTarget)?.label}에게
              <br />
              위치와 메시지가 전달되었어요.
            </Typography>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{
                bgcolor: '#B91C1C',
                color: '#fff',
                textTransform: 'none',
                px: 4,
                py: 1.25,
                borderRadius: '12px',
                boxShadow: 'none',
                minHeight: 48,
                '&:hover': { bgcolor: '#991B1B' },
              }}
            >
              확인
            </Button>
          </Box>
        ) : (
          <>
            <Typography
              component="h2"
              sx={{ fontSize: '0.9375rem', fontWeight: 700, mb: 1, color: '#1F2937' }}
            >
              1. 호출 대상 선택
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
              {sosTargets.map((t) => {
                const visual = targetVisual[t.id];
                const Icon = visual.icon;
                const active = selectedTarget === t.id;
                return (
                  <Card
                    key={t.id}
                    sx={{
                      borderRadius: '12px',
                      border: active ? `2px solid ${visual.color}` : '1px solid #E5E7EB',
                      boxShadow: 'none',
                    }}
                  >
                    <CardActionArea
                      onClick={() => setSelectedTarget(t.id)}
                      aria-pressed={active}
                      aria-label={`${t.label}, ${t.sub}, ${t.phone}`}
                      sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          bgcolor: visual.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={22} color={visual.color} aria-hidden="true" />
                      </Box>
                      <Box sx={{ flex: 1, textAlign: 'left' }}>
                        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827' }}>
                          {t.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                          {t.sub} · {t.phone}
                        </Typography>
                      </Box>
                      {active && (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: visual.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-hidden="true"
                        >
                          <Check size={14} color="#fff" />
                        </Box>
                      )}
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>

            <Typography
              component="h2"
              sx={{ fontSize: '0.9375rem', fontWeight: 700, mb: 1, color: '#1F2937' }}
            >
              2. 전달할 메시지 (복수 선택 가능)
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
              {sosQuickMessages.map((m) => {
                const active = selectedMessages.includes(m);
                return (
                  <Chip
                    key={m}
                    label={m}
                    onClick={() => toggleMessage(m)}
                    icon={
                      active ? (
                        <Check size={14} aria-hidden="true" />
                      ) : (
                        <MessageSquareWarning size={14} aria-hidden="true" />
                      )
                    }
                    role="button"
                    aria-pressed={active}
                    sx={{
                      height: 36,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      bgcolor: active ? '#B91C1C' : '#fff',
                      color: active ? '#fff' : '#111827',
                      border: '1px solid',
                      borderColor: active ? '#B91C1C' : '#D1D5DB',
                      '& .MuiChip-icon': { color: active ? '#fff' : '#6B7280' },
                      '&:hover': { bgcolor: active ? '#991B1B' : '#F3F4F6' },
                    }}
                  />
                );
              })}
            </Box>
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder="직접 메시지 입력 (선택)"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              inputProps={{ 'aria-label': '직접 메시지 입력' }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' },
              }}
            />

            <Alert
              severity="warning"
              sx={{
                borderRadius: '12px',
                bgcolor: '#FEF3C7',
                color: '#92400E',
                mb: 2,
                '& .MuiAlert-icon': { color: '#B45309' },
              }}
            >
              호출 시 현재 위치(GPS)와 학생 정보가 함께 전송됩니다.
            </Alert>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Mic size={18} aria-hidden="true" />}
                aria-label="음성으로 도움 요청"
                sx={{
                  minHeight: 56,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  borderColor: '#D1D5DB',
                  color: '#1F2937',
                  flexShrink: 0,
                  px: 2,
                }}
              >
                음성
              </Button>
              <Button
                fullWidth
                variant="contained"
                disabled={!selectedTarget}
                onClick={handleSend}
                startIcon={<Send size={18} aria-hidden="true" />}
                aria-label="긴급 호출 보내기"
                sx={{
                  minHeight: 56,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 700,
                  bgcolor: '#B91C1C',
                  color: '#fff',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#991B1B' },
                  '&.Mui-disabled': { bgcolor: '#FCA5A5', color: '#fff' },
                }}
              >
                긴급 호출 보내기
              </Button>
            </Box>
            <Button
              variant="text"
              fullWidth
              startIcon={<Phone size={16} aria-hidden="true" />}
              sx={{
                mt: 1,
                minHeight: 44,
                textTransform: 'none',
                color: '#4B5563',
              }}
            >
              바로 전화 걸기
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
