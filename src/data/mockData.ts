// ============================================================
// 베프 사용자 앱 Mock 데이터
// 백엔드 연결 시 services/api.ts의 Mock 반환을 실제 fetch로 교체합니다.
// ============================================================

import type {
  UserProfile,
  AccessProfile,
  Friend,
  VolunteerStats,
  Certificate,
  Facility,
  Companion,
  MyMatch,
  SosTarget,
  HotPost,
  ActivityCard,
  HeroBanner,
  MatchCategory,
  CampusNews,
  ExternalActivity,
} from '../types';

// ============================================================
// 사용자 / 프로필
// ============================================================

export const currentUser: UserProfile = {
  id: 'u-1042',
  name: '홍길동',
  university: '서로대학교',
  major: '컴퓨터공학과 3학년',
  email: 'gildong@seoro.ac.kr',
  emailVerified: true,
  bio: '함께 성장하는 대학생활을 만들어가요!',
  badge: '활동왕',
  interests: ['독서', '음악', '운동', '코딩'],
  role: 'helper',
  mannerScore: 4.9,
};

export const accessProfile: AccessProfile = {
  needs: ['mobility'],
  offers: ['mobility-help', 'note'],
};

export const friends: Friend[] = [
  { id: 1, name: '김**', role: '이용자', activities: 4 },
  { id: 2, name: '이**', role: '제공자', activities: 7 },
  { id: 3, name: '박**', role: '이용자', activities: 2 },
  { id: 4, name: '최**', role: '제공자', activities: 11 },
];

export const volunteerStats: VolunteerStats = {
  totalHours: 42,
  thisSemester: 18,
  goal: 30,
  activities: 12,
  certificates: 3,
};

export const certificates: Certificate[] = [
  { id: 1, title: '2026-1학기 동행 활동 확인서', issuer: '서로대 장애학생지원센터 · 베프', date: '2026.06.30 발급예정' },
  { id: 2, title: '배리어프리 서포터즈 활동 확인서', issuer: '학생복지위원회', date: '2026.04.15' },
  { id: 3, title: '봉사시간 누적 인증서 (30h+)', issuer: '베프', date: '2026.03.20' },
];

// ============================================================
// 무장애 지도 / 시설
// ============================================================

export const facilities: Facility[] = [
  { id: 1, name: '중앙도서관', building: '1관', category: 'building', features: ['엘리베이터', '경사로', '전용화장실', '점자블록'], distance: '120m', accessible: true, x: 32, y: 38 },
  { id: 2, name: '학생회관', building: '2관', category: 'building', features: ['엘리베이터', '경사로', '전용화장실'], distance: '250m', accessible: true, x: 60, y: 30 },
  { id: 3, name: '공학관', building: '3관', category: 'building', features: ['엘리베이터', '점자블록', '자동문'], distance: '340m', accessible: true, x: 70, y: 60 },
  { id: 4, name: '인문관', building: '4관', category: 'ramp', features: ['경사로', '넓은 복도', '자동문'], distance: '180m', accessible: true, x: 25, y: 65 },
  { id: 5, name: '제1공학관 화장실', building: '3관 2층', category: 'restroom', features: ['전용화장실', '자동문'], distance: '350m', accessible: true, x: 75, y: 55 },
  { id: 6, name: '도서관 엘리베이터', building: '1관', category: 'elevator', features: ['엘리베이터', '점자버튼'], distance: '125m', accessible: true, x: 35, y: 42 },
];

export const recentFacilitySearches = ['중앙도서관', '학생회관', '공학관 엘리베이터'];

// ============================================================
// 매칭
// ============================================================

export const matchRequests: Companion[] = [
  {
    id: 1, author: '익명 이용자', role: '이용자',
    title: '도서관에서 시험공부 함께 해주실 분',
    purpose: '중앙도서관에서 4시간 정도 공부 동행',
    location: '중앙도서관 3층', date: '2026.05.22 (금)', duration: '14:00 - 18:00',
    tags: ['학습', '실내'], needs: ['휠체어 이동 보조', '책 운반'],
    status: '모집중', verified: true, schoolPartner: true, volunteerHours: 4, mannerScore: 4.8,
  },
  {
    id: 2, author: '익명 이용자', role: '이용자',
    title: '학생회관 행사 참여 동행',
    purpose: '신입생 환영회에 함께 참여하고 싶어요',
    location: '학생회관 1층', date: '2026.05.25 (월)', duration: '18:00 - 20:00',
    tags: ['행사', '저녁'], needs: ['시각 안내', '이동 보조'],
    status: '매칭대기', verified: true, volunteerHours: 2, mannerScore: 4.9,
  },
  {
    id: 3, author: '익명 이용자', role: '이용자',
    title: '캠퍼스 산책 동행 부탁드려요',
    purpose: '오랜만에 캠퍼스 한 바퀴 걷고 싶어요',
    location: '정문 → 후문', date: '2026.05.23 (토)', duration: '10:00 - 11:30',
    tags: ['산책', '실외'], needs: ['휠체어 이동 보조'],
    status: '모집중', verified: true, volunteerHours: 1.5, mannerScore: 5.0,
  },
];

export const matchOffers: Companion[] = [
  {
    id: 11, author: '익명 제공자', role: '제공자',
    title: '주말 오전 동행 가능합니다',
    purpose: '독서, 산책, 카페 등 편하게 함께해요',
    location: '캠퍼스 전 지역', date: '주말 가능', duration: '2-3시간',
    tags: ['주말', '유연'], needs: ['수어 가능', '이동 보조 경험'],
    status: '모집중', verified: true, schoolPartner: true, volunteerHours: 3, mannerScore: 4.9,
  },
  {
    id: 12, author: '익명 제공자', role: '제공자',
    title: '평일 저녁 학습 도우미',
    purpose: '시험기간 함께 공부할 분 찾아요',
    location: '도서관/스터디룸', date: '평일 저녁', duration: '2-4시간',
    tags: ['학습', '평일'], needs: ['전공: 컴퓨터공학', '책 운반 가능'],
    status: '모집중', verified: true, volunteerHours: 4, mannerScore: 4.7,
  },
];

export const myMatches: MyMatch[] = [
  {
    id: 21, author: '김** 제공자', role: '제공자',
    title: '도서관에서 시험공부 함께 해주실 분',
    purpose: '중앙도서관에서 4시간 정도 공부 동행',
    location: '중앙도서관 3층', date: '2026.05.22 (금)', duration: '14:00 - 18:00',
    tags: ['학습'], needs: [], status: '확정', step: 2,
  },
  {
    id: 22, author: '이** 제공자', role: '제공자',
    title: '캠퍼스 산책 동행',
    purpose: '오랜만에 캠퍼스 한 바퀴 걷고 싶어요',
    location: '정문 → 후문', date: '2026.05.23 (토)', duration: '10:00 - 11:30',
    tags: ['산책'], needs: [], status: '매칭대기', step: 1,
  },
];

export const matchSteps = ['접수신청', '매칭', '일정조율', '동행', '종료/설문'] as const;

// ============================================================
// SOS
// ============================================================

export const sosTargets: SosTarget[] = [
  { id: 'guardian', label: '보호자', sub: '사전 등록된 번호로 위치 자동 공유', phone: '010-****-1234' },
  { id: 'support',  label: '학교 장애학생지원센터', sub: '평일 09:00 - 18:00', phone: '02-***-****' },
  { id: 'security', label: '캠퍼스 보안실', sub: '24시간 운영', phone: '02-***-9119' },
  { id: '119',      label: '119 응급신고', sub: '응급 상황 시', phone: '119' },
];

// ============================================================
// 홈 화면 콘텐츠
// ============================================================

export const heroBanners: HeroBanner[] = [
  {
    id: 1, badge: '함께해요',
    title: '장애·비장애 함께,\n캠퍼스 산책 동행',
    subtitle: '서로 다른 우리가 만나 친구가 되는 시간',
    image: 'https://images.unsplash.com/photo-1570793005299-c091be91bbad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    accent: '#1E3A8A',
    overlay: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 55%, rgba(255,255,255,0) 100%)',
  },
  {
    id: 2, badge: '신규 매칭',
    title: '같이 공부할\n스터디 친구 찾기',
    subtitle: '도서관·카페에서 함께하는 포용 스터디',
    image: 'https://images.unsplash.com/photo-1769092992447-18050cf9bd26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    accent: '#047857',
    overlay: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 55%, rgba(255,255,255,0) 100%)',
  },
  {
    id: 3, badge: '인기',
    title: '함께 뛰는 스포츠,\n적응형 운동 모임',
    subtitle: '누구나 즐길 수 있는 캠퍼스 스포츠',
    image: 'https://images.unsplash.com/photo-1778432999383-8e241a3c91f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    accent: '#B45309',
    overlay: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 55%, rgba(255,255,255,0) 100%)',
  },
];

export const matchCategories: MatchCategory[] = [
  { id: 'study', label: '스터디', count: 142, image: 'https://images.unsplash.com/photo-1769092992447-18050cf9bd26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 'walk',  label: '산책·동행', count: 98, image: 'https://images.unsplash.com/photo-1629185752152-fe65698ddee4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 'meal',  label: '같이 밥먹기', count: 76, image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 'sport', label: '운동', count: 54, image: 'https://images.unsplash.com/photo-1778432999383-8e241a3c91f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 'art',   label: '문화·예술', count: 41, image: 'https://images.unsplash.com/photo-1560831340-b9679dc9e9f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
];

export const hotPosts: HotPost[] = [
  { id: 1, board: '자유게시판', title: '오늘 학식 진짜 맛있다 ㄷㄷ',          likes: 87,  comments: 24, views: 1203, isHot: true  },
  { id: 2, board: '정보게시판', title: '중앙도서관 엘리베이터 점검 안내 (5/22)', likes: 45,  comments: 12, views: 892,  isHot: true  },
  { id: 3, board: '동행후기',   title: '서로 동행 매칭 후기 - 정말 따뜻한 경험이었어요', likes: 132, comments: 38, views: 2104, isHot: true  },
  { id: 4, board: '질문게시판', title: '컴공 전공 들으시는 분들 시간표 공유 부탁드려요', likes: 18,  comments: 9,  views: 421,  isHot: false },
];

export const deadlineActivities: ActivityCard[] = [
  { id: 1, org: '학생복지위원회', title: '배리어프리 캠퍼스 서포터즈 2기', deadline: 'D-3',  deadlineLabel: '마감임박', deadlineColor: '#B91C1C', category: '교내활동', accessibility: ['엘리베이터', '수어통역'], progress: 85 },
  { id: 2, org: '서로플랫폼',     title: '동행 체험단 모집 (5월 정기)',  deadline: 'D-7',  deadlineLabel: '곧 마감', deadlineColor: '#B45309', category: '동행',     accessibility: ['이동 보조', '자막'],  progress: 62 },
  { id: 3, org: '교내 창업동아리', title: '포용적 디자인 해커톤',         deadline: 'D-14', deadlineLabel: '여유',    deadlineColor: '#047857', category: '공모전',   accessibility: ['자막', '온라인'],     progress: 35 },
];

export const campusNews: CampusNews[] = [
  { id: 1, tag: '학사', title: '2026-1학기 수강신청 변경 기간 안내', summary: '5월 20일~22일 학과별 변경 신청 접수',     date: '05.18' },
  { id: 2, tag: '복지', title: '장애학생지원센터 5월 프로그램 안내',  summary: '학습 멘토링 및 이동 지원 신청 모집',       date: '05.17' },
  { id: 3, tag: '행사', title: '캠퍼스 접근성 토크 콘서트',           summary: '5월 30일 학생회관 1층 / 수어통역 제공',    date: '05.15' },
];

export const externalActivities: ExternalActivity[] = [
  { id: 1, org: '한국장애인고용공단', title: '대학생 인식개선 콘텐츠 공모전', deadline: 'D-5',  deadlineColor: '#B91C1C', category: '공모전',  benefit: '상금 300만원' },
  { id: 2, org: 'SK행복나눔재단',     title: 'SUNNY 대학생 자원봉사 17기',   deadline: 'D-10', deadlineColor: '#B45309', category: '서포터즈', benefit: '활동비 + 수료증' },
  { id: 3, org: '카카오임팩트',       title: '배리어프리 앱 챌린지',         deadline: 'D-21', deadlineColor: '#047857', category: '해커톤',  benefit: '멘토링 + 시상' },
];

export const UNREAD_NOTIFICATIONS = 3;
