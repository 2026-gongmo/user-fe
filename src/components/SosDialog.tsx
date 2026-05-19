import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Building2,
  Check,
  LoaderCircle,
  MapPin,
  PhoneCall,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { sosTargets } from '../data/mockData';
import { sendSosCall } from '../services/api';
import type { SosTargetId } from '../types';

const LOCATION_LABEL = '중앙도서관 3층';
const AUTO_TARGETS: SosTargetId[] = ['guardian', 'support'];

const targetIcon = {
  guardian: Users,
  support: Building2,
} as const;

export default function SosDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setSending(true);
    setSent(false);

    Promise.all(
      AUTO_TARGETS.map((targetId) =>
        sendSosCall({
          targetId,
          messages: ['긴급 도움이 필요합니다'],
          customMessage: '장애학생 위치정보 자동 공유',
          location: LOCATION_LABEL,
        }),
      ),
    ).finally(() => {
      if (cancelled) return;
      setSending(false);
      setSent(true);
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSending(false);
      setSent(false);
    }, 300);
  };

  const sharedTargets = sosTargets.filter((target) => AUTO_TARGETS.includes(target.id));

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen
      aria-labelledby="sos-title"
      PaperProps={{ sx: { bgcolor: '#FFF8F8' } }}
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
            <Typography id="sos-title" component="h1" sx={{ fontSize: '1.25rem', fontWeight: 800 }}>
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
          보호자와 장애학생지원센터에 현재 위치를 바로 전송합니다
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
            현재 위치: {LOCATION_LABEL} (자동 감지)
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ p: 2 }}>
        <Alert
          severity={sent ? 'success' : 'warning'}
          icon={
            sent ? (
              <Check size={20} aria-hidden="true" />
            ) : (
              <LoaderCircle size={20} aria-hidden="true" />
            )
          }
          sx={{
            borderRadius: '12px',
            bgcolor: sent ? '#ECFDF5' : '#FEF3C7',
            color: sent ? '#065F46' : '#92400E',
            mb: 2,
            '& .MuiAlert-icon': { color: sent ? '#047857' : '#B45309' },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {sending ? '위치정보 전송 중' : '위치정보 전송 완료'}
          </Typography>
          <Typography variant="caption">
            {sending
              ? '보호자와 장애학생지원센터에 알림을 보내고 있습니다.'
              : '보호자와 장애학생지원센터에 위치정보가 전달되었습니다.'}
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {sharedTargets.map((target) => {
            const Icon = targetIcon[target.id as keyof typeof targetIcon];
            return (
              <Card
                key={target.id}
                sx={{
                  borderRadius: '12px',
                  boxShadow: 'none',
                  border: '1px solid #E5E7EB',
                }}
              >
                <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    aria-hidden="true"
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      bgcolor: target.id === 'guardian' ? '#EEF2FF' : '#ECFDF5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      size={22}
                      color={target.id === 'guardian' ? '#1E3A8A' : '#047857'}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: '#111827' }}>
                      {target.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                      {target.sub} · {target.phone}
                    </Typography>
                  </Box>
                  <Box
                    aria-label={sent ? `${target.label} 전송 완료` : `${target.label} 전송 중`}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: sent ? '#D1FAE5' : '#FEF3C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {sent ? (
                      <Check size={16} color="#047857" aria-hidden="true" />
                    ) : (
                      <LoaderCircle size={16} color="#B45309" aria-hidden="true" />
                    )}
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>

        <Button
          component="a"
          href="tel:119"
          fullWidth
          variant="contained"
          startIcon={<PhoneCall size={20} aria-hidden="true" />}
          aria-label="119 신고하기"
          sx={{
            minHeight: 56,
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 800,
            bgcolor: '#B91C1C',
            color: '#fff',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#991B1B' },
          }}
        >
          119 신고하기
        </Button>
        <Button
          fullWidth
          variant="text"
          onClick={handleClose}
          sx={{
            mt: 1,
            minHeight: 44,
            textTransform: 'none',
            color: '#4B5563',
            fontWeight: 700,
          }}
        >
          닫기
        </Button>
      </DialogContent>
    </Dialog>
  );
}
