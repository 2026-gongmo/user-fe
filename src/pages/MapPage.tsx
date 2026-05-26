import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  TextField,
  Chip,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  ButtonBase,
  Button,
  Alert,
} from '@mui/material';
import {
  Search,
  Accessibility,
  MoveVertical,
  DoorOpen,
  Navigation,
  Building2,
  ArrowLeft,
  X,
  Locate,
  Star,
  Clock,
  ChevronRight,
  ChevronUp,
  AlertTriangle,
  HandHeart,
  Megaphone,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

import AccessibilityReportDialog from '../components/AccessibilityReportDialog';
import CompanionTicketDialog from '../components/CompanionTicketDialog';
import {
  facilities as locations,
  recentFacilitySearches as recentSearches,
  routeRiskPoints,
} from '../data/mockData';
import type {
  Facility as Location,
  FacilityCategory,
  RouteRiskPoint,
  ScheduleRouteRequest,
} from '../types';

const categories = [
  { id: 'all',      label: '전체',       icon: Building2,    color: '#1E3A8A' },
  { id: 'building', label: '건물',       icon: Building2,    color: '#1E3A8A' },
  { id: 'elevator', label: '엘리베이터', icon: MoveVertical, color: '#B45309' },
  { id: 'ramp',     label: '경사로',     icon: Accessibility, color: '#047857' },
  { id: 'restroom', label: '화장실',     icon: DoorOpen,     color: '#15803D' },
] as const;

const categoryColor = (cat: FacilityCategory) => {
  switch (cat) {
    case 'elevator': return '#B45309';
    case 'ramp':     return '#047857';
    case 'restroom': return '#15803D';
    default:         return '#1E3A8A';
  }
};

const categoryBg = (cat: FacilityCategory) => {
  switch (cat) {
    case 'elevator': return '#FEF3C7';
    case 'ramp':     return '#D1FAE5';
    case 'restroom': return '#ECFDF5';
    default:         return '#EEF2FF';
  }
};

const categoryLabel = (cat: FacilityCategory) => {
  switch (cat) {
    case 'elevator': return '엘리베이터';
    case 'ramp':     return '경사로';
    case 'restroom': return '화장실';
    default:         return '건물';
  }
};

const categoryIcon = (cat: FacilityCategory) => {
  switch (cat) {
    case 'elevator': return MoveVertical;
    case 'ramp':     return Accessibility;
    case 'restroom': return DoorOpen;
    default:         return Building2;
  }
};

const SHEET_COLLAPSED = 92;
const SHEET_MAX = 480;

const mobilityTypeOptions = [
  {
    id: 'wheelchair',
    label: '휠체어',
    guide: '계단, 단차, 엘리베이터 고장 정보를 우선 반영합니다.',
  },
  {
    id: 'crutches',
    label: '목발',
    guide: '급경사와 긴 이동거리를 더 주의해서 안내합니다.',
  },
  {
    id: 'senior',
    label: '고령자',
    guide: '경사와 휴식 가능 지점을 고려해 안내합니다.',
  },
  {
    id: 'stroller',
    label: '유아차',
    guide: '계단과 좁은 길을 피해 이동할 수 있게 안내합니다.',
  },
  {
    id: 'injury',
    label: '일시적 부상',
    guide: '무리 없는 이동거리와 경사 구간을 함께 확인합니다.',
  },
] as const;

type MobilityTypeId = (typeof mobilityTypeOptions)[number]['id'];

const routeComparisonOptions = [
  {
    id: 'fast',
    title: '빠른 길',
    minutes: '8분',
    caution: '계단 1곳, 급경사 1곳',
    description: '빠르지만 이동이 불편할 수 있어요.',
    color: '#1E3A8A',
    bg: '#F8FAFC',
    border: '#CBD5E1',
    badge: '',
  },
  {
    id: 'safe',
    title: '안전한 길',
    minutes: '11분',
    caution: '낮음',
    description: '계단과 급경사를 피해 이동할 수 있어요.',
    color: '#047857',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    badge: '추천',
  },
] as const;

const publicDataSources = [
  '주변 정류장 정보',
  '오늘 날씨 정보',
  '이동지원 정보',
  '편의시설 정보',
  '보행 안전 정보',
] as const;

const getExpandedPx = () =>
  typeof window === 'undefined' ? 460 : Math.min(window.innerHeight * 0.55, SHEET_MAX);

export default function MapPage() {
  const location = useLocation();
  const routeRequest =
    (location.state as { routeRequest?: ScheduleRouteRequest } | null)?.routeRequest ?? null;
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selected, setSelected] = useState<Location | null>(null);
  const [companionOpen, setCompanionOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [safeRouteSelected, setSafeRouteSelected] = useState(false);
  const [selectedMobilityTypeId, setSelectedMobilityTypeId] =
    useState<MobilityTypeId>('wheelchair');

  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const dragRef = useRef<{ startY: number; startH: number; active: boolean; moved: boolean }>({
    startY: 0,
    startH: 0,
    active: false,
    moved: false,
  });

  useEffect(() => {
    if (selected) setSheetExpanded(true);
  }, [selected]);

  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const baseH = sheetExpanded ? getExpandedPx() : SHEET_COLLAPSED;
    dragRef.current = { startY: e.clientY, startH: baseH, active: true, moved: false };
    setDragHeight(baseH);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dy = dragRef.current.startY - e.clientY;
    if (Math.abs(dy) > 4) dragRef.current.moved = true;
    const maxH = getExpandedPx();
    const newH = Math.max(SHEET_COLLAPSED, Math.min(maxH, dragRef.current.startH + dy));
    setDragHeight(newH);
  };

  const onHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const maxH = getExpandedPx();
    const finalH = dragHeight ?? (sheetExpanded ? maxH : SHEET_COLLAPSED);
    const mid = (SHEET_COLLAPSED + maxH) / 2;

    if (dragRef.current.moved) {
      setSheetExpanded(finalH >= mid);
    } else {
      setSheetExpanded((v) => !v);
    }

    dragRef.current.active = false;
    setDragHeight(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const sheetHeightStyle =
    dragHeight !== null
      ? `${dragHeight}px`
      : sheetExpanded
        ? `min(55vh, ${SHEET_MAX}px)`
        : `${SHEET_COLLAPSED}px`;

  const locateBottomStyle =
    dragHeight !== null
      ? `${dragHeight + 12}px`
      : sheetExpanded
        ? `calc(min(55vh, ${SHEET_MAX}px) + 12px)`
        : `${SHEET_COLLAPSED + 12}px`;

  const visibleLocations =
    selectedCategory === 'all'
      ? locations
      : locations.filter((l) => l.category === selectedCategory);

  const filteredBySearch = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.building.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const routeDestination = routeRequest
    ? locations.find((loc) => String(loc.id) === routeRequest.destinationNodeId)
    : null;

  const activeRiskPoints = routeRequest ? routeRiskPoints : [];
  const selectedMobilityType =
    mobilityTypeOptions.find((option) => option.id === selectedMobilityTypeId) ??
    mobilityTypeOptions[0];

  const handleSelectMobilityType = (id: MobilityTypeId) => {
    setSelectedMobilityTypeId(id);
    setSafeRouteSelected(false);
  };

  return (
    <Box
      component="main"
      lang="ko"
      sx={{ position: 'relative', height: '100%', overflow: 'hidden', bgcolor: '#E8F1F5' }}
    >
      <Typography
        component="h1"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        캠퍼스 편한 이동 지도
      </Typography>

      {/* 풀스크린 지도 배경 */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #E8F1F5 0%, #DCEAE4 50%, #E5EBF3 100%)',
        }}
      >
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#A8B5C2" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <path d="M 0 50% Q 30% 45%, 60% 55% T 100% 50%" stroke="#FFFFFF" strokeWidth="14" fill="none" />
          <path d="M 50% 0 Q 45% 40%, 55% 70% T 50% 100%" stroke="#FFFFFF" strokeWidth="10" fill="none" />
        </svg>
        <Box sx={{ position: 'absolute', left: '20%', top: '30%', width: 60, height: 50, bgcolor: '#C9D4DE', borderRadius: '4px', opacity: 0.7 }} />
        <Box sx={{ position: 'absolute', left: '55%', top: '22%', width: 70, height: 55, bgcolor: '#C9D4DE', borderRadius: '4px', opacity: 0.7 }} />
        <Box sx={{ position: 'absolute', left: '65%', top: '52%', width: 80, height: 60, bgcolor: '#C9D4DE', borderRadius: '4px', opacity: 0.7 }} />
        <Box sx={{ position: 'absolute', left: '18%', top: '58%', width: 65, height: 55, bgcolor: '#C9D4DE', borderRadius: '4px', opacity: 0.7 }} />
      </Box>

      {/* 마커 + 내 위치 */}
      <Box
        role="application"
        aria-label={`캠퍼스 지도. ${visibleLocations.length}개 시설 표시 중. 아래 목록에서도 동일한 시설을 확인할 수 있습니다.`}
        sx={{ position: 'absolute', inset: 0 }}
      >
        {routeRequest && (
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
          >
            <path
              d="M 50 65 C 53 57, 58 48, 64 50 S 69 56, 70 60"
              stroke="#1E3A8A"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="1 3"
              opacity="0.92"
            />
            <path
              d="M 50 65 C 48 57, 50 49, 57 44 S 68 50, 70 60"
              stroke="#16A34A"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
          </svg>
        )}

        {activeRiskPoints.map((risk) => (
          <RiskPointMarker key={risk.id} risk={risk} />
        ))}

        {visibleLocations.map((loc) => {
          const color = categoryColor(loc.category);
          const Icon = categoryIcon(loc.category);
          const isSelected = selected?.id === loc.id;
          return (
            <ButtonBase
              key={loc.id}
              onClick={() => setSelected(loc)}
              aria-label={`${categoryLabel(loc.category)}, ${loc.name}, ${loc.building}, 거리 ${loc.distance}${
                loc.accessible ? ', 이동 편의 확인됨' : ''
              }`}
              aria-pressed={isSelected}
              sx={{
                position: 'absolute',
                left: `${loc.x}%`,
                top: `${loc.y}%`,
                transform: 'translate(-50%, -100%)',
                zIndex: isSelected ? 10 : 1,
                borderRadius: '50%',
                minWidth: 48,
                minHeight: 48,
                '&:focus-visible': {
                  outline: '3px solid #FBBF24',
                  outlineOffset: 2,
                },
              }}
            >
              <Box
                sx={{
                  bgcolor: color,
                  color: '#fff',
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  width: isSelected ? 48 : 40,
                  height: isSelected ? 48 : 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isSelected
                    ? `0 6px 16px ${color}80`
                    : '0 4px 10px rgba(0,0,0,0.25)',
                  border: '2px solid #fff',
                  transition: 'all 0.15s ease',
                }}
              >
                <Box sx={{ transform: 'rotate(45deg)', display: 'flex' }}>
                  <Icon size={isSelected ? 22 : 18} color="#fff" aria-hidden="true" />
                </Box>
              </Box>
            </ButtonBase>
          );
        })}

        {/* 내 위치 (펄스) */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            left: '50%',
            top: '65%',
            transform: 'translate(-50%, -50%)',
            width: 18,
            height: 18,
          }}
        >
          <Box
            sx={{
              '@keyframes mapPulse': {
                '0%': { transform: 'translate(-50%, -50%) scale(0.6)', opacity: 0.55 },
                '100%': { transform: 'translate(-50%, -50%) scale(2.4)', opacity: 0 },
              },
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 18,
              height: 18,
              borderRadius: '50%',
              bgcolor: '#1E3A8A',
              animation: 'mapPulse 1.8s ease-out infinite',
            }}
          />
          <Box
            sx={{
              position: 'relative',
              width: 18,
              height: 18,
              borderRadius: '50%',
              bgcolor: '#1E3A8A',
              border: '3px solid #fff',
              boxShadow: '0 0 0 4px rgba(30,58,138,0.25)',
            }}
          />
        </Box>
      </Box>

      {/* 상단 검색바 + 필터 (floating) */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <ButtonBase
          onClick={() => setSearchOpen(true)}
          aria-label="건물 또는 시설 검색"
          sx={{
            width: '100%',
            borderRadius: '999px',
            bgcolor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            px: 2,
            py: 1.5,
            gap: 1.5,
            minHeight: 48,
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            '&:focus-visible': {
              outline: '3px solid #1E3A8A',
              outlineOffset: 2,
            },
          }}
        >
          <Search size={20} color="#4B5563" aria-hidden="true" />
          <Typography sx={{ color: '#4B5563', fontSize: '0.9375rem' }}>
            건물·시설 검색
          </Typography>
        </ButtonBase>

        <Box
          role="group"
          aria-label="시설 종류 필터"
          sx={{
            display: 'flex',
            gap: 0.875,
            overflowX: 'auto',
            pb: 0.25,
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <ButtonBase
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                role="button"
                aria-pressed={active}
                aria-label={`${cat.label}${active ? ', 선택됨' : ''}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.625,
                  minHeight: 36,
                  px: 1.5,
                  borderRadius: '999px',
                  bgcolor: active ? cat.color : '#fff',
                  color: active ? '#fff' : '#111827',
                  border: active ? 'none' : '1px solid #E5E7EB',
                  boxShadow: active
                    ? `0 3px 10px ${cat.color}40`
                    : '0 2px 6px rgba(0,0,0,0.08)',
                  flexShrink: 0,
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  transition: 'all 0.15s ease',
                  '&:focus-visible': {
                    outline: '3px solid #1E3A8A',
                    outlineOffset: 2,
                  },
                }}
              >
                <Icon size={14} color={active ? '#fff' : cat.color} aria-hidden="true" />
                <span>{cat.label}</span>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      {routeRequest && (
        <Card
          component="section"
          aria-label="수업길 안내"
          sx={{
            position: 'absolute',
            top: 104,
            left: 12,
            right: 12,
            zIndex: 18,
            borderRadius: '8px',
            border: '1px solid #BFDBFE',
            boxShadow: '0 10px 28px rgba(15,23,42,0.10)',
            maxHeight: 'calc(100% - 208px)',
            overflowY: 'auto',
          }}
        >
          <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1.25 }}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '8px',
                  bgcolor: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Navigation size={21} color="#1E3A8A" />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: '#1E3A8A', fontSize: '0.8125rem', fontWeight: 800 }}>
                  수업길 안내
                </Typography>
                <Typography
                  component="h2"
                  sx={{ color: '#111827', fontSize: '1.0625rem', fontWeight: 800, mt: 0.125 }}
                >
                  {routeRequest.courseName}까지 {selectedMobilityType.label} 기준 안전 이동 경로를 추천해요.
                </Typography>
                <Typography sx={{ color: '#4B5563', fontSize: '0.875rem', mt: 0.25 }}>
                  도착: {routeRequest.destinationName} {routeRequest.roomName}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.25 }}>
              <Chip
                icon={<ShieldCheck size={13} aria-hidden="true" />}
                label={routeRequest.difficultyLabel}
                sx={{
                  bgcolor: '#EEF2FF',
                  color: '#1E3A8A',
                  fontWeight: 800,
                  '& .MuiChip-icon': { color: '#1E3A8A' },
                }}
              />
              {routeRequest.warnings.slice(0, 2).map((warning) => (
                <Chip
                  key={warning}
                  icon={<AlertTriangle size={13} aria-hidden="true" />}
                  label={warning}
                  sx={{
                    bgcolor: '#FEF3C7',
                    color: '#92400E',
                    fontWeight: 800,
                    '& .MuiChip-icon': { color: '#92400E' },
                  }}
                />
              ))}
            </Box>

            <Alert
              severity="info"
              sx={{ borderRadius: '8px', mb: 1.25, bgcolor: '#F0F7F4', color: '#064E3B' }}
            >
              날씨와 제보 정보를 함께 확인해 주의할 구간을 알려드려요. 주의 구간은 노란 마커로 확인할 수 있어요.
            </Alert>

            <Box
              component="section"
              aria-label="이동 상황 선택"
              sx={{
                mb: 1.25,
                p: 1.25,
                borderRadius: '8px',
                bgcolor: '#fff',
                border: '1px solid #D1FAE5',
              }}
            >
              <Typography sx={{ color: '#064E3B', fontSize: '1rem', fontWeight: 900, mb: 1 }}>
                내 이동 상황
              </Typography>
              <Box
                role="radiogroup"
                aria-label="이동 상황"
                sx={{
                  display: 'flex',
                  gap: 0.75,
                  overflowX: 'auto',
                  pb: 0.25,
                  '&::-webkit-scrollbar': { display: 'none' },
                }}
              >
                {mobilityTypeOptions.map((option) => {
                  const active = option.id === selectedMobilityTypeId;
                  return (
                    <ButtonBase
                      key={option.id}
                      role="radio"
                      aria-checked={active}
                      onClick={() => handleSelectMobilityType(option.id)}
                      sx={{
                        minHeight: 44,
                        px: 1.5,
                        borderRadius: '999px',
                        bgcolor: active ? '#047857' : '#F8FAFC',
                        color: active ? '#fff' : '#064E3B',
                        border: active ? '2px solid #047857' : '1px solid #BBF7D0',
                        fontSize: '0.9375rem',
                        fontWeight: 900,
                        flexShrink: 0,
                        boxShadow: active ? '0 4px 12px rgba(4,120,87,0.24)' : 'none',
                        '&:focus-visible': {
                          outline: '3px solid #1E3A8A',
                          outlineOffset: 2,
                        },
                      }}
                    >
                      {option.label}
                    </ButtonBase>
                  );
                })}
              </Box>
              <Alert
                severity="success"
                sx={{
                  mt: 1,
                  borderRadius: '8px',
                  bgcolor: '#ECFDF5',
                  color: '#065F46',
                  '& .MuiAlert-icon': { color: '#047857' },
                }}
              >
                {selectedMobilityType.guide}
              </Alert>
            </Box>

            <Box
              component="section"
              aria-label="빠른 길과 안전한 길 비교"
              sx={{
                mb: 1.25,
                p: 1.25,
                borderRadius: '8px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E5E7EB',
              }}
            >
              <Typography sx={{ color: '#111827', fontSize: '1rem', fontWeight: 900, mb: 1 }}>
                빠른 길과 안전한 길 비교
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: 1,
                }}
              >
                {routeComparisonOptions.map((option) => (
                  <RouteCompareCard
                    key={option.id}
                    option={option}
                    safetyDescription={selectedMobilityType.guide}
                  />
                ))}
              </Box>
              <Button
                fullWidth
                variant="contained"
                startIcon={<ShieldCheck size={18} aria-hidden="true" />}
                onClick={() => setSafeRouteSelected(true)}
                sx={{
                  mt: 1,
                  minHeight: 48,
                  bgcolor: '#047857',
                  borderRadius: '8px',
                  boxShadow: 'none',
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#065F46' },
                }}
              >
                안전한 길 선택
              </Button>
              {safeRouteSelected && (
                <Alert
                  severity="success"
                  sx={{
                    mt: 1,
                    borderRadius: '8px',
                    bgcolor: '#ECFDF5',
                    color: '#065F46',
                    '& .MuiAlert-icon': { color: '#047857' },
                  }}
                >
                  안전한 경로가 선택되었습니다.
                </Alert>
              )}
            </Box>

            <Box
              component="section"
              aria-label="이동 안내에 반영된 정보"
              sx={{
                mb: 1.25,
                p: 1.5,
                borderRadius: '8px',
                bgcolor: '#FBFEFC',
                border: '1px solid #BFDBFE',
              }}
            >
              <Typography sx={{ color: '#172554', fontSize: '1rem', fontWeight: 900, mb: 1 }}>
                이동 안내에 반영된 정보
              </Typography>
              <Box sx={{ display: 'grid', gap: 0.75, mb: 1.25 }}>
                {publicDataSources.map((source) => (
                  <Box
                    key={source}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      minHeight: 34,
                    }}
                  >
                    <CheckCircle2 size={18} color="#047857" aria-hidden="true" />
                    <Typography sx={{ color: '#111827', fontSize: '0.9375rem', fontWeight: 800 }}>
                      {source}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Typography sx={{ color: '#374151', fontSize: '0.9375rem', fontWeight: 700 }}>
                날씨, 정류장, 편의시설, 제보 정보를 함께 확인해 이동 위험을 줄입니다.
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              startIcon={<HandHeart size={18} aria-hidden="true" />}
              onClick={() => setCompanionOpen(true)}
              sx={{
                minHeight: 48,
                bgcolor: '#047857',
                borderRadius: '8px',
                boxShadow: 'none',
                textTransform: 'none',
                fontSize: '0.9375rem',
                '&:hover': { bgcolor: '#065F46' },
              }}
            >
              동행 요청하기
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Megaphone size={18} aria-hidden="true" />}
              onClick={() => setReportOpen(true)}
              sx={{
                mt: 1,
                minHeight: 48,
                borderColor: '#1E3A8A',
                color: '#1E3A8A',
                bgcolor: '#fff',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '0.9375rem',
                '&:hover': { bgcolor: '#EEF2FF', borderColor: '#172554' },
              }}
            >
              제보하기
            </Button>
          </CardContent>
        </Card>
      )}

      {!routeRequest && (
        <Button
          variant="contained"
          startIcon={<Megaphone size={18} aria-hidden="true" />}
          onClick={() => setReportOpen(true)}
          sx={{
            position: 'absolute',
            top: 104,
            left: 12,
            right: 12,
            zIndex: 18,
            minHeight: 48,
            bgcolor: '#047857',
            borderRadius: '8px',
            boxShadow: '0 10px 28px rgba(15,23,42,0.10)',
            textTransform: 'none',
            fontSize: '0.9375rem',
            '&:hover': { bgcolor: '#065F46' },
          }}
        >
          제보하기
        </Button>
      )}

      {/* 우측 내 위치 버튼 (시트 위에 따라붙음) */}
      <Box
        sx={{
          position: 'absolute',
          right: 12,
          bottom: locateBottomStyle,
          zIndex: 15,
          transition: dragHeight !== null ? 'none' : 'bottom 0.25s ease',
        }}
      >
        <IconButton
          aria-label="내 위치로 이동"
          sx={{
            bgcolor: '#fff',
            width: 48,
            height: 48,
            boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
            '&:hover': { bgcolor: '#F3F4F6' },
            '&:focus-visible': {
              outline: '3px solid #1E3A8A',
              outlineOffset: 2,
            },
          }}
        >
          <Locate size={22} color="#1E3A8A" aria-hidden="true" />
        </IconButton>
      </Box>

      {/* 하단 시트 (드래그/탭으로 펼침·접힘) */}
      <Card
        component="section"
          aria-label={selected ? '선택한 시설 상세' : '주변 편의 시설 목록'}
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: sheetHeightStyle,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          overflow: 'hidden',
          zIndex: 15,
          boxShadow: '0 -8px 24px rgba(15,23,42,0.10)',
          display: 'flex',
          flexDirection: 'column',
          transition: dragHeight !== null ? 'none' : 'height 0.25s ease',
        }}
      >
        {/* 핸들 영역 (드래그/탭 토글) */}
        <Box
          role="button"
          tabIndex={0}
          aria-label={sheetExpanded ? '시설 정보 접기' : '시설 정보 펼치기'}
          aria-expanded={sheetExpanded}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSheetExpanded((v) => !v);
            }
          }}
          sx={{
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
            flexShrink: 0,
            px: 2,
            pt: 1.25,
            pb: 1,
            '&:active': { cursor: 'grabbing' },
            '&:focus-visible': {
              outline: '3px solid #1E3A8A',
              outlineOffset: -3,
            },
          }}
        >
          <Box aria-hidden="true" sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#D1D5DB' }} />
          </Box>

          {/* 미리보기 행 (접힌 상태에서 안내) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 40 }}>
            {selected ? (
              <>
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: categoryBg(selected.category),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {(() => {
                    const Icon = categoryIcon(selected.category);
                    return <Icon size={16} color={categoryColor(selected.category)} />;
                  })()}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: '#111827',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {selected.name}
                  </Typography>
                  <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    {categoryLabel(selected.category)} · {selected.distance}
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827' }}>
                  주변 편의 시설
                </Typography>
                <Box
                  component="span"
                  aria-label={`${visibleLocations.length}개`}
                  sx={{
                    bgcolor: '#EEF2FF',
                    color: '#1E3A8A',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    px: 0.875,
                    py: 0.125,
                    borderRadius: '999px',
                  }}
                >
                  {visibleLocations.length}
                </Box>
                <Box sx={{ flex: 1 }} />
                <Chip
                  icon={<Accessibility size={12} color="#065F46" aria-hidden="true" />}
                  label="이동 편의 확인"
                  size="small"
                  sx={{
                    bgcolor: '#D1FAE5',
                    color: '#065F46',
                    fontSize: '0.6875rem',
                    height: 22,
                    fontWeight: 700,
                    '& .MuiChip-icon': { color: '#065F46', ml: 0.5 },
                  }}
                />
              </>
            )}
            <Box
              aria-hidden="true"
              sx={{
                color: '#9CA3AF',
                display: 'flex',
                transform: sheetExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s ease',
                ml: 0.5,
              }}
            >
              <ChevronUp size={18} />
            </Box>
          </Box>
        </Box>

        {/* 펼친 상태 본문 */}
        <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {selected ? (
            <Box sx={{ px: 2, pb: 2.5, pt: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
                <IconButton
                  onClick={() => setSelected(null)}
                  aria-label="상세 닫고 목록으로 돌아가기"
                  sx={{ minWidth: 40, minHeight: 40 }}
                >
                  <X size={20} aria-hidden="true" />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1 }}>
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: categoryBg(selected.category),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {(() => {
                    const Icon = categoryIcon(selected.category);
                    return <Icon size={20} color={categoryColor(selected.category)} />;
                  })()}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                    <Chip
                      label={categoryLabel(selected.category)}
                      size="small"
                      sx={{
                        bgcolor: categoryBg(selected.category),
                        color: categoryColor(selected.category),
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        height: 20,
                      }}
                    />
                    <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                      {selected.distance}
                    </Typography>
                  </Box>
                  <Typography
                    component="h2"
                    sx={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827' }}
                  >
                    {selected.name}
                  </Typography>
                  <Typography sx={{ color: '#4B5563', fontSize: '0.8125rem' }}>
                    {selected.building}
                  </Typography>
                  {routeDestination?.id === selected.id && (
                    <Chip
                      label="오늘 수업 목적지"
                      size="small"
                      sx={{
                        mt: 0.75,
                        bgcolor: '#EEF2FF',
                        color: '#1E3A8A',
                        fontWeight: 800,
                      }}
                    />
                  )}
                </Box>
              </Box>

              <Typography
                component="h3"
                sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4B5563', mt: 1.5, mb: 0.875 }}
              >
                이동 편의 시설
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                {selected.features.map((f) => (
                  <Chip
                    key={f}
                    icon={<Accessibility size={12} aria-hidden="true" />}
                    label={f}
                    size="small"
                    sx={{
                      bgcolor: '#D1FAE5',
                      color: '#065F46',
                      fontSize: '0.75rem',
                      height: 24,
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: '#065F46', ml: 0.5 },
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Navigation size={18} aria-hidden="true" />}
                  aria-label={`${selected.name}까지 길찾기`}
                  sx={{
                    flex: 1,
                    bgcolor: '#1E3A8A',
                    color: '#fff',
                    minHeight: 48,
                    textTransform: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#172554' },
                  }}
                >
                  길찾기
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Star size={18} aria-hidden="true" />}
                  aria-label={`${selected.name} 즐겨찾기에 저장`}
                  sx={{
                    flex: 1,
                    color: '#111827',
                    borderColor: '#E5E7EB',
                    bgcolor: '#fff',
                    minHeight: 48,
                    textTransform: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' },
                  }}
                >
                  저장
                </Button>
              </Box>
            </Box>
          ) : (
            <List sx={{ p: 0, px: 1 }} aria-label="시설 목록">
              {visibleLocations.map((loc, idx) => {
                const Icon = categoryIcon(loc.category);
                const color = categoryColor(loc.category);
                const bg = categoryBg(loc.category);
                return (
                  <Box key={loc.id}>
                    <ListItemButton
                      onClick={() => setSelected(loc)}
                      aria-label={`${categoryLabel(loc.category)}, ${loc.name}, ${loc.building}, 거리 ${loc.distance}, 상세 보기`}
                      sx={{ borderRadius: '8px', px: 1, py: 1.25, minHeight: 64, gap: 1.25 }}
                    >
                      <Box
                        aria-hidden="true"
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} color={color} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: '0.9375rem',
                            fontWeight: 700,
                            color: '#111827',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {loc.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.8125rem',
                            color: '#4B5563',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {categoryLabel(loc.category)} · {loc.building} · {loc.distance}
                        </Typography>
                      </Box>
                      <ChevronRight size={18} color="#9CA3AF" aria-hidden="true" />
                    </ListItemButton>
                    {idx < visibleLocations.length - 1 && <Divider component="li" />}
                  </Box>
                );
              })}
            </List>
          )}
        </Box>
      </Card>

      {/* 검색 Drawer */}
      <Drawer
        anchor="top"
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        PaperProps={{ sx: { height: '100%' }, 'aria-label': '시설 검색' }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => setSearchOpen(false)}
            aria-label="검색 닫고 지도로 돌아가기"
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </IconButton>
          <TextField
            autoFocus
            fullWidth
            label="건물·시설 검색"
            placeholder="예: 중앙도서관"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            inputProps={{
              'aria-label': '건물 또는 시설 이름 입력',
              autoComplete: 'off',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} aria-hidden="true" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    aria-label="검색어 지우기"
                  >
                    <X size={16} aria-hidden="true" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '999px' } }}
          />
        </Box>
        <Divider />

        {searchQuery ? (
          <Box role="region" aria-live="polite" aria-label={`검색 결과 ${filteredBySearch.length}건`}>
            <List>
              {filteredBySearch.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography sx={{ color: '#4B5563' }}>검색 결과가 없어요</Typography>
                </Box>
              ) : (
                filteredBySearch.map((loc) => {
                  const Icon = categoryIcon(loc.category);
                  return (
                    <ListItemButton
                      key={loc.id}
                      onClick={() => {
                        setSelected(loc);
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      aria-label={`${categoryLabel(loc.category)}, ${loc.name}, ${loc.building}, 거리 ${loc.distance}, 선택`}
                      sx={{ minHeight: 56 }}
                    >
                      <Box
                        aria-hidden="true"
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: categoryBg(loc.category),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}
                      >
                        <Icon size={20} color={categoryColor(loc.category)} />
                      </Box>
                      <ListItemText
                        primary={loc.name}
                        secondary={`${categoryLabel(loc.category)} · ${loc.building} · ${loc.distance}`}
                        primaryTypographyProps={{ fontSize: '0.9375rem', fontWeight: 600 }}
                        secondaryTypographyProps={{ fontSize: '0.8125rem', color: '#4B5563' }}
                      />
                    </ListItemButton>
                  );
                })
              )}
            </List>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography
              component="h2"
              sx={{ fontSize: '0.875rem', color: '#4B5563', mb: 1, fontWeight: 600 }}
            >
              최근 검색
            </Typography>
            <List aria-label="최근 검색 목록" sx={{ p: 0 }}>
              {recentSearches.map((q) => (
                <ListItemButton
                  key={q}
                  onClick={() => setSearchQuery(q)}
                  aria-label={`최근 검색어 ${q} 사용`}
                  sx={{ minHeight: 48 }}
                >
                  <Clock size={16} style={{ marginRight: 12, color: '#6B7280' }} aria-hidden="true" />
                  <ListItemText primary={q} primaryTypographyProps={{ fontSize: '0.9375rem' }} />
                </ListItemButton>
              ))}
            </List>

            <Typography
              component="h2"
              sx={{ fontSize: '0.875rem', color: '#4B5563', mt: 3, mb: 1, fontWeight: 600 }}
            >
              카테고리로 찾기
            </Typography>
            <Box
              role="list"
              sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}
            >
              {categories.slice(1).map((cat) => {
                const Icon = cat.icon;
                return (
                  <ButtonBase
                    key={cat.id}
                    role="listitem"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSearchOpen(false);
                    }}
                    aria-label={`${cat.label} 카테고리로 필터링`}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 1.5,
                      borderRadius: '8px',
                      bgcolor: '#fff',
                      border: '1px solid #E5E7EB',
                      minHeight: 64,
                      '&:hover': { bgcolor: '#F9FAFB' },
                      '&:focus-visible': {
                        outline: '3px solid #1E3A8A',
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        bgcolor: `${cat.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={20} color={cat.color} />
                    </Box>
                    <Typography sx={{ fontSize: '0.9375rem' }}>{cat.label}</Typography>
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>
        )}
      </Drawer>
      <CompanionTicketDialog
        open={companionOpen}
        onClose={() => setCompanionOpen(false)}
        routeRequest={routeRequest}
      />
      <AccessibilityReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        defaultPlaceName={selected?.name ?? routeRequest?.destinationName ?? '공학관 후문 경사로'}
      />
    </Box>
  );
}

function RouteCompareCard({
  option,
  safetyDescription,
}: {
  option: (typeof routeComparisonOptions)[number];
  safetyDescription: string;
}) {
  const description = option.id === 'safe' ? safetyDescription : option.description;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: '8px',
        bgcolor: option.bg,
        border: `2px solid ${option.border}`,
        minHeight: 172,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Typography sx={{ color: option.color, fontSize: '1.125rem', fontWeight: 900 }}>
          {option.title}
        </Typography>
        {option.badge && (
          <Chip
            label={option.badge}
            size="small"
            sx={{
              bgcolor: '#047857',
              color: '#fff',
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 900,
            }}
          />
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.75 }}>
        <Box>
          <Typography sx={{ color: '#4B5563', fontSize: '0.75rem', fontWeight: 800 }}>
            예상 시간
          </Typography>
          <Typography sx={{ color: '#111827', fontSize: '1.375rem', fontWeight: 900 }}>
            {option.minutes}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ color: '#4B5563', fontSize: '0.75rem', fontWeight: 800 }}>
            주의할 점
          </Typography>
          <Typography sx={{ color: option.color, fontSize: '0.9375rem', fontWeight: 900 }}>
            {option.caution}
          </Typography>
        </Box>
      </Box>

      <Typography sx={{ color: '#374151', fontSize: '0.9375rem', fontWeight: 700, mt: 'auto' }}>
        {description}
      </Typography>
    </Box>
  );
}

function RiskPointMarker({ risk }: { risk: RouteRiskPoint }) {
  const color = risk.level === '높음' ? '#D97706' : '#F59E0B';

  return (
    <Box
      aria-label={`${risk.title}, ${risk.description}`}
      role="img"
      sx={{
        position: 'absolute',
        left: `${risk.x}%`,
        top: `${risk.y}%`,
        transform: 'translate(-50%, -100%)',
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          bgcolor: '#FFFBEB',
          border: `2px solid ${color}`,
          borderRadius: '999px',
          px: 0.875,
          py: 0.5,
          boxShadow: '0 4px 12px rgba(146,64,14,0.16)',
        }}
      >
        <AlertTriangle size={15} color={color} aria-hidden="true" />
        <Typography sx={{ color, fontSize: '0.75rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
          {risk.title}
        </Typography>
      </Box>
    </Box>
  );
}
