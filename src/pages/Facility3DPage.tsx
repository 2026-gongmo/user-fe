import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowLeft,
  Box as Cube,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  MapPin,
} from 'lucide-react';

import { splatScenes, facilities } from '../data/mockData';

export default function Facility3DPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const facilityId = Number(id ?? 1);

  const scene = useMemo(
    () => splatScenes.find((s) => s.facilityId === facilityId) ?? splatScenes[0],
    [facilityId],
  );
  const facility = useMemo(
    () => facilities.find((f) => f.id === scene?.facilityId),
    [scene],
  );

  if (!scene) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: '#6B7280' }}>
        <Typography>해당 시설의 3D 씬이 아직 등록되지 않았습니다.</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2, textTransform: 'none' }}>돌아가기</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 12 }}>
      {/* 상단 헤더 */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          bgcolor: '#fff',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
        }}
      >
        <IconButton onClick={() => navigate(-1)} aria-label="뒤로">
          <ArrowLeft size={20} aria-hidden="true" />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {scene.title}
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: '#6B7280' }} noWrap>
            {facility?.building ?? '캠퍼스'} · 3D 미리보기
          </Typography>
        </Box>
        <Chip label="Gaussian Splatting" size="small" sx={{ height: 22, fontWeight: 700, bgcolor: '#EEF2FF', color: '#4338CA' }} />
      </Box>

      {/* 3D 뷰어 영역 (placeholder) */}
      <Box
        sx={{
          position: 'relative',
          height: 360,
          background: `linear-gradient(135deg, ${scene.thumbnail} 0%, #FFFFFF 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        role="img"
        aria-label="3D 씬 미리보기 (현재 데모용 자리)"
      >
        <Box sx={{ textAlign: 'center', color: '#4338CA' }}>
          <Cube size={64} aria-hidden="true" />
          <Typography sx={{ mt: 1, fontSize: '0.8125rem', color: '#374151', fontWeight: 700 }}>
            3D 씬 뷰어 (데모)
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: '#6B7280', mt: 0.25 }}>
            실제 구현 시 gsplat.js 기반 인터랙티브 뷰가 표시됩니다
          </Typography>
        </Box>

        {/* 컨트롤 오버레이 */}
        <Box
          sx={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            bgcolor: 'rgba(255,255,255,0.9)',
            borderRadius: '10px',
            p: 0.5,
            boxShadow: '0 4px 12px rgba(15,23,42,0.12)',
          }}
        >
          <IconButton size="small" aria-label="확대">
            <ZoomIn size={16} aria-hidden="true" />
          </IconButton>
          <IconButton size="small" aria-label="축소">
            <ZoomOut size={16} aria-hidden="true" />
          </IconButton>
          <IconButton size="small" aria-label="회전 초기화">
            <RotateCcw size={16} aria-hidden="true" />
          </IconButton>
          <IconButton size="small" aria-label="전체화면">
            <Maximize2 size={16} aria-hidden="true" />
          </IconButton>
        </Box>
      </Box>

      {/* 메타데이터 */}
      <Box sx={{ p: 2 }}>
        <Card sx={{ borderRadius: '14px', mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Avatar sx={{ bgcolor: '#EEF2FF', color: '#4338CA', width: 38, height: 38 }}>
                <MapPin size={18} aria-hidden="true" />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700 }}>{scene.title}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  촬영 {scene.capturedAt} · {scene.fileSizeMB}MB
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: '0.8125rem', color: '#374151', lineHeight: 1.7 }}>
              {scene.description}
            </Typography>
          </CardContent>
        </Card>

        {/* POI 리스트 */}
        <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, mb: 1, letterSpacing: '0.05em' }}>
          확인 포인트
        </Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {scene.pois.map((p) => (
            <Card key={p.id} sx={{ borderRadius: '12px' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: '#FEF3C7',
                    color: '#92400E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                  aria-hidden="true"
                >
                  {p.id.toUpperCase()}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>{p.label}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>{p.note}</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* AI 안내 */}
        <Card sx={{ borderRadius: '14px', bgcolor: '#F5F3FF', border: '1px solid #DDD6FE' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#DDD6FE', color: '#6D28D9', width: 36, height: 36 }}>
                <Sparkles size={18} aria-hidden="true" />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#5B21B6', mb: 0.5 }}>
                  AI 이동 가이드
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#4C1D95', lineHeight: 1.7 }}>
                  주출입문 자동문은 폭 120cm로 전동휠체어 통행이 가능합니다. 엘리베이터 #1까지는 점자블록을 따라 약 12m, 우측에 장애인 화장실이 있습니다.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate(`/map`)}
            sx={{ textTransform: 'none' }}
          >
            지도에서 보기
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{ textTransform: 'none', bgcolor: '#4338CA', boxShadow: 'none' }}
          >
            경로 안내 받기
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
