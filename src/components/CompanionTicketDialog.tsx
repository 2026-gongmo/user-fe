import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material';
import { Clock, HandHeart, MapPin, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import type { ScheduleRouteRequest } from '../types';

interface CompanionTicketDialogProps {
  open: boolean;
  onClose: () => void;
  routeRequest?: ScheduleRouteRequest | null;
}

const defaultRoute: ScheduleRouteRequest = {
  source: 'schedule',
  courseId: 'demo-course',
  courseName: '서비스 기획',
  destinationNodeId: '3',
  destinationName: '공학관',
  roomName: '304호',
  difficultyLabel: '조금 주의 필요',
  warnings: ['비 예보', '후문 경사 구간'],
};

export default function CompanionTicketDialog({
  open,
  onClose,
  routeRequest,
}: CompanionTicketDialogProps) {
  const route = routeRequest ?? defaultRoute;
  const urgency = route.difficultyLabel === '주의해서 이동' ? '높음' : '보통';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 800, pb: 1, fontSize: '1.25rem' }}>
        동행 도움 요청
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Alert
          severity="info"
          sx={{ borderRadius: '8px', mb: 2, bgcolor: '#EEF2FF', color: '#172554' }}
        >
          요청 내용이 정리되었습니다. 학교 인증 도우미 또는 학생지원센터와 연결될 때 이 내용이 전달됩니다.
        </Alert>

        <Box
          sx={{
            border: '1px solid #D1FAE5',
            bgcolor: '#FBFEFC',
            borderRadius: '8px',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box
              aria-hidden="true"
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                bgcolor: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <HandHeart size={21} color="#047857" />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem' }}>
                {route.courseName}
              </Typography>
              <Typography sx={{ color: '#4B5563', fontSize: '0.875rem' }}>
                {route.destinationName} {route.roomName}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <TicketRow icon={<MapPin size={17} />} label="출발" value="학교 정문" />
          <TicketRow
            icon={<MapPin size={17} />}
            label="도착"
            value={`${route.destinationName} ${route.roomName}`}
          />
          <TicketRow icon={<Clock size={17} />} label="예상 시간" value="약 15분" />
          <TicketRow
            icon={<ShieldCheck size={17} />}
            label="필요한 도움"
            value="경사 구간 이동 동행, 엘리베이터 대체 경로 확인"
          />

          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.25 }}>
            <Chip
              label={`긴급도 ${urgency}`}
              sx={{ bgcolor: urgency === '높음' ? '#FFF7ED' : '#FEF3C7', color: '#92400E', fontWeight: 800 }}
            />
            <Chip
              label={route.difficultyLabel}
              sx={{ bgcolor: '#EEF2FF', color: '#1E3A8A', fontWeight: 800 }}
            />
          </Box>
        </Box>

        <Alert severity="success" sx={{ borderRadius: '8px', mt: 2 }}>
          정확한 위치와 개인정보는 선택된 인증 도우미에게만 제한적으로 공개됩니다.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          닫기
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: '#1E3A8A',
            minHeight: 48,
            borderRadius: '8px',
            boxShadow: 'none',
            textTransform: 'none',
            '&:hover': { bgcolor: '#172554' },
          }}
        >
          동행 도움 요청하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TicketRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', py: 0.625 }}>
      <Box sx={{ color: '#047857', display: 'flex', pt: 0.125 }} aria-hidden="true">
        {icon}
      </Box>
      <Typography sx={{ width: 72, color: '#6B7280', fontWeight: 700, fontSize: '0.875rem' }}>
        {label}
      </Typography>
      <Typography sx={{ flex: 1, color: '#111827', fontWeight: 700, fontSize: '0.9375rem' }}>
        {value}
      </Typography>
    </Box>
  );
}
