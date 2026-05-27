// ============================================================
// 베프(BEFF) 사용자 앱 공통 타입 정의
// 백엔드 연결 시 이 타입에 맞춰 API 응답을 매핑합니다.
// ============================================================

export type UserRole = 'requester' | 'helper';

export type AccessNeedId = 'mobility' | 'vision' | 'hearing' | 'medical';
export type OfferSkillId = 'sign' | 'mobility-help' | 'note' | 'reading' | 'tech';

export interface UserProfile {
  id: string;
  name: string;
  university: string;
  major: string;
  email: string;
  emailVerified: boolean;
  bio: string;
  badge?: string;
  interests: string[];
  role: UserRole;
  mannerScore: number;
}

export interface AccessProfile {
  needs: AccessNeedId[];
  offers: OfferSkillId[];
}

export interface Friend {
  id: number;
  name: string;
  role: '이용자' | '제공자';
  activities: number;
}

export interface VolunteerStats {
  totalHours: number;
  thisSemester: number;
  goal: number;
  activities: number;
  certificates: number;
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  date: string;
}

export type FacilityCategory = 'building' | 'elevator' | 'ramp' | 'restroom';

export interface Facility {
  id: number;
  name: string;
  building: string;
  category: FacilityCategory;
  features: string[];
  distance: string;
  accessible: boolean;
  x: number;
  y: number;
}

export type MatchStatus = '모집중' | '매칭대기' | '확정' | '진행중' | '종료';
export type MatchRole = '이용자' | '제공자';

export interface Companion {
  id: number;
  author: string;
  role: MatchRole;
  title: string;
  purpose: string;
  location: string;
  date: string;
  duration: string;
  tags: string[];
  needs: string[];
  status: MatchStatus;
  verified?: boolean;
  schoolPartner?: boolean;
  volunteerHours?: number;
  mannerScore?: number;
}

export interface MyMatch extends Companion {
  step: number;
}

export type SosTargetId = 'guardian' | 'support' | 'security' | '119';

export interface SosTarget {
  id: SosTargetId;
  label: string;
  sub: string;
  phone: string;
}

export interface SosCallPayload {
  targetId: SosTargetId;
  messages: string[];
  customMessage?: string;
  location?: string;
}

export interface HotPost {
  id: number;
  board: string;
  title: string;
  likes: number;
  comments: number;
  views: number;
  isHot: boolean;
}

export interface ActivityCard {
  id: number;
  org: string;
  title: string;
  deadline: string;
  deadlineLabel: string;
  deadlineColor: string;
  category: string;
  accessibility: string[];
  progress: number;
}

export interface HeroBanner {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  accent: string;
  overlay: string;
}

export interface MatchCategory {
  id: string;
  label: string;
  count: number;
  image: string;
}

export interface CampusNews {
  id: number;
  tag: string;
  title: string;
  summary: string;
  date: string;
}

export interface ExternalActivity {
  id: number;
  org: string;
  title: string;
  deadline: string;
  deadlineColor: string;
  category: string;
  benefit: string;
}

// ============================================================
// AI 행정지원
// ============================================================

export type SupportRequestType =
  | '시험시간연장'
  | '강의자료사전제공'
  | '학습보조기기대여'
  | '속기지원'
  | '이동지원'
  | '기타';

export type SupportRequestStatus = '접수' | '검토중' | '교수회신대기' | '승인' | '반려' | '완료';

export interface SupportRequest {
  id: string;
  type: SupportRequestType;
  course?: string;
  professor?: string;
  reason: string;
  createdAt: string;
  status: SupportRequestStatus;
  centerNote?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  suggestions?: { label: string; type: SupportRequestType }[];
  at: string;
}

// ============================================================
// Gaussian Splatting 3D 씬
// ============================================================

export interface Splat3DScene {
  id: string;
  facilityId: number;
  title: string;
  description: string;
  thumbnail: string;
  fileSizeMB: number;
  capturedAt: string;
  pois: { id: string; label: string; note: string }[];
}

// ============================================================
// 접근성 문제 제보
// ============================================================

export type ReportCategory =
  | '계단'
  | '단차'
  | '급경사'
  | '엘리베이터 고장'
  | '엘리베이터 없음'
  | '자동문 없음'
  | '장애인 화장실 없음'
  | '점자블록 손상'
  | '공사 구간'
  | '기타';

export type FacilityStatus = 'yes' | 'no' | 'unknown';

export interface FacilityChecklist {
  autoDoor: FacilityStatus;
  ramp: FacilityStatus;
  elevator: FacilityStatus;
  accessibleToilet: FacilityStatus;
  tactilePaving: FacilityStatus;
}

export type ReportUrgency = 'low' | 'normal' | 'high';

export interface AccessibilityReport {
  id: string;
  lat: number;
  lon: number;
  buildingName: string;
  categories: ReportCategory[];
  facilities: FacilityChecklist;
  description: string;
  photoName?: string;
  urgency: ReportUrgency;
  anonymous: boolean;
  createdAt: string;
}
