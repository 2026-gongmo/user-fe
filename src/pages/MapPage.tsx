import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Card,
  Chip,
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  ButtonBase,
  Button,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search,
  Accessibility,
  Navigation,
  ArrowLeft,
  X,
  Locate,
  ChevronUp,
  Footprints,
  Volume2,
  BatteryCharging,
  DoorOpen,
  Camera,
  Eye,
  TriangleAlert,
} from 'lucide-react';

import {
  landmarks,
  landmarkByName,
  getRoute,
  availableProfiles,
  poi,
  forbiddenSegments,
  SNU_CENTER,
  PROFILE_META,
  type RouteProfile,
  type LatLon,
} from '../data/snuRouting';

type LayerKey = 'tactile' | 'sound' | 'charger' | 'toilet' | 'cctv' | 'forbidden';

const LAYER_META: Record<
  LayerKey,
  { label: string; icon: typeof Footprints; color: string; count: number }
> = {
  tactile: { label: '점자블록', icon: Footprints, color: '#0F766E', count: poi.tactile.length },
  sound: { label: '음향신호', icon: Volume2, color: '#7C3AED', count: poi.sound_signals.length },
  charger: { label: '휠체어 충전', icon: BatteryCharging, color: '#0EA5E9', count: poi.chargers.length },
  toilet: { label: '화장실', icon: DoorOpen, color: '#16A34A', count: poi.amenities.toilets.length },
  cctv: { label: 'CCTV', icon: Camera, color: '#64748B', count: poi.cctv.length },
  forbidden: {
    label: '계단·거부',
    icon: TriangleAlert,
    color: '#DC2626',
    count: forbiddenSegments.length,
  },
};

const SHEET_COLLAPSED = 120;
const SHEET_MAX = 520;

const getExpandedPx = () =>
  typeof window === 'undefined' ? 460 : Math.min(window.innerHeight * 0.6, SHEET_MAX);

const landmarkIcon = (selected: boolean) =>
  L.divIcon({
    className: 'snu-landmark-icon',
    iconSize: [selected ? 36 : 30, selected ? 36 : 30],
    iconAnchor: [selected ? 18 : 15, selected ? 36 : 30],
    html: `<div style="
      width:${selected ? 36 : 30}px;
      height:${selected ? 36 : 30}px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:#1E3A8A;
      border:2px solid #fff;
      box-shadow:0 4px 10px rgba(0,0,0,${selected ? 0.45 : 0.3});
      display:flex;align-items:center;justify-content:center;
    "><div style="transform:rotate(45deg);color:#fff;font-weight:700;font-size:${selected ? 14 : 12}px;">★</div></div>`,
  });

function FitToCampus() {
  const map = useMap();
  useEffect(() => {
    map.setView(SNU_CENTER as L.LatLngExpression, 15);
  }, [map]);
  return null;
}

function FitBounds({ coords }: { coords: LatLon[] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!coords || coords.length < 2) return;
    const bounds = L.latLngBounds(coords.map(([la, lo]) => [la, lo] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
  }, [coords, map]);
  return null;
}

export default function MapPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const [origin, setOrigin] = useState<string>('중앙도서관');
  const [destination, setDestination] = useState<string>('공학관');
  const [profile, setProfile] = useState<RouteProfile>('wheelchair');

  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    tactile: true,
    sound: false,
    charger: true,
    toilet: false,
    cctv: false,
    forbidden: true,
  });

  const [sheetExpanded, setSheetExpanded] = useState(true);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const dragRef = useRef<{ startY: number; startH: number; active: boolean; moved: boolean }>({
    startY: 0,
    startH: 0,
    active: false,
    moved: false,
  });

  const selected = selectedName ? landmarkByName.get(selectedName) ?? null : null;
  const route = useMemo(() => getRoute(origin, destination, profile), [origin, destination, profile]);
  const profiles = useMemo(() => availableProfiles(origin, destination), [origin, destination]);

  const filteredLandmarks = landmarks.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
    if (dragRef.current.moved) setSheetExpanded(finalH >= mid);
    else setSheetExpanded((v) => !v);
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
        ? `min(60vh, ${SHEET_MAX}px)`
        : `${SHEET_COLLAPSED}px`;

  const swapOd = () => {
    setOrigin(destination);
    setDestination(origin);
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
        서울대 캠퍼스 배리어프리 지도
      </Typography>

      <Box sx={{ position: 'absolute', inset: 0 }}>
        <MapContainer
          center={SNU_CENTER as L.LatLngExpression}
          zoom={15}
          minZoom={13}
          maxZoom={19}
          scrollWheelZoom
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {layers.forbidden &&
            forbiddenSegments.map((seg, i) => (
              <Polyline
                key={`fb-${i}`}
                positions={seg.coords as [number, number][]}
                pathOptions={{
                  color: '#DC2626',
                  weight: 3,
                  opacity: 0.7,
                  dashArray: '4 5',
                }}
              />
            ))}

          {route && (
            <Polyline
              positions={route.coords as [number, number][]}
              pathOptions={{
                color: PROFILE_META[profile].color,
                weight: 6,
                opacity: 0.9,
              }}
            />
          )}

          {layers.tactile &&
            poi.tactile.map(([la, lo], i) => (
              <CircleMarker
                key={`t-${i}`}
                center={[la, lo]}
                radius={5}
                pathOptions={{ color: '#0F766E', fillColor: '#0F766E', fillOpacity: 0.85, weight: 1 }}
              >
                <Tooltip>점자블록 (OSM tactile_paving)</Tooltip>
              </CircleMarker>
            ))}

          {layers.sound &&
            poi.sound_signals.map(([la, lo], i) => (
              <CircleMarker
                key={`s-${i}`}
                center={[la, lo]}
                radius={5}
                pathOptions={{ color: '#7C3AED', fillColor: '#7C3AED', fillOpacity: 0.85, weight: 1 }}
              >
                <Tooltip>음향신호기 (서울 OA-15543)</Tooltip>
              </CircleMarker>
            ))}

          {layers.charger &&
            poi.chargers.map(([la, lo, name], i) => (
              <CircleMarker
                key={`c-${i}`}
                center={[la, lo]}
                radius={7}
                pathOptions={{ color: '#0EA5E9', fillColor: '#0EA5E9', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip>{name ? `휠체어 충전: ${name}` : '휠체어 충전기'}</Tooltip>
              </CircleMarker>
            ))}

          {layers.toilet &&
            poi.amenities.toilets.map(([la, lo], i) => (
              <CircleMarker
                key={`wc-${i}`}
                center={[la, lo]}
                radius={4}
                pathOptions={{ color: '#16A34A', fillColor: '#16A34A', fillOpacity: 0.8, weight: 1 }}
              >
                <Tooltip>화장실</Tooltip>
              </CircleMarker>
            ))}

          {layers.cctv &&
            poi.cctv.map(([la, lo], i) => (
              <CircleMarker
                key={`cc-${i}`}
                center={[la, lo]}
                radius={3}
                pathOptions={{ color: '#64748B', fillColor: '#64748B', fillOpacity: 0.7, weight: 1 }}
              >
                <Tooltip>CCTV</Tooltip>
              </CircleMarker>
            ))}

          {landmarks.map((l) => {
            const isSel = selectedName === l.name;
            const isOd = origin === l.name || destination === l.name;
            return (
              <Marker
                key={l.name}
                position={[l.lat, l.lon]}
                icon={landmarkIcon(isSel || isOd)}
                eventHandlers={{ click: () => setSelectedName(l.name) }}
              >
                <Tooltip direction="top" offset={[0, -28]}>
                  {l.name}
                  {origin === l.name ? ' · 출발' : ''}
                  {destination === l.name ? ' · 도착' : ''}
                </Tooltip>
              </Marker>
            );
          })}

          {route && <FitBounds coords={route.coords} />}
          {!route && <FitToCampus />}
        </MapContainer>
      </Box>

      {/* 상단 검색 + 프로파일 */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <ButtonBase
          onClick={() => setSearchOpen(true)}
          aria-label="캠퍼스 랜드마크 검색"
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
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
          }}
        >
          <Search size={20} color="#4B5563" aria-hidden="true" />
          <Typography sx={{ color: '#4B5563', fontSize: '0.9375rem' }}>
            캠퍼스 랜드마크 검색
          </Typography>
        </ButtonBase>

        <Box
          role="group"
          aria-label="접근성 프로파일"
          sx={{
            display: 'flex',
            gap: 0.75,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {(Object.keys(PROFILE_META) as RouteProfile[]).map((p) => {
            const meta = PROFILE_META[p];
            const active = profile === p;
            const unavailable = profiles.length > 0 && !profiles.includes(p);
            return (
              <ButtonBase
                key={p}
                onClick={() => setProfile(p)}
                aria-pressed={active}
                disabled={unavailable}
                sx={{
                  minHeight: 34,
                  px: 1.5,
                  borderRadius: '999px',
                  bgcolor: active ? meta.color : '#fff',
                  color: active ? '#fff' : unavailable ? '#9CA3AF' : '#111827',
                  border: active ? 'none' : '1px solid #E5E7EB',
                  boxShadow: active
                    ? `0 3px 10px ${meta.color}55`
                    : '0 2px 6px rgba(0,0,0,0.10)',
                  flexShrink: 0,
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  opacity: unavailable ? 0.5 : 1,
                  gap: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {active && <Eye size={12} aria-hidden="true" />}
                <span>{meta.label}</span>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      {/* 내 위치 버튼 */}
      <Box
        sx={{
          position: 'absolute',
          right: 12,
          bottom: `calc(${sheetHeightStyle} + 12px)`,
          zIndex: 999,
          transition: dragHeight !== null ? 'none' : 'bottom 0.25s ease',
        }}
      >
        <IconButton
          aria-label="캠퍼스 중심으로 이동"
          onClick={() => {
            setSelectedName(null);
          }}
          sx={{
            bgcolor: '#fff',
            width: 48,
            height: 48,
            boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
          }}
        >
          <Locate size={22} color="#1E3A8A" aria-hidden="true" />
        </IconButton>
      </Box>

      {/* 하단 시트 */}
      <Card
        component="section"
        aria-label="라우팅 및 POI 패널"
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: sheetHeightStyle,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          overflow: 'hidden',
          zIndex: 1000,
          boxShadow: '0 -6px 24px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          transition: dragHeight !== null ? 'none' : 'height 0.25s ease',
        }}
      >
        <Box
          role="button"
          tabIndex={0}
          aria-label={sheetExpanded ? '패널 접기' : '패널 펼치기'}
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
          }}
        >
          <Box aria-hidden="true" sx={{ display: 'flex', justifyContent: 'center', mb: 0.75 }}>
            <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#D1D5DB' }} />
          </Box>

          {/* 출발/도착/스왑 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Select
              size="small"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              aria-label="출발지"
              sx={{ flex: 1, fontSize: '0.875rem', fontWeight: 700 }}
            >
              {landmarks.map((l) => (
                <MenuItem key={l.name} value={l.name} disabled={l.name === destination}>
                  {l.name}
                </MenuItem>
              ))}
            </Select>
            <IconButton
              size="small"
              onClick={swapOd}
              aria-label="출발/도착 바꾸기"
              sx={{ bgcolor: '#F3F4F6' }}
            >
              <Navigation size={16} />
            </IconButton>
            <Select
              size="small"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              aria-label="도착지"
              sx={{ flex: 1, fontSize: '0.875rem', fontWeight: 700 }}
            >
              {landmarks.map((l) => (
                <MenuItem key={l.name} value={l.name} disabled={l.name === origin}>
                  {l.name}
                </MenuItem>
              ))}
            </Select>
            <Box
              aria-hidden="true"
              sx={{
                color: '#9CA3AF',
                display: 'flex',
                transform: sheetExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s ease',
                ml: 0.25,
              }}
            >
              <ChevronUp size={18} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, px: 2, pb: 2 }}>
          {/* 라우트 요약 카드 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.25,
              borderRadius: 2,
              bgcolor: `${PROFILE_META[profile].color}10`,
              border: `1px solid ${PROFILE_META[profile].color}33`,
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: PROFILE_META[profile].color,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontWeight: 800,
              }}
            >
              {PROFILE_META[profile].label[0]}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                {PROFILE_META[profile].sub}
              </Typography>
              {route ? (
                <Typography
                  sx={{
                    fontSize: '0.9375rem',
                    fontWeight: 800,
                    color: '#111827',
                  }}
                >
                  {Math.round(route.length_m)}m · 계단 {route.steps_hit}곳
                </Typography>
              ) : (
                <Typography sx={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                  이 프로필 경로 없음 (다른 프로필 선택)
                </Typography>
              )}
            </Box>
            {route && profile !== 'normal' && (() => {
              const base = getRoute(origin, destination, 'normal');
              if (!base) return null;
              const diff = Math.round(route.length_m - base.length_m);
              return (
                <Chip
                  size="small"
                  label={`${diff >= 0 ? '+' : ''}${diff}m`}
                  sx={{
                    bgcolor: diff > 0 ? '#FEF3C7' : '#DCFCE7',
                    color: diff > 0 ? '#92400E' : '#166534',
                    fontWeight: 700,
                  }}
                />
              );
            })()}
          </Box>

          {/* 프로필 비교 미니 표 */}
          <Typography
            component="h3"
            sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', mb: 0.75 }}
          >
            프로파일별 거리 비교
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
            {(Object.keys(PROFILE_META) as RouteProfile[]).map((p) => {
              const r = getRoute(origin, destination, p);
              const meta = PROFILE_META[p];
              return (
                <ButtonBase
                  key={p}
                  onClick={() => r && setProfile(p)}
                  disabled={!r}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                    bgcolor: profile === p ? `${meta.color}15` : 'transparent',
                    justifyContent: 'flex-start',
                    opacity: r ? 1 : 0.4,
                  }}
                >
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: meta.color }} />
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', minWidth: 60 }}>
                    {meta.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#374151', flex: 1 }}>
                    {r ? `${Math.round(r.length_m)}m` : '경로 없음'}
                  </Typography>
                  {r && r.steps_hit > 0 && (
                    <Chip
                      size="small"
                      label={`계단 ${r.steps_hit}`}
                      sx={{ height: 18, fontSize: '0.6875rem', bgcolor: '#FEE2E2', color: '#991B1B' }}
                    />
                  )}
                </ButtonBase>
              );
            })}
          </Box>

          {/* POI 레이어 토글 */}
          <Typography
            component="h3"
            sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', mb: 0.75 }}
          >
            지도 레이어
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 0.5,
              mb: 1.5,
            }}
          >
            {(Object.keys(LAYER_META) as LayerKey[]).map((k) => {
              const meta = LAYER_META[k];
              const Icon = meta.icon;
              return (
                <FormControlLabel
                  key={k}
                  control={
                    <Switch
                      size="small"
                      checked={layers[k]}
                      onChange={(_e, v) => setLayers((prev) => ({ ...prev, [k]: v }))}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.625 }}>
                      <Icon size={14} color={meta.color} aria-hidden="true" />
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {meta.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>
                        {meta.count}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0 }}
                />
              );
            })}
          </Box>

          {/* 선택된 랜드마크 액션 */}
          {selected && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: '#111827', flex: 1 }}>
                  선택: {selected.name}
                </Typography>
                <IconButton size="small" onClick={() => setSelectedName(null)} aria-label="선택 해제">
                  <X size={16} />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setOrigin(selected.name)}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                >
                  출발로
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setDestination(selected.name)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    bgcolor: '#1E3A8A',
                  }}
                >
                  도착으로
                </Button>
              </Box>
            </>
          )}

          <Typography
            sx={{
              fontSize: '0.6875rem',
              color: '#9CA3AF',
              mt: 1.5,
              textAlign: 'center',
            }}
          >
            © OpenStreetMap contributors · 서울 OA-15543 · data.go.kr 15034533
          </Typography>
        </Box>
      </Card>

      {/* 검색 Drawer */}
      <Drawer
        anchor="top"
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        PaperProps={{ sx: { height: '100%' } }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => setSearchOpen(false)} aria-label="검색 닫기">
            <ArrowLeft size={22} />
          </IconButton>
          <Box
            component="input"
            autoFocus
            placeholder="랜드마크 검색 (예: 중앙도서관)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              minHeight: 44,
              border: '1px solid #E5E7EB',
              borderRadius: 999,
              px: 2,
              fontSize: '0.9375rem',
              outline: 'none',
              '&:focus': { borderColor: '#1E3A8A' },
            }}
          />
          {searchQuery && (
            <IconButton size="small" onClick={() => setSearchQuery('')} aria-label="검색어 지우기">
              <X size={16} />
            </IconButton>
          )}
        </Box>
        <Divider />
        <List>
          {filteredLandmarks.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: '#6B7280' }}>검색 결과가 없습니다</Box>
          ) : (
            filteredLandmarks.map((l) => (
              <ListItemButton
                key={l.name}
                onClick={() => {
                  setSelectedName(l.name);
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                sx={{ minHeight: 56 }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Accessibility size={18} color="#1E3A8A" />
                </Box>
                <ListItemText
                  primary={l.name}
                  secondary={`${l.lat.toFixed(5)}, ${l.lon.toFixed(5)}`}
                  primaryTypographyProps={{ fontSize: '0.9375rem', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '0.75rem', color: '#9CA3AF' }}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Drawer>
    </Box>
  );
}
