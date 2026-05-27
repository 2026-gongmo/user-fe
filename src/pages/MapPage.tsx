import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
  useMapEvents,
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
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search,
  Accessibility,
  Navigation,
  ArrowLeft,
  X,
  Locate,
  Footprints,
  Volume2,
  BatteryCharging,
  DoorOpen,
  Camera,
  TriangleAlert,
  Flag,
  MapPin,
  Route as RouteIcon,
  Repeat2,
  ChevronRight,
  Layers,
} from 'lucide-react';

import AccessibilityReportDialog from '../components/AccessibilityReportDialog';
import type { AccessibilityReport } from '../types';

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
  type Landmark,
} from '../data/snuRouting';

type LayerKey = 'tactile' | 'sound' | 'charger' | 'toilet' | 'cctv' | 'forbidden';
type MapMode = 'browse' | 'place' | 'route' | 'navigate';
type SearchPurpose = 'browse' | 'origin' | 'destination';

const WALK_SPEED_MPM = 67; // 평균 보행 약 4km/h ≒ 67m/min
const etaMinutes = (m: number) => Math.max(1, Math.round(m / WALK_SPEED_MPM));

interface Place {
  name: string;
  lat: number;
  lon: number;
  isCurrent?: boolean;
}

// 데모용 "내 위치" — 실제로는 브라우저 Geolocation으로 대체 가능
const CURRENT_LOCATION_PLACE: Place = {
  name: '내 위치 (정문 근처)',
  lat: 37.46568,
  lon: 126.94831,
  isCurrent: true,
};

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
const SHEET_MAX = 540;
const getExpandedPx = () =>
  typeof window === 'undefined' ? 460 : Math.min(window.innerHeight * 0.62, SHEET_MAX);

const placeIcon = (kind: 'origin' | 'destination' | 'picked' | 'landmark', large = false) => {
  const color =
    kind === 'origin' ? '#16A34A' :
    kind === 'destination' ? '#DC2626' :
    kind === 'picked' ? '#F59E0B' :
    '#1E3A8A';
  const size = large ? 38 : 30;
  return L.divIcon({
    className: 'snu-landmark-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:${color};
      border:2px solid #fff;
      box-shadow:0 4px 10px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
    "><div style="transform:rotate(45deg);color:#fff;font-weight:800;font-size:${large ? 14 : 12}px;">
      ${kind === 'origin' ? '출' : kind === 'destination' ? '도' : '★'}
    </div></div>`,
  });
};

function FlyTo({ lat, lon, zoom }: { lat: number; lon: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon] as L.LatLngExpression, zoom ?? Math.max(map.getZoom(), 17), {
      duration: 0.6,
    });
  }, [lat, lon, zoom, map]);
  return null;
}

function FitBounds({ coords }: { coords: LatLon[] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!coords || coords.length < 2) return;
    const bounds = L.latLngBounds(coords.map(([la, lo]) => [la, lo] as [number, number]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
  }, [coords, map]);
  return null;
}

function MapEventListener({
  onLongPress,
  onTap,
}: {
  onLongPress: (lat: number, lon: number) => void;
  onTap: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    contextmenu(e) {
      e.originalEvent.preventDefault();
      onLongPress(e.latlng.lat, e.latlng.lng);
    },
    click(e) {
      onTap(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function nearestLandmarkName(lat: number, lon: number, thresholdM = 80): string | null {
  let best: { name: string; d: number } | null = null;
  for (const l of landmarks) {
    const dx = (l.lon - lon) * 88800;
    const dy = (l.lat - lat) * 111000;
    const d = Math.hypot(dx, dy);
    if (!best || d < best.d) best = { name: l.name, d };
  }
  return best && best.d <= thresholdM ? best.name : null;
}

function routableName(p: Place): string {
  return landmarkByName.has(p.name)
    ? p.name
    : nearestLandmarkName(p.lat, p.lon, 500) ?? '정문';
}

export default function MapPage() {
  // ── 모드/상태 ────────────────────────────────────────────
  const [mode, setMode] = useState<MapMode>('browse');
  const [pickedPlace, setPickedPlace] = useState<Place | null>(null);
  const [origin, setOrigin] = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const [profile, setProfile] = useState<RouteProfile>('wheelchair');

  // ── 검색 Drawer ─────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchPurpose, setSearchPurpose] = useState<SearchPurpose>('browse');
  const [searchQuery, setSearchQuery] = useState('');

  // ── 레이어 토글 ─────────────────────────────────────────
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    tactile: true,
    sound: false,
    charger: true,
    toilet: false,
    cctv: false,
    forbidden: true,
  });
  const [layersOpen, setLayersOpen] = useState(false);

  // ── 시트 드래그 ─────────────────────────────────────────
  const [sheetExpanded, setSheetExpanded] = useState(true);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const dragRef = useRef<{ startY: number; startH: number; active: boolean; moved: boolean }>({
    startY: 0,
    startH: 0,
    active: false,
    moved: false,
  });

  // ── 접근성 제보 ─────────────────────────────────────────
  const [reportOpen, setReportOpen] = useState(false);
  const [reportLat, setReportLat] = useState<number | null>(null);
  const [reportLon, setReportLon] = useState<number | null>(null);
  const [reportBuilding, setReportBuilding] = useState<string>('');
  const [reports, setReports] = useState<AccessibilityReport[]>([]);
  const [submitSnack, setSubmitSnack] = useState(false);
  const [tipSnack, setTipSnack] = useState(true);

  // ── 파생값 ─────────────────────────────────────────────
  const routeKey = origin && destination ? `${routableName(origin)}|${routableName(destination)}` : null;
  const route = useMemo(() => {
    if (!origin || !destination) return null;
    return getRoute(routableName(origin), routableName(destination), profile);
  }, [origin, destination, profile, routeKey, profile]);
  const profiles = useMemo(
    () => (origin && destination ? availableProfiles(routableName(origin), routableName(destination)) : []),
    [origin, destination],
  );

  useEffect(() => {
    if (mode !== 'browse') setSheetExpanded(true);
  }, [mode]);

  // ── 핸들러 ─────────────────────────────────────────────
  const openSearch = (purpose: SearchPurpose) => {
    setSearchPurpose(purpose);
    setSearchOpen(true);
  };

  const onPickFromSearch = (l: Landmark) => {
    setSearchOpen(false);
    setSearchQuery('');
    const place: Place = { name: l.name, lat: l.lat, lon: l.lon };
    if (searchPurpose === 'origin') {
      setOrigin(place);
      if (destination) {
        setMode('route');
      } else {
        openSearch('destination');
      }
    } else if (searchPurpose === 'destination') {
      setDestination(place);
      if (!origin) setOrigin(CURRENT_LOCATION_PLACE);
      setMode('route');
    } else {
      setPickedPlace(place);
      setMode('place');
    }
  };

  const onTapLandmarkOnMap = (l: Landmark) => {
    setPickedPlace({ name: l.name, lat: l.lat, lon: l.lon });
    setMode('place');
  };

  const setAsOrigin = () => {
    if (!pickedPlace) return;
    setOrigin(pickedPlace);
    setPickedPlace(null);
    if (destination) setMode('route');
    else openSearch('destination');
  };

  const setAsDestination = () => {
    if (!pickedPlace) return;
    setDestination(pickedPlace);
    setPickedPlace(null);
    if (!origin) setOrigin(CURRENT_LOCATION_PLACE);
    setMode('route');
  };

  const swapOd = () => {
    if (!origin || !destination) return;
    setOrigin(destination);
    setDestination(origin);
  };

  const resetRoute = () => {
    setOrigin(null);
    setDestination(null);
    setMode('browse');
  };

  const openReportForLocation = (lat: number, lon: number, buildingName?: string) => {
    setReportLat(lat);
    setReportLon(lon);
    setReportBuilding(buildingName ?? nearestLandmarkName(lat, lon) ?? '');
    setReportOpen(true);
  };

  const handleReportSubmit = (r: AccessibilityReport) => {
    setReports((prev) => [r, ...prev]);
    setReportOpen(false);
    setSubmitSnack(true);
  };

  // ── 시트 드래그 핸들러 ───────────────────────────────────
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
    mode === 'route'
      ? '252px'
      : mode === 'navigate'
        ? '128px'
        : mode === 'place'
          ? '280px'
          : `${SHEET_COLLAPSED}px`;
  const sheetDraggable = false;

  // 검색 결과 필터
  const filteredLandmarks = landmarks.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const searchTitle =
    searchPurpose === 'origin' ? '출발지 검색'
    : searchPurpose === 'destination' ? '도착지 검색'
    : '캠퍼스 장소 검색';

  // ── 렌더링 ─────────────────────────────────────────────
  return (
    <Box
      component="main"
      lang="ko"
      sx={{ position: 'relative', height: '100%', overflow: 'hidden', bgcolor: '#E8F1F5' }}
    >
      <Typography
        component="h1"
        sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
      >
        서울대 캠퍼스 배리어프리 지도
      </Typography>

      {/* 지도 */}
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

          {/* 거부 segment */}
          {layers.forbidden &&
            forbiddenSegments.map((seg, i) => (
              <Polyline
                key={`fb-${i}`}
                positions={seg.coords as [number, number][]}
                pathOptions={{ color: '#DC2626', weight: 3, opacity: 0.7, dashArray: '4 5' }}
              />
            ))}

          {/* 라우트 */}
          {mode === 'route' && route && (
            <Polyline
              positions={route.coords as [number, number][]}
              pathOptions={{ color: PROFILE_META[profile].color, weight: 6, opacity: 0.9 }}
            />
          )}

          {/* POI */}
          {layers.tactile &&
            poi.tactile.map(([la, lo], i) => (
              <CircleMarker
                key={`t-${i}`}
                center={[la, lo]}
                radius={5}
                pathOptions={{ color: '#0F766E', fillColor: '#0F766E', fillOpacity: 0.85, weight: 1 }}
              >
                <Tooltip>점자블록</Tooltip>
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
                <Tooltip>음향신호기</Tooltip>
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

          {/* 랜드마크 — 출발/도착/선택된 것만 표시 (탭하면 표시됨) */}
          {landmarks
            .filter(
              (l) =>
                origin?.name === l.name ||
                destination?.name === l.name ||
                pickedPlace?.name === l.name,
            )
            .map((l) => {
              const isOrigin = origin?.name === l.name;
              const isDest = destination?.name === l.name;
              const isPicked = pickedPlace?.name === l.name;
              const kind = isOrigin ? 'origin' : isDest ? 'destination' : 'picked';
              return (
                <Marker
                  key={l.name}
                  position={[l.lat, l.lon]}
                  icon={placeIcon(kind, true)}
                  eventHandlers={{ click: () => onTapLandmarkOnMap(l) }}
                >
                  <Tooltip direction="top" offset={[0, -28]}>
                    {l.name}
                    {isOrigin ? ' · 출발' : ''}
                    {isDest ? ' · 도착' : ''}
                  </Tooltip>
                </Marker>
              );
            })}

          {/* 현재 위치 (펄스) */}
          <CircleMarker
            center={[CURRENT_LOCATION_PLACE.lat, CURRENT_LOCATION_PLACE.lon]}
            radius={8}
            pathOptions={{
              color: '#fff',
              weight: 3,
              fillColor: '#2563EB',
              fillOpacity: 1,
            }}
          >
            <Tooltip>내 위치</Tooltip>
          </CircleMarker>

          {/* 제보 마커 */}
          {reports.map((r) => (
            <CircleMarker
              key={r.id}
              center={[r.lat, r.lon]}
              radius={9}
              pathOptions={{
                color: '#fff',
                weight: 2,
                fillColor:
                  r.urgency === 'high' ? '#DC2626' : r.urgency === 'normal' ? '#F59E0B' : '#0EA5E9',
                fillOpacity: 0.95,
              }}
            >
              <Tooltip direction="top">
                {r.buildingName} · {r.categories[0] ?? '제보'}
                {r.categories.length > 1 ? ` 외 ${r.categories.length - 1}` : ''}
              </Tooltip>
            </CircleMarker>
          ))}

          <MapEventListener
            onLongPress={(lat, lon) => openReportForLocation(lat, lon)}
            onTap={(lat, lon) => {
              if (mode === 'navigate') return;
              const name = nearestLandmarkName(lat, lon, 80);
              if (!name) return;
              const l = landmarkByName.get(name);
              if (l) onTapLandmarkOnMap(l);
            }}
          />

          {/* 카메라 제어 */}
          {mode === 'place' && pickedPlace && (
            <FlyTo lat={pickedPlace.lat} lon={pickedPlace.lon} zoom={17} />
          )}
          {mode === 'route' && route && <FitBounds coords={route.coords} />}
        </MapContainer>
      </Box>

      {/* 상단: 검색 + 레이어 + (route 모드에서) 프로파일 칩 */}
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
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
          <ButtonBase
            onClick={() => openSearch('browse')}
            aria-label="캠퍼스 장소 검색"
            sx={{
              flex: 1,
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
              어디로 가시나요?
            </Typography>
          </ButtonBase>
          <IconButton
            onClick={() => setLayersOpen(true)}
            aria-label="지도 레이어"
            sx={{
              bgcolor: '#fff',
              width: 48,
              height: 48,
              borderRadius: '50%',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              flexShrink: 0,
              '&:hover': { bgcolor: '#F9FAFB' },
            }}
          >
            <Layers size={20} color="#1E3A8A" aria-hidden="true" />
          </IconButton>
        </Box>

        {mode === 'route' && (
          <Box
            role="group"
            aria-label="접근성 프로파일 선택"
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
                  }}
                >
                  {meta.label}
                </ButtonBase>
              );
            })}
          </Box>
        )}
      </Box>

      {/* 우측 내 위치 버튼 */}
      <Box
        sx={{
          position: 'absolute',
          right: 12,
          bottom: mode === 'browse' ? 16 : `calc(${sheetHeightStyle} + 12px)`,
          zIndex: 999,
          transition: dragHeight !== null ? 'none' : 'bottom 0.25s ease',
        }}
      >
        <IconButton
          aria-label="내 위치"
          onClick={() => {
            if (mode === 'route') return;
            setMode('browse');
            setPickedPlace(null);
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

      {/* 하단 시트 (browse 모드에서는 숨김) */}
      {mode !== 'browse' && (
      <Card
        component="section"
        aria-label="장소/라우트 패널"
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
        {sheetDraggable ? (
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
              pb: 0.5,
              '&:active': { cursor: 'grabbing' },
            }}
          >
            <Box aria-hidden="true" sx={{ display: 'flex', justifyContent: 'center', mb: 0.75 }}>
              <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#D1D5DB' }} />
            </Box>
          </Box>
        ) : (
          <Box aria-hidden="true" sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 0.5 }}>
            <Box sx={{ width: 36, height: 4, borderRadius: 3, bgcolor: '#E5E7EB' }} />
          </Box>
        )}

        <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, px: 2, pb: 2 }}>
          {mode === 'place' && pickedPlace && (
            <PlaceSheet
              place={pickedPlace}
              onSetOrigin={setAsOrigin}
              onSetDestination={setAsDestination}
              onClose={() => {
                setPickedPlace(null);
                setMode('browse');
              }}
              onReport={() => openReportForLocation(pickedPlace.lat, pickedPlace.lon, pickedPlace.name)}
            />
          )}

          {mode === 'route' && origin && destination && (
            <RouteSheet
              origin={origin}
              destination={destination}
              profile={profile}
              onSwap={swapOd}
              onChangeOrigin={() => openSearch('origin')}
              onChangeDestination={() => openSearch('destination')}
              onReset={resetRoute}
              onStartNavigation={() => setMode('navigate')}
            />
          )}

          {mode === 'navigate' && origin && destination && (
            <NavigateSheet
              origin={origin}
              destination={destination}
              profile={profile}
              onStop={() => setMode('route')}
            />
          )}
        </Box>
      </Card>
      )}

      {/* 레이어 Drawer */}
      <Drawer
        anchor="bottom"
        open={layersOpen}
        onClose={() => setLayersOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 2,
            pb: 'env(safe-area-inset-bottom)',
          },
        }}
      >
        <Box aria-hidden="true" sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#D1D5DB' }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Layers size={18} color="#1E3A8A" aria-hidden="true" />
          <Typography sx={{ ml: 0.75, fontSize: '1rem', fontWeight: 800, color: '#111827', flex: 1 }}>
            지도 레이어
          </Typography>
          <IconButton size="small" onClick={() => setLayersOpen(false)} aria-label="레이어 닫기">
            <X size={18} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, pb: 1 }}>
          {(Object.keys(LAYER_META) as LayerKey[]).map((k) => {
            const meta = LAYER_META[k];
            const Icon = meta.icon;
            return (
              <FormControlLabel
                key={k}
                control={
                  <Switch
                    checked={layers[k]}
                    onChange={(_e, v) => setLayers((prev) => ({ ...prev, [k]: v }))}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon size={16} color={meta.color} aria-hidden="true" />
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                      {meta.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                      {meta.count}
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, justifyContent: 'space-between', flexDirection: 'row-reverse', py: 0.5 }}
              />
            );
          })}
        </Box>
      </Drawer>

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
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: 700 }}>
              {searchTitle}
            </Typography>
            <Box
              component="input"
              autoFocus
              placeholder="장소 이름 (예: 중앙도서관)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: '100%',
                minHeight: 36,
                border: 'none',
                px: 0,
                fontSize: '1rem',
                fontWeight: 600,
                outline: 'none',
                background: 'transparent',
              }}
            />
          </Box>
          {searchQuery && (
            <IconButton size="small" onClick={() => setSearchQuery('')} aria-label="검색어 지우기">
              <X size={16} />
            </IconButton>
          )}
        </Box>
        <Divider />
        <List>
          {searchPurpose === 'origin' && (
            <ListItemButton
              onClick={() => {
                setOrigin(CURRENT_LOCATION_PLACE);
                setSearchOpen(false);
                setSearchQuery('');
                if (destination) setMode('route');
                else openSearch('destination');
              }}
              sx={{ minHeight: 56 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: '#DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <Locate size={18} color="#1E3A8A" />
              </Box>
              <ListItemText
                primary="내 위치에서 출발"
                secondary={CURRENT_LOCATION_PLACE.name}
                primaryTypographyProps={{ fontSize: '0.9375rem', fontWeight: 700 }}
                secondaryTypographyProps={{ fontSize: '0.75rem', color: '#6B7280' }}
              />
            </ListItemButton>
          )}
          {filteredLandmarks.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: '#6B7280' }}>검색 결과가 없습니다</Box>
          ) : (
            filteredLandmarks.map((l) => (
              <ListItemButton
                key={l.name}
                onClick={() => onPickFromSearch(l)}
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
                <ChevronRight size={16} color="#9CA3AF" />
              </ListItemButton>
            ))
          )}
        </List>
      </Drawer>

      <AccessibilityReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReportSubmit}
        initialLat={reportLat}
        initialLon={reportLon}
        initialBuildingName={reportBuilding}
      />

      <Snackbar
        open={tipSnack}
        autoHideDuration={5000}
        onClose={() => setTipSnack(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 10, zIndex: 1200 }}
      >
        <Alert
          icon={<Flag size={16} />}
          severity="info"
          variant="filled"
          onClose={() => setTipSnack(false)}
          sx={{ bgcolor: '#1E3A8A', fontSize: '0.8125rem', alignItems: 'center' }}
        >
          지도를 길게 눌러 접근성 문제를 제보할 수 있어요
        </Alert>
      </Snackbar>

      <Snackbar
        open={submitSnack}
        autoHideDuration={3500}
        onClose={() => setSubmitSnack(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 10, zIndex: 1200 }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSubmitSnack(false)}
          sx={{ fontSize: '0.8125rem' }}
        >
          제보가 접수되었습니다. 검토 후 지도에 반영됩니다.
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ────────────────────────────────────────────────────────────
// 시트 내부 컴포넌트
// ────────────────────────────────────────────────────────────

function PlaceSheet({
  place,
  onSetOrigin,
  onSetDestination,
  onClose,
  onReport,
}: {
  place: Place;
  onSetOrigin: () => void;
  onSetDestination: () => void;
  onClose: () => void;
  onReport: () => void;
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            bgcolor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MapPin size={22} color="#B45309" />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: 700 }}>
            선택한 장소
          </Typography>
          <Typography
            component="h2"
            sx={{ fontSize: '1.0625rem', fontWeight: 800, color: '#111827', mb: 0.25 }}
          >
            {place.name}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
            {place.lat.toFixed(5)}, {place.lon.toFixed(5)}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="장소 보기 닫기">
          <X size={18} />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<MapPin size={16} />}
          onClick={onSetOrigin}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, minHeight: 48 }}
        >
          출발지로
        </Button>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Navigation size={16} />}
          onClick={onSetDestination}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: 2,
            minHeight: 48,
            bgcolor: '#1E3A8A',
            '&:hover': { bgcolor: '#172554' },
          }}
        >
          도착지로
        </Button>
      </Box>

      <Button
        fullWidth
        variant="text"
        startIcon={<Flag size={16} />}
        onClick={onReport}
        sx={{
          mt: 0.5,
          textTransform: 'none',
          fontWeight: 700,
          color: '#B91C1C',
          borderRadius: 2,
          '&:hover': { bgcolor: '#FEE2E2' },
        }}
      >
        이 시설 접근성 문제 제보
      </Button>

      <Typography
        sx={{
          mt: 1.5,
          fontSize: '0.6875rem',
          color: '#9CA3AF',
          textAlign: 'center',
        }}
      >
        출발지로 정하면 도착지 검색이 자동으로 열려요. 도착지만 정하면 내 위치에서 자동 경로를 안내해요.
      </Typography>
    </Box>
  );
}

function RouteSheet({
  origin,
  destination,
  profile,
  onSwap,
  onChangeOrigin,
  onChangeDestination,
  onReset,
  onStartNavigation,
}: {
  origin: Place;
  destination: Place;
  profile: RouteProfile;
  onSwap: () => void;
  onChangeOrigin: () => void;
  onChangeDestination: () => void;
  onReset: () => void;
  onStartNavigation: () => void;
}) {
  const route = getRoute(routableName(origin), routableName(destination), profile);
  const meta = PROFILE_META[profile];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* O–D + 스왑 + 닫기 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
          <ButtonBase
            onClick={onChangeOrigin}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 0.875,
              borderRadius: 1.5,
              bgcolor: '#ECFDF5',
              justifyContent: 'flex-start',
              minHeight: 36,
            }}
          >
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#16A34A', color: '#fff', fontSize: '0.625rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>출</Box>
            <Typography sx={{ flex: 1, textAlign: 'left', fontSize: '0.8125rem', fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {origin.name}
            </Typography>
          </ButtonBase>
          <ButtonBase
            onClick={onChangeDestination}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 0.875,
              borderRadius: 1.5,
              bgcolor: '#FEF2F2',
              justifyContent: 'flex-start',
              minHeight: 36,
            }}
          >
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#DC2626', color: '#fff', fontSize: '0.625rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>도</Box>
            <Typography sx={{ flex: 1, textAlign: 'left', fontSize: '0.8125rem', fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {destination.name}
            </Typography>
          </ButtonBase>
        </Box>
        <IconButton
          aria-label="출발/도착 바꾸기"
          onClick={onSwap}
          sx={{
            alignSelf: 'center',
            bgcolor: '#F3F4F6',
            '&:hover': { bgcolor: '#E5E7EB' },
          }}
        >
          <Repeat2 size={18} />
        </IconButton>
      </Box>

      {/* 안내 시작 버튼 */}
      <Button
        fullWidth
        variant="contained"
        onClick={onStartNavigation}
        disabled={!route}
        sx={{
          textTransform: 'none',
          fontWeight: 800,
          borderRadius: 2,
          minHeight: 52,
          bgcolor: meta.color,
          boxShadow: 'none',
          '&:hover': { bgcolor: meta.color, opacity: 0.92 },
          position: 'relative',
          px: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Navigation size={18} />
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800 }}>안내 시작</Typography>
        </Box>
        <Typography
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            opacity: 0.95,
          }}
        >
          {route ? `${Math.round(route.length_m)}m · 약 ${etaMinutes(route.length_m)}분` : '경로 없음'}
        </Typography>
      </Button>

      {/* 경로 초기화 */}
      <Button
        fullWidth
        variant="contained"
        onClick={onReset}
        sx={{
          textTransform: 'none',
          fontWeight: 800,
          borderRadius: 2,
          minHeight: 52,
          bgcolor: '#B91C1C',
          color: '#fff',
          boxShadow: 'none',
          '&:hover': { bgcolor: '#991B1B' },
        }}
      >
        경로 초기화
      </Button>
    </Box>
  );
}

function NavigateSheet({
  origin,
  destination,
  profile,
  onStop,
}: {
  origin: Place;
  destination: Place;
  profile: RouteProfile;
  onStop: () => void;
}) {
  const route = getRoute(routableName(origin), routableName(destination), profile);
  const meta = PROFILE_META[profile];
  const eta = route ? etaMinutes(route.length_m) : 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '12px',
          bgcolor: meta.color,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Navigation size={22} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: 700 }}>
          안내 중 · {meta.label}
        </Typography>
        {route ? (
          <Typography sx={{ fontSize: '1.0625rem', fontWeight: 800, color: '#111827' }}>
            {Math.round(route.length_m)}m · 약 {eta}분
          </Typography>
        ) : (
          <Typography sx={{ fontSize: '0.9375rem', color: '#9CA3AF' }}>
            이 프로필 경로 없음
          </Typography>
        )}
        <Typography sx={{ fontSize: '0.75rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          → {destination.name}
        </Typography>
      </Box>
      <Button
        variant="contained"
        onClick={onStop}
        sx={{
          textTransform: 'none',
          fontWeight: 800,
          borderRadius: 2,
          minHeight: 44,
          bgcolor: '#B91C1C',
          boxShadow: 'none',
          '&:hover': { bgcolor: '#991B1B' },
        }}
      >
        안내 종료
      </Button>
    </Box>
  );
}

