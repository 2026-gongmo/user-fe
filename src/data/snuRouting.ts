// SNU 캠퍼스 라우팅용 데이터 어댑터.
// 원본은 snu-accessible-routing/scripts/export_for_user_fe.py 에서 생성.

import landmarksRaw from './snu_landmarks.json';
import routesRaw from './snu_routes.json';
import poiRaw from './snu_poi_layers.json';
import forbiddenRaw from './snu_forbidden_segments.json';

export type LatLon = [number, number];
export type RouteProfile = 'normal' | 'wheelchair' | 'vision' | 'elderly';

export interface ProfileRoute {
  coords: LatLon[];
  length_m: number;
  steps_hit: number;
}

export interface Landmark {
  name: string;
  lat: number;
  lon: number;
}

export const landmarks: Landmark[] = Object.entries(
  landmarksRaw as Record<string, LatLon>,
).map(([name, [lat, lon]]) => ({ name, lat, lon }));

export const landmarkByName = new Map(landmarks.map((l) => [l.name, l]));

const routesByPair = routesRaw as Record<string, Partial<Record<RouteProfile, ProfileRoute>>>;

export function getRoute(
  from: string,
  to: string,
  profile: RouteProfile,
): ProfileRoute | null {
  if (from === to) return null;
  const direct = routesByPair[`${from}|${to}`];
  if (direct?.[profile]) return direct[profile]!;
  const reverse = routesByPair[`${to}|${from}`];
  if (reverse?.[profile]) {
    return { ...reverse[profile]!, coords: [...reverse[profile]!.coords].reverse() };
  }
  return null;
}

export function availableProfiles(from: string, to: string): RouteProfile[] {
  if (from === to) return [];
  const fwd = routesByPair[`${from}|${to}`];
  const rev = routesByPair[`${to}|${from}`];
  const merged = { ...rev, ...fwd };
  return Object.keys(merged) as RouteProfile[];
}

interface PoiLayers {
  chargers: [number, number, string?][];
  sound_signals: LatLon[];
  crosswalks: LatLon[];
  cctv: LatLon[];
  amenities: {
    toilets: LatLon[];
    bench: LatLon[];
    library?: LatLon[];
    parking?: LatLon[];
    charging_station?: LatLon[];
    shelter?: LatLon[];
  };
  tactile: LatLon[];
  lit_no_nodes: LatLon[];
}

export const poi = poiRaw as unknown as PoiLayers;

export interface ForbiddenSegment {
  kind: 'steps' | 'barrier';
  coords: LatLon[];
}

export const forbiddenSegments = forbiddenRaw as unknown as ForbiddenSegment[];

export const SNU_CENTER: LatLon = [37.461, 126.949];

export const PROFILE_META: Record<RouteProfile, { label: string; color: string; sub: string }> = {
  normal: { label: '일반', color: '#111827', sub: '최단거리' },
  wheelchair: { label: '휠체어', color: '#2563EB', sub: '계단 회피·충전기 근접' },
  vision: { label: '시각장애', color: '#CA8A04', sub: '점자블록·음향 우선' },
  elderly: { label: '노약자', color: '#16A34A', sub: '벤치·화장실 근접' },
};
