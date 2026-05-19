import { useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Box,
  Typography,
  IconButton,
  Divider,
  LinearProgress,
  Badge,
  ButtonBase,
  Button,
  List,
  ListItemButton,
} from '@mui/material';
import {
  Bell,
  Search,
  Calendar,
  Utensils,
  Bus,
  BookOpen,
  Megaphone,
  HandHeart,
  Trophy,
  MessageSquare,
  ThumbsUp,
  Eye,
  ChevronRight,
  Flame,
  Clock,
  Accessibility,
  AlertTriangle,
  Newspaper,
  Briefcase,
  Bookmark,
  Sparkles,
  GraduationCap,
  Gem,
  ShieldAlert,
  PhoneCall,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const quickMenus = [
  { icon: Calendar, label: '시간표', color: '#5B67F5', bg: '#EEF0FF' },
  { icon: Utensils, label: '학식', color: '#B45309', bg: '#FEF3C7' },
  { icon: Bus, label: '셔틀', color: '#047857', bg: '#D1FAE5' },
  { icon: BookOpen, label: '도서관', color: '#6D28D9', bg: '#EDE9FE' },
  { icon: HandHeart, label: '동행매칭', color: '#BE185D', bg: '#FCE7F3' },
  { icon: Megaphone, label: '공지', color: '#B91C1C', bg: '#FEE2E2' },
  { icon: Trophy, label: '대외활동', color: '#0E7490', bg: '#CFFAFE' },
  { icon: Accessibility, label: '배리어프리', color: '#0369A1', bg: '#E0F2FE' },
];

const hotPosts = [
  {
    id: 1,
    board: '자유게시판',
    title: '오늘 학식 진짜 맛있다 ㄷㄷ',
    likes: 87,
    comments: 24,
    views: 1203,
    isHot: true,
  },
  {
    id: 2,
    board: '정보게시판',
    title: '중앙도서관 엘리베이터 점검 안내 (5/22)',
    likes: 45,
    comments: 12,
    views: 892,
    isHot: true,
  },
  {
    id: 3,
    board: '동행후기',
    title: '서로 동행 매칭 후기 - 정말 따뜻한 경험이었어요',
    likes: 132,
    comments: 38,
    views: 2104,
    isHot: true,
  },
  {
    id: 4,
    board: '질문게시판',
    title: '컴공 전공 들으시는 분들 시간표 공유 부탁드려요',
    likes: 18,
    comments: 9,
    views: 421,
    isHot: false,
  },
];

const activities = [
  {
    id: 1,
    org: '학생복지위원회',
    title: '배리어프리 캠퍼스 서포터즈 2기',
    deadline: 'D-3',
    deadlineLabel: '마감임박',
    deadlineColor: '#B91C1C',
    deadlineIcon: AlertTriangle,
    category: '교내활동',
    typeIcon: GraduationCap,
    accessibility: ['엘리베이터', '수어통역'],
    progress: 85,
  },
  {
    id: 2,
    org: '서로플랫폼',
    title: '동행 체험단 모집 (5월 정기)',
    deadline: 'D-7',
    deadlineLabel: '곧 마감',
    deadlineColor: '#B45309',
    deadlineIcon: Clock,
    category: '동행',
    typeIcon: HandHeart,
    accessibility: ['이동 보조', '자막'],
    progress: 62,
  },
  {
    id: 3,
    org: '교내 창업동아리',
    title: '포용적 디자인 해커톤',
    deadline: 'D-14',
    deadlineLabel: '여유',
    deadlineColor: '#047857',
    deadlineIcon: Calendar,
    category: '공모전',
    typeIcon: Gem,
    accessibility: ['자막', '온라인'],
    progress: 35,
  },
];

const heroBanners = [
  {
    id: 1,
    badge: '함께해요',
    title: '장애·비장애 함께,\n캠퍼스 산책 동행',
    subtitle: '서로 다른 우리가 만나 친구가 되는 시간',
    image:
      'https://images.unsplash.com/photo-1570793005299-c091be91bbad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    accent: '#4338CA',
    overlay: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 55%, rgba(255,255,255,0) 100%)',
  },
  {
    id: 2,
    badge: '신규 매칭',
    title: '같이 공부할\n스터디 친구 찾기',
    subtitle: '도서관·카페에서 함께하는 포용 스터디',
    image:
      'https://images.unsplash.com/photo-1769092992447-18050cf9bd26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    accent: '#047857',
    overlay: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 55%, rgba(255,255,255,0) 100%)',
  },
  {
    id: 3,
    badge: '인기',
    title: '함께 뛰는 스포츠,\n적응형 운동 모임',
    subtitle: '누구나 즐길 수 있는 캠퍼스 스포츠',
    image:
      'https://images.unsplash.com/photo-1778432999383-8e241a3c91f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    accent: '#B45309',
    overlay: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 55%, rgba(255,255,255,0) 100%)',
  },
];

const matchCategories = [
  {
    id: 'study',
    label: '스터디',
    count: 142,
    image:
      'https://images.unsplash.com/photo-1769092992447-18050cf9bd26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
  {
    id: 'walk',
    label: '산책·동행',
    count: 98,
    image:
      'https://images.unsplash.com/photo-1629185752152-fe65698ddee4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
  {
    id: 'meal',
    label: '같이 밥먹기',
    count: 76,
    image:
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
  {
    id: 'sport',
    label: '운동',
    count: 54,
    image:
      'https://images.unsplash.com/photo-1778432999383-8e241a3c91f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
  {
    id: 'art',
    label: '문화·예술',
    count: 41,
    image:
      'https://images.unsplash.com/photo-1560831340-b9679dc9e9f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
];

const campusNews = [
  {
    id: 1,
    tag: '학사',
    title: '2026-1학기 수강신청 변경 기간 안내',
    summary: '5월 20일~22일 학과별 변경 신청 접수',
    date: '05.18',
  },
  {
    id: 2,
    tag: '복지',
    title: '장애학생지원센터 5월 프로그램 안내',
    summary: '학습 멘토링 및 이동 지원 신청 모집',
    date: '05.17',
  },
  {
    id: 3,
    tag: '행사',
    title: '캠퍼스 접근성 토크 콘서트',
    summary: '5월 30일 학생회관 1층 / 수어통역 제공',
    date: '05.15',
  },
];

const externalActivities = [
  {
    id: 1,
    org: '한국장애인고용공단',
    title: '대학생 인식개선 콘텐츠 공모전',
    deadline: 'D-5',
    deadlineColor: '#B91C1C',
    category: '공모전',
    benefit: '상금 300만원',
  },
  {
    id: 2,
    org: 'SK행복나눔재단',
    title: 'SUNNY 대학생 자원봉사 17기',
    deadline: 'D-10',
    deadlineColor: '#B45309',
    category: '서포터즈',
    benefit: '활동비 + 수료증',
  },
  {
    id: 3,
    org: '카카오임팩트',
    title: '배리어프리 앱 챌린지',
    deadline: 'D-21',
    deadlineColor: '#047857',
    category: '해커톤',
    benefit: '멘토링 + 시상',
  },
];

const UNREAD_NOTIFICATIONS = 3;

type HomePageProps = {
  onSosClick?: () => void;
};

export default function HomePage({ onSosClick }: HomePageProps) {
  const heroScrollRef = useRef<HTMLDivElement | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const handleHeroScroll = () => {
    const el = heroScrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== heroIndex) setHeroIndex(idx);
  };

  const scrollHeroTo = (idx: number) => {
    const el = heroScrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
  };

  const dragState = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  const onCatPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    dragState.current = {
      active: true,
      startX: e.clientX,
      startLeft: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture(e.pointerId);
  };

  const onCatPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    const dx = e.clientX - dragState.current.startX;
    if (Math.abs(dx) > 4) dragState.current.moved = true;
    e.currentTarget.scrollLeft = dragState.current.startLeft - dx;
  };

  const onCatPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const onCatClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragState.current.moved = false;
    }
  };

  return (
    <Box component="main" sx={{ pb: 4 }} lang="ko">
      {/* 상단 헤더 */}
      <Box
        component="header"
        sx={{
          background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
          color: '#fff',
          px: 2,
          pt: 3,
          pb: 4,
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography sx={{ color: '#fff', fontSize: '0.875rem' }}>
              안녕하세요, 홍길동님
            </Typography>
            <Typography
              component="h1"
              sx={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.3 }}
            >
              오늘도 함께하는 캠퍼스
            </Typography>
          </Box>
          <IconButton
            sx={{ color: '#fff', minWidth: 48, minHeight: 48 }}
            aria-label={
              UNREAD_NOTIFICATIONS > 0
                ? `알림 ${UNREAD_NOTIFICATIONS}개 있음`
                : '알림 없음'
            }
          >
            <Badge badgeContent={UNREAD_NOTIFICATIONS} color="error">
              <Bell size={22} aria-hidden="true" />
            </Badge>
          </IconButton>
        </Box>

        {/* 검색바 (실제 인터랙티브) */}
        <ButtonBase
          component="button"
          aria-label="앱 내 게시글, 활동, 시설 검색"
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minHeight: 48,
            '&:focus-visible': {
              outline: '3px solid #FBBF24',
              outlineOffset: 2,
            },
          }}
        >
          <Search size={18} color="#4B5563" aria-hidden="true" />
          <Typography sx={{ color: '#4B5563', fontSize: '0.9375rem' }}>
            게시글·활동·시설 검색
          </Typography>
        </ButtonBase>
      </Box>

      <Box sx={{ px: 2, mt: -2.5 }}>
        {/* 히어로 배너 - 함께하는 활동 광고 (풀폭) */}
        <Box
          component="section"
          aria-labelledby="hero-heading"
          sx={{ mb: 1, mx: -2 }}
        >
          <Typography
            id="hero-heading"
            component="h2"
            sx={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
            }}
          >
            함께하는 활동 추천
          </Typography>
          <Box
            ref={heroScrollRef}
            onScroll={handleHeroScroll}
            role="list"
            aria-label="함께하는 활동 추천 (좌우로 스크롤)"
            sx={{
              display: 'flex',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {heroBanners.map((b) => (
              <Card
                key={b.id}
                role="listitem"
                sx={{
                  minWidth: '100%',
                  maxWidth: '100%',
                  borderRadius: 0,
                  scrollSnapAlign: 'start',
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 'none',
                }}
              >
                <CardActionArea
                  aria-label={`${b.badge}, ${b.title.replace('\n', ' ')}, ${b.subtitle}`}
                  sx={{ position: 'relative', minHeight: 280 }}
                >
                  <Box sx={{ position: 'absolute', inset: 0 }} aria-hidden="true">
                    <ImageWithFallback
                      src={b.image}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: b.overlay,
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: 'relative',
                      px: 3,
                      py: 4,
                      maxWidth: '75%',
                    }}
                  >
                    <Chip
                      label={b.badge}
                      size="small"
                      sx={{
                        bgcolor: '#111827',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        height: 24,
                        mb: 1.5,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: b.accent,
                        whiteSpace: 'pre-line',
                        lineHeight: 1.25,
                        mb: 1,
                      }}
                    >
                      {b.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        color: '#374151',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {b.subtitle}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            ))}
          </Box>
          <Box
            role="tablist"
            aria-label="활동 추천 페이지 표시"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 0.75,
              mt: 1,
              mb: 0,
            }}
          >
            {heroBanners.map((b, i) => (
              <ButtonBase
                key={b.id}
                role="tab"
                aria-selected={i === heroIndex}
                aria-label={`활동 추천 ${i + 1}번째로 이동`}
                onClick={() => scrollHeroTo(i)}
                sx={{
                  minWidth: 24,
                  minHeight: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  '&:focus-visible': {
                    outline: '3px solid #4338CA',
                    outlineOffset: 2,
                  },
                }}
              >
                <Box
                  sx={{
                    width: i === heroIndex ? 22 : 8,
                    height: 8,
                    borderRadius: '999px',
                    bgcolor: i === heroIndex ? '#4338CA' : '#D1D5DB',
                    transition: 'width 0.25s, background-color 0.25s',
                  }}
                  aria-hidden="true"
                />
              </ButtonBase>
            ))}
          </Box>
        </Box>

        {/* 인기 관심 분야 TOP 5 */}
        <Box component="section" aria-labelledby="match-cat-heading" sx={{ mt: 0.5, mb: 2.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.25,
              px: 0.5,
            }}
          >
            <Typography
              id="match-cat-heading"
              component="h2"
              sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#111827' }}
            >
              인기 관심 분야{' '}
              <Box component="span" sx={{ color: '#4338CA', fontWeight: 800 }}>
                TOP 5
              </Box>
            </Typography>
            <Button
              size="small"
              endIcon={<ChevronRight size={16} aria-hidden="true" />}
              aria-label="인기 관심 분야 전체보기"
              sx={{ textTransform: 'none', color: '#4B5563', minHeight: 44 }}
            >
              전체보기
            </Button>
          </Box>
          <Box
            role="list"
            aria-label="인기 관심 분야 TOP 5 (좌우로 드래그 또는 스크롤)"
            onPointerDown={onCatPointerDown}
            onPointerMove={onCatPointerMove}
            onPointerUp={onCatPointerUp}
            onPointerCancel={onCatPointerUp}
            onClickCapture={onCatClickCapture}
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              mx: -2,
              px: 2,
              pb: 1,
              scrollSnapType: 'x mandatory',
              cursor: 'grab',
              userSelect: 'none',
              touchAction: 'pan-x',
              '&:active': { cursor: 'grabbing' },
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {matchCategories.map((c, i) => (
              <ButtonBase
                key={c.id}
                role="listitem"
                aria-label={`${i + 1}위, ${c.label}, ${c.count}개 모임`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.75,
                  flexShrink: 0,
                  scrollSnapAlign: 'start',
                  borderRadius: '12px',
                  '&:focus-visible': {
                    outline: '3px solid #4338CA',
                    outlineOffset: 2,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    overflow: 'hidden',
                  }}
                  aria-hidden="true"
                >
                  <ImageWithFallback
                    src={c.image}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: '#111827',
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {c.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mt: 0.25 }}>
                    {c.count}개 모임
                  </Typography>
                </Box>
              </ButtonBase>
            ))}
          </Box>
        </Box>

        {/* 빠른 메뉴 - 컴팩트 */}
        <Card
          component="section"
          aria-labelledby="quick-menu-heading"
          sx={{ borderRadius: '14px', mb: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
        >
          <Typography
            id="quick-menu-heading"
            component="h2"
            sx={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
            }}
          >
            빠른 메뉴
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              rowGap: 0.5,
              p: 1,
            }}
          >
            {quickMenus.map((m) => {
              const Icon = m.icon;
              return (
                <ButtonBase
                  key={m.label}
                  aria-label={`${m.label} 열기`}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    py: 1.25,
                    minHeight: 76,
                    borderRadius: '10px',
                    '&:focus-visible': {
                      outline: '3px solid #4338CA',
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      bgcolor: m.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} color={m.color} aria-hidden="true" />
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#111827' }}>
                    {m.label}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>
        </Card>

        {/* SOS 안전 안내 */}
        <Card
          component="section"
          aria-labelledby="sos-section-heading"
          sx={{
            borderRadius: '14px',
            mb: 2,
            background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
            color: '#fff',
            boxShadow: '0 6px 14px rgba(185,28,28,0.25)',
          }}
        >
          <CardActionArea
            onClick={onSosClick}
            aria-label="긴급 도움 호출 화면 열기"
            sx={{ p: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldAlert size={26} color="#fff" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  id="sos-section-heading"
                  component="h2"
                  sx={{ fontSize: '1rem', fontWeight: 800, mb: 0.25, color: '#fff' }}
                >
                  도움이 필요할 때, 1탭 SOS
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#FECACA' }}>
                  보호자·지원센터·보안실·119에 위치와 함께 즉시 호출
                </Typography>
              </Box>
              <Box
                aria-hidden="true"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#fff',
                }}
              >
                <PhoneCall size={18} color="#B91C1C" />
              </Box>
            </Box>
          </CardActionArea>
        </Card>

        {/* 마감 임박 활동 */}
        <Box component="section" aria-labelledby="activities-heading" sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.25,
              px: 0.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Clock size={18} color="#B45309" aria-hidden="true" />
              <Typography
                id="activities-heading"
                component="h2"
                sx={{ fontWeight: 700, fontSize: '1rem' }}
              >
                마감 임박 활동
              </Typography>
            </Box>
            <Button
              size="small"
              endIcon={<ChevronRight size={16} aria-hidden="true" />}
              aria-label="마감 임박 활동 전체보기"
              sx={{ textTransform: 'none', color: '#4B5563', minHeight: 44 }}
            >
              전체보기
            </Button>
          </Box>
          <Box
            role="list"
            aria-label="마감 임박 활동 목록 (좌우로 스크롤)"
            sx={{
              display: 'flex',
              gap: 1.5,
              overflowX: 'auto',
              pb: 1,
              mx: -2,
              px: 2,
              scrollSnapType: 'x mandatory',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {activities.map((a) => {
              const DIcon = a.deadlineIcon;
              const TIcon = a.typeIcon;
              return (
                <Card
                  key={a.id}
                  role="listitem"
                  sx={{
                    minWidth: 240,
                    borderRadius: '14px',
                    scrollSnapAlign: 'start',
                    flexShrink: 0,
                  }}
                >
                  <CardActionArea
                    aria-label={`${a.deadlineLabel}, ${a.deadline}, ${a.category}, ${a.org}, ${a.title}, 모집률 ${a.progress}퍼센트, 접근 편의: ${a.accessibility.join(', ')}`}
                    sx={{ p: 2 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TIcon size={14} color="#4B5563" aria-hidden="true" />
                        <Typography sx={{ fontSize: '0.75rem', color: '#1F2937', fontWeight: 600 }}>
                          {a.category}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<DIcon size={12} aria-hidden="true" />}
                        label={`${a.deadlineLabel} · ${a.deadline}`}
                        size="small"
                        sx={{
                          bgcolor: `${a.deadlineColor}15`,
                          color: a.deadlineColor,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          height: 22,
                          '& .MuiChip-icon': { color: a.deadlineColor, ml: 0.5 },
                        }}
                      />
                    </Box>
                    <Typography sx={{ color: '#4B5563', fontSize: '0.8125rem' }}>
                      {a.org}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        mb: 1.5,
                        mt: 0.25,
                        minHeight: 44,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {a.title}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ color: '#4B5563', fontSize: '0.75rem' }}>
                          모집률
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {a.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={a.progress}
                        aria-label={`모집률 ${a.progress}퍼센트`}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: '#F3F4F6',
                          '& .MuiLinearProgress-bar': { bgcolor: a.deadlineColor },
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 0.5,
                      }}
                    >
                      <Chip
                        icon={<Accessibility size={12} aria-hidden="true" />}
                        label={`접근 편의: ${a.accessibility.join(', ')}`}
                        size="small"
                        sx={{
                          bgcolor: '#D1FAE5',
                          color: '#065F46',
                          fontSize: '0.75rem',
                          height: 22,
                          '& .MuiChip-icon': { color: '#065F46', ml: 0.5 },
                        }}
                      />
                      <Box
                        aria-hidden="true"
                        sx={{
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6B7280',
                        }}
                      >
                        <Bookmark size={16} />
                      </Box>
                    </Box>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* 실시간 인기글 */}
        <Card
          component="section"
          aria-labelledby="hot-posts-heading"
          sx={{ borderRadius: '14px', mb: 2 }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                pt: 2,
                pb: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Flame size={18} color="#B91C1C" aria-hidden="true" />
                <Typography
                  id="hot-posts-heading"
                  component="h2"
                  sx={{ fontWeight: 700, fontSize: '1rem' }}
                >
                  실시간 인기글
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ChevronRight size={16} aria-hidden="true" />}
                aria-label="실시간 인기글 전체보기"
                sx={{ textTransform: 'none', color: '#4B5563', minHeight: 44 }}
              >
                전체보기
              </Button>
            </Box>
            <Divider />
            <List sx={{ p: 0 }} aria-label="실시간 인기 게시글 목록">
              {hotPosts.map((p, idx) => (
                <Box key={p.id}>
                  <ListItemButton
                    sx={{ px: 2, py: 1.5, minHeight: 64 }}
                    aria-label={`${p.isHot ? '인기, ' : ''}${p.board}, ${p.title}, 좋아요 ${p.likes}, 댓글 ${p.comments}, 조회수 ${p.views}`}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          sx={{ color: '#4338CA', fontWeight: 600, fontSize: '0.8125rem' }}
                        >
                          {p.board}
                        </Typography>
                        {p.isHot && (
                          <Chip
                            label="인기"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.75rem',
                              bgcolor: '#FEE2E2',
                              color: '#B91C1C',
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '0.9375rem',
                          mb: 0.75,
                          color: '#111827',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {p.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1.5 }} aria-hidden="true">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ThumbsUp size={13} color="#6B7280" />
                          <Typography sx={{ color: '#4B5563', fontSize: '0.8125rem' }}>
                            {p.likes}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MessageSquare size={13} color="#6B7280" />
                          <Typography sx={{ color: '#4B5563', fontSize: '0.8125rem' }}>
                            {p.comments}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Eye size={13} color="#6B7280" />
                          <Typography sx={{ color: '#4B5563', fontSize: '0.8125rem' }}>
                            {p.views}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </ListItemButton>
                  {idx < hotPosts.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* 교내 소식 */}
        <Card
          component="section"
          aria-labelledby="campus-news-heading"
          sx={{ borderRadius: '14px', mb: 2 }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                pt: 2,
                pb: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Newspaper size={18} color="#4338CA" aria-hidden="true" />
                <Typography
                  id="campus-news-heading"
                  component="h2"
                  sx={{ fontWeight: 700, fontSize: '1rem' }}
                >
                  교내 소식
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ChevronRight size={16} aria-hidden="true" />}
                aria-label="교내 소식 전체보기"
                sx={{ textTransform: 'none', color: '#4B5563', minHeight: 44 }}
              >
                전체보기
              </Button>
            </Box>
            <Divider />
            <List sx={{ p: 0 }} aria-label="교내 소식 목록">
              {campusNews.map((n, idx) => (
                <Box key={n.id}>
                  <ListItemButton
                    sx={{ px: 2, py: 1.75, minHeight: 72 }}
                    aria-label={`${n.tag}, ${n.title}, ${n.summary}, ${n.date}`}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip
                          label={n.tag}
                          size="small"
                          sx={{
                            bgcolor: '#EEF0FF',
                            color: '#4338CA',
                            fontSize: '0.75rem',
                            height: 22,
                            fontWeight: 600,
                          }}
                        />
                        <Typography sx={{ color: '#4B5563', fontSize: '0.75rem', ml: 'auto' }}>
                          {n.date}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '0.9375rem',
                          color: '#111827',
                          fontWeight: 600,
                          mb: 0.25,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {n.title}
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
                        {n.summary}
                      </Typography>
                    </Box>
                  </ListItemButton>
                  {idx < campusNews.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* 대외활동 */}
        <Card
          component="section"
          aria-labelledby="external-heading"
          sx={{ borderRadius: '14px' }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                pt: 2,
                pb: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Briefcase size={18} color="#0E7490" aria-hidden="true" />
                <Typography
                  id="external-heading"
                  component="h2"
                  sx={{ fontWeight: 700, fontSize: '1rem' }}
                >
                  대외활동
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ChevronRight size={16} aria-hidden="true" />}
                aria-label="대외활동 전체보기"
                sx={{ textTransform: 'none', color: '#4B5563', minHeight: 44 }}
              >
                전체보기
              </Button>
            </Box>
            <Divider />
            <List sx={{ p: 0 }} aria-label="대외활동 목록">
              {externalActivities.map((e, idx) => (
                <Box key={e.id}>
                  <ListItemButton
                    sx={{ px: 2, py: 1.75, minHeight: 72 }}
                    aria-label={`${e.deadline}, ${e.category}, ${e.org}, ${e.title}, 혜택 ${e.benefit}`}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                        <Chip
                          label={e.category}
                          size="small"
                          sx={{
                            bgcolor: '#F3F4F6',
                            color: '#1F2937',
                            fontSize: '0.75rem',
                            height: 22,
                          }}
                        />
                        <Chip
                          label={e.deadline}
                          size="small"
                          sx={{
                            bgcolor: `${e.deadlineColor}15`,
                            color: e.deadlineColor,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            height: 22,
                          }}
                        />
                        <Typography sx={{ color: '#4B5563', fontSize: '0.75rem', ml: 'auto' }}>
                          {e.benefit}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '0.8125rem',
                          color: '#4B5563',
                          mb: 0.25,
                        }}
                      >
                        {e.org}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.9375rem',
                          color: '#111827',
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {e.title}
                      </Typography>
                    </Box>
                  </ListItemButton>
                  {idx < externalActivities.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
