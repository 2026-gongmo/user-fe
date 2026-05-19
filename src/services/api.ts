// ============================================================
// user-fe services/api.ts
// 현재는 Mock 데이터를 반환합니다. 추후 Spring Boot API 연결 시 이 파일만 교체합니다.
// 자세한 API 후보는 docs/api-plan.md 참고.
// ============================================================

import {
  currentUser,
  accessProfile,
  friends,
  volunteerStats,
  certificates,
  facilities,
  matchRequests,
  matchOffers,
  myMatches,
  sosTargets,
  heroBanners,
  matchCategories,
  hotPosts,
  deadlineActivities,
  campusNews,
  externalActivities,
} from '../data/mockData';
import type {
  Companion,
  Facility,
  FacilityCategory,
  SosCallPayload,
  UserProfile,
  AccessProfile,
} from '../types';

// ============================================================
// API transition contracts
// - 실제 fetch는 아직 사용하지 않습니다.
// - Spring Boot 연결 시 아래 타입과 함수 시그니처를 유지하고 Mock delay만 교체합니다.
// ============================================================

export type ApiSuccess<T> = { success: true; data: T; message: null };
export type ApiFailure = { success: false; data: null; message: string; code: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ListQuery {
  query?: string;
  page?: number;
  size?: number;
}

export interface FacilityQuery extends ListQuery {
  category?: FacilityCategory | 'all';
  accessibleOnly?: boolean;
}

export interface MatchQuery extends ListQuery {
  role?: '이용자' | '제공자' | 'all';
  status?: Companion['status'] | 'all';
}

const delay = <T>(value: T, ms = 150) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const includesQuery = (fields: Array<string | undefined>, query?: string) => {
  const q = query?.trim().toLowerCase();
  if (!q) return true;
  return fields.filter(Boolean).join(' ').toLowerCase().includes(q);
};

// ============================================================
// 사용자 / 프로필
// ============================================================

export async function getCurrentUser(): Promise<UserProfile> {
  return delay(clone(currentUser));
}

export async function getAccessProfile(): Promise<AccessProfile> {
  return delay(clone(accessProfile));
}

export async function getFriends() {
  return delay(clone(friends));
}

export async function getVolunteerStats() {
  return delay(clone(volunteerStats));
}

export async function getCertificates() {
  return delay(clone(certificates));
}

// ============================================================
// 무장애 지도
// ============================================================

export async function getFacilities(query: FacilityQuery = {}): Promise<Facility[]> {
  const filtered = facilities.filter((f) => {
    const catOk = !query.category || query.category === 'all' || f.category === query.category;
    const accOk = !query.accessibleOnly || f.accessible;
    const textOk = includesQuery([f.name, f.building], query.query);
    return catOk && accOk && textOk;
  });
  return delay(clone(filtered));
}

// ============================================================
// 매칭
// ============================================================

export async function getMatchRequests(query: MatchQuery = {}): Promise<Companion[]> {
  const filtered = matchRequests.filter((m) => {
    const statusOk = !query.status || query.status === 'all' || m.status === query.status;
    const textOk = includesQuery([m.title, m.purpose, m.location], query.query);
    return statusOk && textOk;
  });
  return delay(clone(filtered));
}

export async function getMatchOffers(query: MatchQuery = {}): Promise<Companion[]> {
  const filtered = matchOffers.filter((m) => {
    const statusOk = !query.status || query.status === 'all' || m.status === query.status;
    const textOk = includesQuery([m.title, m.purpose, m.location], query.query);
    return statusOk && textOk;
  });
  return delay(clone(filtered));
}

export async function getMyMatches() {
  return delay(clone(myMatches));
}

// ============================================================
// SOS
// ============================================================

export async function getSosTargets() {
  return delay(clone(sosTargets));
}

export async function sendSosCall(payload: SosCallPayload): Promise<ApiResponse<{ callId: string }>> {
  // Mock: 백엔드 연결 시 실제 호출 라우팅 + 응답 시간 기록
  return delay({ success: true, data: { callId: `SOS-${Date.now()}` }, message: null });
}

// ============================================================
// 홈 콘텐츠
// ============================================================

export async function getHeroBanners() {
  return delay(clone(heroBanners));
}

export async function getMatchCategories() {
  return delay(clone(matchCategories));
}

export async function getHotPosts() {
  return delay(clone(hotPosts));
}

export async function getDeadlineActivities() {
  return delay(clone(deadlineActivities));
}

export async function getCampusNews() {
  return delay(clone(campusNews));
}

export async function getExternalActivities() {
  return delay(clone(externalActivities));
}
