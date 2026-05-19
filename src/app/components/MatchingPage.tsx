import { useState } from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Chip,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  HandHeart,
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  Plus,
  MessageCircle,
  ChevronRight,
  Info,
  Sparkles,
  UserCheck,
  BadgeCheck,
  Award,
  Star,
  GraduationCap,
} from 'lucide-react';

type Companion = {
  id: number;
  author: string;
  role: '이용자' | '제공자';
  title: string;
  purpose: string;
  location: string;
  date: string;
  duration: string;
  tags: string[];
  needs: string[];
  status: '모집중' | '매칭대기' | '확정';
  verified?: boolean;
  schoolPartner?: boolean;
  volunteerHours?: number;
  mannerScore?: number;
};

const requests: Companion[] = [
  {
    id: 1,
    author: '익명 이용자',
    role: '이용자',
    title: '도서관에서 시험공부 함께 해주실 분',
    purpose: '중앙도서관에서 4시간 정도 공부 동행',
    location: '중앙도서관 3층',
    date: '2026.05.22 (금)',
    duration: '14:00 - 18:00',
    tags: ['학습', '실내'],
    needs: ['휠체어 이동 보조', '책 운반'],
    status: '모집중',
    verified: true,
    schoolPartner: true,
    volunteerHours: 4,
    mannerScore: 4.8,
  },
  {
    id: 2,
    author: '익명 이용자',
    role: '이용자',
    title: '학생회관 행사 참여 동행',
    purpose: '신입생 환영회에 함께 참여하고 싶어요',
    location: '학생회관 1층',
    date: '2026.05.25 (월)',
    duration: '18:00 - 20:00',
    tags: ['행사', '저녁'],
    needs: ['시각 안내', '이동 보조'],
    status: '매칭대기',
    verified: true,
    volunteerHours: 2,
    mannerScore: 4.9,
  },
  {
    id: 3,
    author: '익명 이용자',
    role: '이용자',
    title: '캠퍼스 산책 동행 부탁드려요',
    purpose: '오랜만에 캠퍼스 한 바퀴 걷고 싶어요',
    location: '정문 → 후문',
    date: '2026.05.23 (토)',
    duration: '10:00 - 11:30',
    tags: ['산책', '실외'],
    needs: ['휠체어 이동 보조'],
    status: '모집중',
    verified: true,
    volunteerHours: 1.5,
    mannerScore: 5.0,
  },
];

const offers: Companion[] = [
  {
    id: 11,
    author: '익명 제공자',
    role: '제공자',
    title: '주말 오전 동행 가능합니다',
    purpose: '독서, 산책, 카페 등 편하게 함께해요',
    location: '캠퍼스 전 지역',
    date: '주말 가능',
    duration: '2-3시간',
    tags: ['주말', '유연'],
    needs: ['수어 가능', '이동 보조 경험'],
    status: '모집중',
    verified: true,
    schoolPartner: true,
    volunteerHours: 3,
    mannerScore: 4.9,
  },
  {
    id: 12,
    author: '익명 제공자',
    role: '제공자',
    title: '평일 저녁 학습 도우미',
    purpose: '시험기간 함께 공부할 분 찾아요',
    location: '도서관/스터디룸',
    date: '평일 저녁',
    duration: '2-4시간',
    tags: ['학습', '평일'],
    needs: ['전공: 컴퓨터공학', '책 운반 가능'],
    status: '모집중',
    verified: true,
    volunteerHours: 4,
    mannerScore: 4.7,
  },
];

const myMatches: (Companion & { step: number })[] = [
  {
    id: 21,
    author: '김** 제공자',
    role: '제공자',
    title: '도서관에서 시험공부 함께 해주실 분',
    purpose: '중앙도서관에서 4시간 정도 공부 동행',
    location: '중앙도서관 3층',
    date: '2026.05.22 (금)',
    duration: '14:00 - 18:00',
    tags: ['학습'],
    needs: [],
    status: '확정',
    step: 2,
  },
  {
    id: 22,
    author: '이** 제공자',
    role: '제공자',
    title: '캠퍼스 산책 동행',
    purpose: '오랜만에 캠퍼스 한 바퀴 걷고 싶어요',
    location: '정문 → 후문',
    date: '2026.05.23 (토)',
    duration: '10:00 - 11:30',
    tags: ['산책'],
    needs: [],
    status: '매칭대기',
    step: 1,
  },
];

const steps = ['접수신청', '매칭', '일정조율', '동행', '종료/설문'];

function CompanionCard({
  item,
  onApply,
}: {
  item: Companion;
  onApply: (item: Companion) => void;
}) {
  const statusColor =
    item.status === '확정' ? '#34D399' : item.status === '매칭대기' ? '#F59E0B' : '#5B67F5';
  const roleColor = item.role === '이용자' ? '#5B67F5' : '#EC4899';

  return (
    <Card sx={{ borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={item.role}
              size="small"
              sx={{
                bgcolor: `${roleColor}15`,
                color: roleColor,
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {item.author}
            </Typography>
            {item.mannerScore && (
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}
                aria-label={`매너 점수 ${item.mannerScore} / 5점`}
              >
                <Star size={12} color="#F59E0B" fill="#F59E0B" aria-hidden="true" />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E' }}>
                  {item.mannerScore.toFixed(1)}
                </Typography>
              </Box>
            )}
          </Box>
          <Chip
            label={item.status}
            size="small"
            sx={{ bgcolor: `${statusColor}15`, color: statusColor, fontSize: '0.7rem', fontWeight: 700 }}
          />
        </Box>

        {/* 신뢰 배지 라인 */}
        {(item.verified || item.schoolPartner) && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.25 }} role="list" aria-label="신뢰 배지">
            {item.verified && (
              <Chip
                role="listitem"
                icon={<BadgeCheck size={12} aria-hidden="true" />}
                label="학교 이메일 인증"
                size="small"
                sx={{
                  bgcolor: '#D1FAE5',
                  color: '#065F46',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 22,
                  '& .MuiChip-icon': { color: '#065F46', ml: 0.5 },
                }}
              />
            )}
            {item.schoolPartner && (
              <Chip
                role="listitem"
                icon={<ShieldCheck size={12} aria-hidden="true" />}
                label="학교 공동 인증 활동"
                size="small"
                sx={{
                  bgcolor: '#EEF0FF',
                  color: '#4338CA',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 22,
                  '& .MuiChip-icon': { color: '#4338CA', ml: 0.5 },
                }}
              />
            )}
          </Box>
        )}

        <Typography variant="h6" sx={{ fontSize: '1rem', mb: 0.5 }}>
          {item.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {item.purpose}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapPin size={14} color="#6B7280" />
            <Typography variant="body2" color="text.secondary">
              {item.location}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={14} color="#6B7280" />
            <Typography variant="body2" color="text.secondary">
              {item.date}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Clock size={14} color="#6B7280" />
            <Typography variant="body2" color="text.secondary">
              {item.duration}
            </Typography>
          </Box>
        </Box>

        {item.needs.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              {item.role === '이용자' ? '필요한 도움' : '제공 가능'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {item.needs.map((n) => (
                <Chip
                  key={n}
                  label={n}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
          {item.tags.map((t) => (
            <Chip
              key={t}
              label={`#${t}`}
              size="small"
              sx={{ bgcolor: '#F3F4F6', fontSize: '0.7rem' }}
            />
          ))}
        </Box>

        {/* 비장애학생 인센티브 표시 */}
        {item.volunteerHours && item.role === '이용자' && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '10px',
              px: 1.5,
              py: 1,
              mb: 1.5,
            }}
            role="note"
            aria-label={`완료 시 봉사 ${item.volunteerHours}시간 인정`}
          >
            <Award size={16} color="#047857" aria-hidden="true" />
            <Typography sx={{ fontSize: '0.8125rem', color: '#065F46', fontWeight: 700 }}>
              완료 시 봉사 {item.volunteerHours}시간 인정
            </Typography>
            {item.schoolPartner && (
              <Chip
                icon={<GraduationCap size={11} aria-hidden="true" />}
                label="학점 연계"
                size="small"
                sx={{
                  ml: 'auto',
                  height: 20,
                  fontSize: '0.6875rem',
                  bgcolor: '#fff',
                  color: '#047857',
                  fontWeight: 700,
                  border: '1px solid #A7F3D0',
                  '& .MuiChip-icon': { color: '#047857', ml: 0.5 },
                }}
              />
            )}
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={() => onApply(item)}
          startIcon={<HandHeart size={18} />}
          sx={{
            bgcolor: roleColor,
            borderRadius: '10px',
            textTransform: 'none',
            boxShadow: 'none',
            minHeight: 44,
            '&:hover': { bgcolor: roleColor, opacity: 0.9 },
          }}
        >
          {item.role === '이용자' ? '동행 제공하기' : '동행 요청하기'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function MatchingPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [newOpen, setNewOpen] = useState(false);
  const [applyTarget, setApplyTarget] = useState<Companion | null>(null);
  const [formRole, setFormRole] = useState<'이용자' | '제공자'>('이용자');

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <Box sx={{ pt: 2, mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          동행 매칭
        </Typography>
        <Typography variant="body2" color="text.secondary">
          서로 짝이 되어 의미있는 동행을 시작하세요
        </Typography>
      </Box>

      <Alert
        icon={<ShieldCheck size={20} />}
        severity="info"
        sx={{
          borderRadius: '12px',
          bgcolor: '#EEF2FF',
          color: '#3730A3',
          mb: 2,
          '& .MuiAlert-icon': { color: '#5B67F5' },
        }}
        action={
          <IconButton size="small" aria-label="안전 가이드 보기">
            <ChevronRight size={18} />
          </IconButton>
        }
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          안전한 동행을 위한 가이드
        </Typography>
        <Typography variant="caption">
          매칭 확정 시 서비스 이행 가이드라인에 동의하게 됩니다
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => {
            setFormRole('이용자');
            setNewOpen(true);
          }}
          sx={{
            bgcolor: '#5B67F5',
            borderRadius: '12px',
            textTransform: 'none',
            boxShadow: 'none',
            py: 1.25,
            '&:hover': { bgcolor: '#4A56E4' },
          }}
        >
          동행 요청
        </Button>
        <Button
          fullWidth
          variant="contained"
          startIcon={<HandHeart size={18} />}
          onClick={() => {
            setFormRole('제공자');
            setNewOpen(true);
          }}
          sx={{
            bgcolor: '#EC4899',
            borderRadius: '12px',
            textTransform: 'none',
            boxShadow: 'none',
            py: 1.25,
            '&:hover': { bgcolor: '#DB2777' },
          }}
        >
          동행 제공
        </Button>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={(_, v) => setSelectedTab(v)}
        variant="fullWidth"
        sx={{
          mb: 2,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
        }}
      >
        <Tab label="동행 요청" />
        <Tab label="동행 제공" />
        <Tab label="내 매칭" />
      </Tabs>

      {selectedTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Sparkles size={16} color="#5B67F5" />
            <Typography variant="body2" color="text.secondary">
              현재 모집중인 동행 요청 {requests.length}건
            </Typography>
          </Box>
          {requests.map((r) => (
            <CompanionCard key={r.id} item={r} onApply={setApplyTarget} />
          ))}
        </Box>
      )}

      {selectedTab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <UserCheck size={16} color="#EC4899" />
            <Typography variant="body2" color="text.secondary">
              동행을 제공해주실 분 {offers.length}명
            </Typography>
          </Box>
          {offers.map((o) => (
            <CompanionCard key={o.id} item={o} onApply={setApplyTarget} />
          ))}
        </Box>
      )}

      {selectedTab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {myMatches.length === 0 ? (
            <Card sx={{ borderRadius: '12px', p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">아직 진행 중인 매칭이 없습니다</Typography>
            </Card>
          ) : (
            myMatches.map((m) => (
              <Card key={m.id} sx={{ borderRadius: '14px' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#EC489915', color: '#EC4899' }}>
                      {m.author.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                        {m.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {m.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={m.status}
                      size="small"
                      sx={{
                        bgcolor: m.status === '확정' ? '#34D39915' : '#F59E0B15',
                        color: m.status === '확정' ? '#0F7C5C' : '#B45309',
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      bgcolor: '#F9FAFB',
                      borderRadius: '10px',
                      p: 1.5,
                      mb: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MapPin size={13} color="#6B7280" />
                      <Typography variant="caption">{m.location}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Calendar size={13} color="#6B7280" />
                      <Typography variant="caption">
                        {m.date} · {m.duration}
                      </Typography>
                    </Box>
                  </Box>

                  <Stepper activeStep={m.step} alternativeLabel sx={{ mb: 2 }}>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel
                          sx={{
                            '& .MuiStepLabel-label': { fontSize: '0.65rem' },
                          }}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  <Divider sx={{ mb: 1.5 }} />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<MessageCircle size={16} />}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        borderColor: '#E5E7EB',
                        color: '#374151',
                      }}
                    >
                      오픈채팅
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Info size={16} />}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        borderColor: '#E5E7EB',
                        color: '#374151',
                      }}
                    >
                      상세
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      <Dialog open={newOpen} onClose={() => setNewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>
          {formRole === '이용자' ? '동행 요청 등록' : '동행 제공 등록'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Alert severity="info" sx={{ borderRadius: '10px' }}>
            매칭 시 개인정보가 노출되지 않도록 정책이 마련되어 있습니다
          </Alert>
          <TextField
            select
            label="구분"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value as '이용자' | '제공자')}
            fullWidth
          >
            <MenuItem value="이용자">이용자 (도움이 필요해요)</MenuItem>
            <MenuItem value="제공자">제공자 (도움을 드릴게요)</MenuItem>
          </TextField>
          <TextField label="제목" placeholder="예: 도서관 공부 동행" fullWidth />
          <TextField
            label="동행 목적/내용"
            placeholder="어떤 동행을 원하시는지 적어주세요"
            multiline
            rows={3}
            fullWidth
          />
          <TextField label="장소" placeholder="예: 중앙도서관 3층" fullWidth />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField label="날짜" type="date" InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="시간" placeholder="14:00-18:00" fullWidth />
          </Box>
          <TextField
            label={formRole === '이용자' ? '필요한 도움' : '제공 가능한 도움'}
            placeholder="쉼표로 구분 (예: 이동 보조, 책 운반)"
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNewOpen(false)} sx={{ textTransform: 'none' }}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={() => setNewOpen(false)}
            sx={{
              bgcolor: formRole === '이용자' ? '#5B67F5' : '#EC4899',
              textTransform: 'none',
              boxShadow: 'none',
            }}
          >
            등록하기
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!applyTarget} onClose={() => setApplyTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 600 }}>
          {applyTarget?.role === '이용자' ? '동행 제공 신청' : '동행 요청 신청'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            "{applyTarget?.title}"에 신청하시겠습니까?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: '10px', fontSize: '0.8rem' }}>
            신청 후 서로 서비스팀에서 조건에 따라 매칭을 진행합니다. 확정 시 오픈채팅방으로
            연결됩니다.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setApplyTarget(null)} sx={{ textTransform: 'none' }}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={() => setApplyTarget(null)}
            sx={{ bgcolor: '#5B67F5', textTransform: 'none', boxShadow: 'none' }}
          >
            신청하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
