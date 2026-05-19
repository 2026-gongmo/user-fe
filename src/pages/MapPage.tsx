import { useState } from 'react';
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
  Fab,
  ButtonBase,
  Button,
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
  Layers,
  Plus,
  Minus,
  Star,
  Clock,
} from 'lucide-react';

import { facilities as locations, recentFacilitySearches as recentSearches } from '../data/mockData';
import type { Facility as Location } from '../types';

const categories = [
  { id: 'all', label: '전체', icon: Building2, color: '#4338CA' },
  { id: 'elevator', label: '엘리베이터', icon: MoveVertical, color: '#B45309' },
  { id: 'ramp', label: '경사로', icon: Accessibility, color: '#047857' },
  { id: 'restroom', label: '화장실', icon: DoorOpen, color: '#BE185D' },
] as const;

const categoryColor = (cat: Location['category']) => {
  switch (cat) {
    case 'elevator':
      return '#B45309';
    case 'ramp':
      return '#047857';
    case 'restroom':
      return '#BE185D';
    default:
      return '#4338CA';
  }
};

const categoryLabel = (cat: Location['category']) => {
  switch (cat) {
    case 'elevator':
      return '엘리베이터';
    case 'ramp':
      return '경사로';
    case 'restroom':
      return '화장실';
    default:
      return '건물';
  }
};

export default function MapPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selected, setSelected] = useState<Location | null>(null);

  const visibleLocations =
    selectedCategory === 'all'
      ? locations
      : locations.filter((l) => l.category === selectedCategory);

  const filteredBySearch = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.building.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Box
      component="main"
      lang="ko"
      sx={{ position: 'relative', height: 'calc(100vh - 56px)', overflow: 'hidden' }}
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
        캠퍼스 배리어프리 지도
      </Typography>

      {/* 지도 배경 (장식) */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #E8F1F5 0%, #DCEAE4 50%, #E5EBF3 100%)',
          overflow: 'hidden',
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

      {/* 지도 영역 (대안 텍스트) */}
      <Box
        role="application"
        aria-label={`캠퍼스 지도. 현재 ${categoryLabel(
          (selectedCategory === 'all' ? 'building' : (selectedCategory as Location['category'])),
        )} ${visibleLocations.length}개 표시 중. 아래 목록에서도 동일한 시설을 확인할 수 있습니다.`}
        sx={{ position: 'absolute', inset: 0 }}
      >
        {/* 마커 */}
        {visibleLocations.map((loc) => {
          const color = categoryColor(loc.category);
          const isSelected = selected?.id === loc.id;
          return (
            <ButtonBase
              key={loc.id}
              onClick={() => setSelected(loc)}
              aria-label={`${categoryLabel(loc.category)}, ${loc.name}, ${loc.building}, 거리 ${loc.distance}${
                loc.accessible ? ', 접근 가능' : ''
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
                  boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                  border: '2px solid #fff',
                }}
              >
                <Box sx={{ transform: 'rotate(45deg)', display: 'flex' }}>
                  <Accessibility size={isSelected ? 24 : 20} color="#fff" aria-hidden="true" />
                </Box>
              </Box>
            </ButtonBase>
          );
        })}

        {/* 내 위치 (장식) */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            left: '50%',
            top: '75%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              bgcolor: '#4338CA',
              border: '3px solid #fff',
              boxShadow: '0 0 0 6px rgba(67,56,202,0.25)',
            }}
          />
        </Box>
      </Box>

      {/* 상단 검색바 */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          zIndex: 20,
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
              outline: '3px solid #4338CA',
              outlineOffset: 2,
            },
          }}
        >
          <Search size={20} color="#4B5563" aria-hidden="true" />
          <Typography sx={{ color: '#4B5563', flex: 1, textAlign: 'left', fontSize: '0.9375rem' }}>
            건물·시설 검색 (예: 중앙도서관)
          </Typography>
        </ButtonBase>

        {/* 카테고리 필터 */}
        <Box
          role="group"
          aria-label="시설 종류 필터"
          sx={{ display: 'flex', gap: 1, mt: 1.25, overflowX: 'auto', pb: 0.5 }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <Chip
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                icon={<Icon size={16} color={active ? '#fff' : cat.color} aria-hidden="true" />}
                label={cat.label}
                role="button"
                aria-pressed={active}
                aria-label={`${cat.label} 필터${active ? ', 선택됨' : ''}`}
                sx={{
                  bgcolor: active ? cat.color : '#fff',
                  color: active ? '#fff' : '#111827',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  height: 36,
                  px: 0.5,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  border: active ? 'none' : '1px solid #D1D5DB',
                  '&:hover': { bgcolor: active ? cat.color : '#F3F4F6' },
                  '& .MuiChip-icon': { color: active ? '#fff' : cat.color },
                  '&:focus-visible': {
                    outline: '3px solid #4338CA',
                    outlineOffset: 2,
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* 지도 컨트롤 */}
      <Box
        role="group"
        aria-label="지도 컨트롤"
        sx={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 15,
        }}
      >
        <Card sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <IconButton
            sx={{ borderRadius: 0, width: 48, height: 48 }}
            aria-label="지도 확대"
          >
            <Plus size={20} aria-hidden="true" />
          </IconButton>
          <Divider />
          <IconButton
            sx={{ borderRadius: 0, width: 48, height: 48 }}
            aria-label="지도 축소"
          >
            <Minus size={20} aria-hidden="true" />
          </IconButton>
        </Card>
        <Fab
          size="medium"
          aria-label="지도 레이어 변경"
          sx={{ bgcolor: '#fff', width: 48, height: 48, '&:hover': { bgcolor: '#F3F4F6' } }}
        >
          <Layers size={20} color="#1F2937" aria-hidden="true" />
        </Fab>
        <Fab
          size="medium"
          aria-label="내 위치로 이동"
          sx={{ bgcolor: '#fff', width: 48, height: 48, '&:hover': { bgcolor: '#F3F4F6' } }}
        >
          <Locate size={20} color="#4338CA" aria-hidden="true" />
        </Fab>
      </Box>

      {/* 하단 시트 */}
      <Card
        component="section"
        aria-label={selected ? '선택한 시설 상세' : '주변 접근가능 시설 목록'}
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          maxHeight: '50%',
          overflow: 'auto',
          zIndex: 15,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.1)',
        }}
      >
        <Box
          aria-hidden="true"
          sx={{ display: 'flex', justifyContent: 'center', pt: 1.25, pb: 0.5 }}
        >
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: '#9CA3AF' }} />
        </Box>

        {selected ? (
          <CardContent sx={{ pt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography component="h2" sx={{ fontSize: '1.125rem', fontWeight: 700 }}>
                  {selected.name}
                </Typography>
                <Typography sx={{ color: '#4B5563', fontSize: '0.875rem', mt: 0.25 }}>
                  {categoryLabel(selected.category)} · {selected.building} · {selected.distance}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setSelected(null)}
                aria-label="상세 닫고 목록으로 돌아가기"
                sx={{ minWidth: 44, minHeight: 44 }}
              >
                <X size={20} aria-hidden="true" />
              </IconButton>
            </Box>

            <Typography
              component="h3"
              sx={{ fontSize: '0.875rem', fontWeight: 600, mt: 2, mb: 1, color: '#1F2937' }}
            >
              접근 편의 시설
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {selected.features.map((f) => (
                <Chip
                  key={f}
                  icon={<Accessibility size={12} aria-hidden="true" />}
                  label={f}
                  size="small"
                  sx={{
                    bgcolor: '#D1FAE5',
                    color: '#065F46',
                    fontSize: '0.8125rem',
                    height: 26,
                    '& .MuiChip-icon': { color: '#065F46', ml: 0.5 },
                  }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 2.5 }}>
              <Button
                variant="contained"
                startIcon={<Navigation size={18} aria-hidden="true" />}
                aria-label={`${selected.name}까지 길찾기`}
                sx={{
                  flex: 1,
                  bgcolor: '#4338CA',
                  color: '#fff',
                  minHeight: 48,
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  '&:hover': { bgcolor: '#3730A3' },
                  boxShadow: 'none',
                }}
              >
                길찾기
              </Button>
              <Button
                variant="contained"
                startIcon={<Star size={18} aria-hidden="true" />}
                aria-label={`${selected.name} 즐겨찾기에 저장`}
                sx={{
                  flex: 1,
                  bgcolor: '#F3F4F6',
                  color: '#111827',
                  minHeight: 48,
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  '&:hover': { bgcolor: '#E5E7EB' },
                  boxShadow: 'none',
                }}
              >
                저장
              </Button>
            </Box>
          </CardContent>
        ) : (
          <CardContent sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography component="h2" sx={{ fontSize: '1rem', fontWeight: 700 }}>
                주변 접근가능 시설 ({visibleLocations.length})
              </Typography>
              <Chip
                icon={<Accessibility size={14} color="#065F46" aria-hidden="true" />}
                label="모두 접근가능"
                size="small"
                sx={{ bgcolor: '#D1FAE5', color: '#065F46', fontSize: '0.8125rem' }}
              />
            </Box>
            <List sx={{ p: 0 }} aria-label="시설 목록">
              {visibleLocations.map((loc, idx) => (
                <Box key={loc.id}>
                  <ListItemButton
                    onClick={() => setSelected(loc)}
                    aria-label={`${categoryLabel(loc.category)}, ${loc.name}, ${loc.building}, 거리 ${loc.distance}, 상세 보기`}
                    sx={{ borderRadius: '8px', px: 1, minHeight: 56 }}
                  >
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        bgcolor: `${categoryColor(loc.category)}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1.5,
                      }}
                    >
                      <Accessibility size={20} color={categoryColor(loc.category)} />
                    </Box>
                    <ListItemText
                      primary={loc.name}
                      secondary={`${categoryLabel(loc.category)} · ${loc.building} · ${loc.distance}`}
                      primaryTypographyProps={{ fontSize: '0.9375rem', fontWeight: 600 }}
                      secondaryTypographyProps={{ fontSize: '0.8125rem', color: '#4B5563' }}
                    />
                  </ListItemButton>
                  {idx < visibleLocations.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          </CardContent>
        )}
      </Card>

      {/* 검색 화면 */}
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
                  <Typography sx={{ color: '#4B5563' }}>검색 결과가 없습니다</Typography>
                </Box>
              ) : (
                filteredBySearch.map((loc) => (
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
                        bgcolor: `${categoryColor(loc.category)}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}
                    >
                      <Accessibility size={20} color={categoryColor(loc.category)} />
                    </Box>
                    <ListItemText
                      primary={loc.name}
                      secondary={`${categoryLabel(loc.category)} · ${loc.building} · ${loc.distance}`}
                      primaryTypographyProps={{ fontSize: '0.9375rem' }}
                      secondaryTypographyProps={{ fontSize: '0.8125rem', color: '#4B5563' }}
                    />
                  </ListItemButton>
                ))
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
                      borderRadius: '12px',
                      bgcolor: '#fff',
                      border: '1px solid #E5E7EB',
                      minHeight: 64,
                      '&:hover': { bgcolor: '#F9FAFB' },
                      '&:focus-visible': {
                        outline: '3px solid #4338CA',
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
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
    </Box>
  );
}
