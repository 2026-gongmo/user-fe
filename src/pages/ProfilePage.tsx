import { useState } from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Chip,
  Box,
  Typography,
  Button,
  Switch,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  ButtonBase,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import {
  Edit,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Accessibility,
  ChevronRight,
  BadgeCheck,
  GraduationCap,
  Award,
  FileText,
  Download,
  HeartHandshake,
  UserPlus,
  Eye,
  Hand,
  MoveVertical,
  Ear,
  Stethoscope,
  Sparkles,
  Star,
  ShieldCheck,
  MessageCircle,
  X,
  Settings,
} from 'lucide-react';
import AccessibilityDialog from '../components/AccessibilityDialog';
import {
  currentUser as userProfile,
  volunteerStats,
  friends,
  certificates,
} from '../data/mockData';

// 아이콘 ref 가 들어가는 UI 카탈로그는 컴포넌트 내부 유지
const accessNeeds = [
  { id: 'mobility', icon: MoveVertical, label: '이동 보조', selected: true },
  { id: 'vision', icon: Eye, label: '시각 안내', selected: false },
  { id: 'hearing', icon: Ear, label: '청각/수어', selected: false },
  { id: 'medical', icon: Stethoscope, label: '내부장애', selected: false },
];

const offerSkills = [
  { id: 'sign', label: '수어 가능', selected: false },
  { id: 'mobility-help', label: '휠체어 이동 보조', selected: true },
  { id: 'note', label: '필기 도우미', selected: true },
  { id: 'reading', label: '낭독·낭송', selected: false },
  { id: 'tech', label: '전자기기 보조', selected: false },
];

export default function ProfilePage() {
  const [a11yOpen, setA11yOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);

  const progressPct = Math.min(
    100,
    Math.round((volunteerStats.thisSemester / volunteerStats.goal) * 100),
  );

  return (
    <Box component="main" lang="ko" sx={{ p: 2, pb: 4 }}>
      <Box sx={{ pt: 2, mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            내 프로필
          </Typography>
          <Typography variant="body2" color="text.secondary">
            매칭과 활동에 쓰이는 정보를 관리하세요
          </Typography>
        </Box>
        <IconButton
          sx={{ color: '#6B7280', minWidth: 44, minHeight: 44 }}
          aria-label="설정"
        >
          <Settings size={22} aria-hidden="true" />
        </IconButton>
      </Box>

      <Alert
        icon={<ShieldCheck size={20} />}
        severity="info"
        sx={{
          borderRadius: '12px',
          bgcolor: '#EEF2FF',
          color: '#172554',
          mb: 2,
          '& .MuiAlert-icon': { color: '#1E3A8A' },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          프로필 공개 범위가 보호됩니다
        </Typography>
        <Typography variant="caption">
          매칭 상대에게는 필요한 정보만 요약해서 보여줍니다
        </Typography>
      </Alert>

        {/* 프로필 카드 */}
        <Card sx={{ borderRadius: '12px', boxShadow: 'none' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Avatar
                sx={{ width: 64, height: 64, bgcolor: '#1E3A8A', fontSize: '1.75rem' }}
                aria-label={`${userProfile.name} 프로필 사진`}
              >
                {userProfile.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    {userProfile.name}
                  </Typography>
                  <Chip
                    icon={<Star size={11} aria-hidden="true" />}
                    label={userProfile.badge}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      bgcolor: '#FEF3C7',
                      color: '#B45309',
                      fontWeight: 700,
                      '& .MuiChip-icon': { color: '#B45309', ml: 0.5 },
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563' }}>
                  {userProfile.university} · {userProfile.major}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  {userProfile.email}
                </Typography>
              </Box>
            </Box>

            {/* 신뢰 배지 라인 */}
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }} role="list" aria-label="인증 배지">
              {userProfile.emailVerified && (
                <Chip
                  role="listitem"
                  icon={<BadgeCheck size={14} aria-hidden="true" />}
                  label="학교 이메일 인증"
                  size="small"
                  sx={{
                    bgcolor: '#D1FAE5',
                    color: '#065F46',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: 26,
                    '& .MuiChip-icon': { color: '#065F46', ml: 0.5 },
                  }}
                />
              )}
              <Chip
                role="listitem"
                icon={<ShieldCheck size={14} aria-hidden="true" />}
                label="학교 협약(MOU)"
                size="small"
                sx={{
                  bgcolor: '#EEF2FF',
                  color: '#1E3A8A',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 26,
                  '& .MuiChip-icon': { color: '#1E3A8A', ml: 0.5 },
                }}
              />
              <Chip
                role="listitem"
                icon={<HeartHandshake size={14} aria-hidden="true" />}
                label={`매너 4.9 / 5.0`}
                size="small"
                sx={{
                  bgcolor: '#ECFDF5',
                  color: '#15803D',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 26,
                  '& .MuiChip-icon': { color: '#15803D', ml: 0.5 },
                }}
              />
            </Box>

            <Typography sx={{ fontSize: '0.875rem', color: '#374151', mb: 1.5 }}>
              {userProfile.bio}
            </Typography>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<Edit size={16} aria-hidden="true" />}
              onClick={() => setProfileEditOpen(true)}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                minHeight: 44,
                borderColor: '#D1D5DB',
                color: '#1F2937',
              }}
            >
              프로필 수정
            </Button>
          </CardContent>
        </Card>

        {/* 봉사시간/활동확인서 카드 (비장애학생 인센티브) */}
        <Card
          component="section"
          aria-labelledby="volunteer-heading"
          sx={{
            borderRadius: '12px',
            mt: 2,
            boxShadow: 'none',
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Award size={20} color="#047857" aria-hidden="true" />
                <Typography
                  id="volunteer-heading"
                  component="h2"
                  sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}
                >
                  봉사시간 · 활동확인서
                </Typography>
              </Box>
              <Chip
                label={`이번 학기 ${volunteerStats.thisSemester}h`}
                size="small"
                sx={{
                  bgcolor: '#047857',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1,
                mb: 1.5,
              }}
            >
              <Box sx={{ textAlign: 'center', bgcolor: '#F8FAFC', border: '1px solid #EEF1F4', borderRadius: '10px', py: 1.25 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>
                  {volunteerStats.totalHours}h
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#065F46' }}>누적 시간</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', bgcolor: '#F8FAFC', border: '1px solid #EEF1F4', borderRadius: '10px', py: 1.25 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>
                  {volunteerStats.activities}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#065F46' }}>참여 활동</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', bgcolor: '#F8FAFC', border: '1px solid #EEF1F4', borderRadius: '10px', py: 1.25 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>
                  {volunteerStats.certificates}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#065F46' }}>발급 확인서</Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 600 }}>
                  학기 목표 달성률
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 700 }}>
                  {progressPct}% ({volunteerStats.thisSemester}/{volunteerStats.goal}h)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPct}
                aria-label={`이번 학기 봉사시간 목표 달성률 ${progressPct}퍼센트`}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(4,120,87,0.15)',
                  '& .MuiLinearProgress-bar': { bgcolor: '#047857' },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FileText size={16} aria-hidden="true" />}
                onClick={() => setCertOpen(true)}
                sx={{
                  bgcolor: '#047857',
                  color: '#fff',
                  borderRadius: '10px',
                  textTransform: 'none',
                  minHeight: 44,
                  boxShadow: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { bgcolor: '#065F46' },
                }}
              >
                활동확인서 발급
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GraduationCap size={16} aria-hidden="true" />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  minHeight: 44,
                  borderColor: '#047857',
                  color: '#047857',
                  fontSize: '0.875rem',
                }}
              >
                학점 신청 안내
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 접근 프로파일 카드 */}
        <Card
          component="section"
          aria-labelledby="access-heading"
          sx={{ borderRadius: '12px', mt: 2 }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Accessibility size={20} color="#1E3A8A" aria-hidden="true" />
                <Typography
                  id="access-heading"
                  component="h2"
                  sx={{ fontWeight: 700, fontSize: '1rem' }}
                >
                  접근 프로파일
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ChevronRight size={14} aria-hidden="true" />}
                sx={{ textTransform: 'none', color: '#4B5563', minHeight: 36 }}
              >
                편집
              </Button>
            </Box>

            <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mb: 1 }}>
              필요한 도움 (이용자 입력)
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
              {accessNeeds.map((n) => {
                const Icon = n.icon;
                return (
                  <Chip
                    key={n.id}
                    icon={<Icon size={14} aria-hidden="true" />}
                    label={n.label}
                    size="small"
                    sx={{
                      bgcolor: n.selected ? '#EEF2FF' : '#F3F4F6',
                      color: n.selected ? '#1E3A8A' : '#9CA3AF',
                      fontWeight: n.selected ? 700 : 500,
                      fontSize: '0.8125rem',
                      height: 30,
                      border: n.selected ? '1px solid #E0E7FF' : '1px solid transparent',
                      '& .MuiChip-icon': { color: n.selected ? '#1E3A8A' : '#9CA3AF', ml: 0.5 },
                    }}
                  />
                );
              })}
            </Box>

            <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mb: 1 }}>
              제공 가능한 도움 (제공자 입력)
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {offerSkills.map((s) => (
                <Chip
                  key={s.id}
                  icon={<Hand size={14} aria-hidden="true" />}
                  label={s.label}
                  size="small"
                  sx={{
                    bgcolor: s.selected ? '#ECFDF5' : '#F3F4F6',
                    color: s.selected ? '#15803D' : '#9CA3AF',
                    fontWeight: s.selected ? 700 : 500,
                    fontSize: '0.8125rem',
                    height: 30,
                    border: s.selected ? '1px solid #BBF7D0' : '1px solid transparent',
                    '& .MuiChip-icon': { color: s.selected ? '#15803D' : '#9CA3AF', ml: 0.5 },
                  }}
                />
              ))}
            </Box>

            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: '#F9FAFB',
                borderRadius: '10px',
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
              }}
            >
              <Sparkles size={16} color="#1E3A8A" aria-hidden="true" />
              <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', lineHeight: 1.5 }}>
                입력한 프로파일은 매칭 추천에 활용됩니다. 매칭 상대에게는 일부 정보만 비공개·요약 형태로 노출됩니다.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* 친구 카드 */}
        <Card component="section" aria-labelledby="friends-heading" sx={{ borderRadius: '12px', mt: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                pt: 2,
                pb: 1.25,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <UserPlus size={20} color="#15803D" aria-hidden="true" />
                <Typography
                  id="friends-heading"
                  component="h2"
                  sx={{ fontWeight: 700, fontSize: '1rem' }}
                >
                  내 친구 ({friends.length})
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ChevronRight size={14} aria-hidden="true" />}
                onClick={() => setFriendsOpen(true)}
                sx={{ textTransform: 'none', color: '#4B5563', minHeight: 36 }}
              >
                전체보기
              </Button>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', px: 2, py: 1.5 }}>
              {friends.map((f) => (
                <ButtonBase
                  key={f.id}
                  aria-label={`${f.name}, ${f.role}, 함께한 활동 ${f.activities}회`}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    minWidth: 64,
                    py: 0.5,
                    borderRadius: '8px',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: f.role === '이용자' ? '#EEF2FF' : '#ECFDF5',
                      color: f.role === '이용자' ? '#1E3A8A' : '#15803D',
                      fontWeight: 700,
                    }}
                  >
                    {f.name.charAt(0)}
                  </Avatar>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#111827' }}>
                    {f.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#6B7280' }}>
                    {f.activities}회 동행
                  </Typography>
                </ButtonBase>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* 설정 메뉴 카드 */}
        <Card sx={{ borderRadius: '12px', mt: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <MenuRow
              icon={<Accessibility size={20} color="#1E3A8A" aria-hidden="true" />}
              label="접근성 설정"
              sub="고대비·자막·수어·글자크기"
              onClick={() => setA11yOpen(true)}
            />
            <Divider />
            <MenuRow
              icon={<Bell size={20} color="#B45309" aria-hidden="true" />}
              label="알림 설정"
              sub="매칭·메시지·활동 알림"
            />
            <Divider />
            <MenuRow
              icon={<Shield size={20} color="#047857" aria-hidden="true" />}
              label="개인정보 보호"
              sub="공개 범위·차단 목록"
            />
            <Divider />
            <MenuRow
              icon={<MessageCircle size={20} color="#15803D" aria-hidden="true" />}
              label="문의/신고"
              sub="베프 운영팀에 문의"
            />
            <Divider />
            <MenuRow
              icon={<HelpCircle size={20} color="#6B7280" aria-hidden="true" />}
              label="도움말"
              sub="이용 가이드·FAQ"
            />
          </CardContent>
        </Card>

        {/* 빠른 알림 토글 */}
        <Card sx={{ borderRadius: '12px', mt: 2 }}>
          <CardContent sx={{ px: 2.5, py: 1 }}>
            <ToggleRow label="새로운 활동 알림" defaultChecked />
            <Divider />
            <ToggleRow label="매칭 알림" defaultChecked />
            <Divider />
            <ToggleRow label="메시지 알림" />
          </CardContent>
        </Card>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<LogOut size={18} aria-hidden="true" />}
          sx={{
            mt: 2,
            borderRadius: '10px',
            textTransform: 'none',
            color: '#B91C1C',
            borderColor: '#FCA5A5',
            minHeight: 48,
            '&:hover': {
              borderColor: '#B91C1C',
              bgcolor: '#FEE2E2',
            },
          }}
        >
          로그아웃
        </Button>

      {/* 접근성 설정 다이얼로그 */}
      <AccessibilityDialog open={a11yOpen} onClose={() => setA11yOpen(false)} />

      {/* 프로필 수정 다이얼로그 */}
      <Dialog
        open={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="edit-profile-title"
      >
        <DialogTitle id="edit-profile-title" sx={{ fontWeight: 700 }}>
          프로필 수정
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="이름" defaultValue={userProfile.name} fullWidth />
          <TextField label="학교/학과" defaultValue={`${userProfile.university} ${userProfile.major}`} fullWidth />
          <TextField label="자기소개" defaultValue={userProfile.bio} multiline rows={3} fullWidth />
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1 }}>
              필요한 도움 (이용자 모드 입력)
            </Typography>
            <FormGroup row>
              {accessNeeds.map((n) => (
                <FormControlLabel
                  key={n.id}
                  control={<Checkbox defaultChecked={n.selected} />}
                  label={n.label}
                />
              ))}
            </FormGroup>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1 }}>
              제공 가능한 도움 (제공자 모드 입력)
            </Typography>
            <FormGroup row>
              {offerSkills.map((s) => (
                <FormControlLabel
                  key={s.id}
                  control={<Checkbox defaultChecked={s.selected} />}
                  label={s.label}
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setProfileEditOpen(false)} sx={{ textTransform: 'none' }}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={() => setProfileEditOpen(false)}
            sx={{ bgcolor: '#1E3A8A', textTransform: 'none', boxShadow: 'none' }}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 활동확인서 다이얼로그 */}
      <Dialog
        open={certOpen}
        onClose={() => setCertOpen(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="cert-title"
      >
        <DialogTitle id="cert-title" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          활동확인서
          <IconButton onClick={() => setCertOpen(false)} aria-label="닫기">
            <X size={20} aria-hidden="true" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Typography sx={{ fontSize: '0.875rem', color: '#4B5563', mb: 2 }}>
            발급된 확인서는 학교·기관 공동 명의로 발행됩니다.
          </Typography>
          {certificates.map((c) => (
            <Card
              key={c.id}
              sx={{
                borderRadius: '12px',
                mb: 1.25,
                border: '1px solid #E5E7EB',
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box
                    aria-hidden="true"
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: '#EEF2FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={20} color="#1E3A8A" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                      {c.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mt: 0.25 }}>
                      {c.issuer}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', mt: 0.25 }}>
                      {c.date}
                    </Typography>
                  </Box>
                  <IconButton aria-label={`${c.title} 다운로드`}>
                    <Download size={18} color="#1E3A8A" aria-hidden="true" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
      </Dialog>

      {/* 친구 전체보기 다이얼로그 */}
      <Dialog
        open={friendsOpen}
        onClose={() => setFriendsOpen(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="friends-title"
      >
        <DialogTitle id="friends-title" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          내 친구 ({friends.length})
          <IconButton onClick={() => setFriendsOpen(false)} aria-label="닫기">
            <X size={20} aria-hidden="true" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          {friends.map((f) => (
            <Box
              key={f.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1.25,
                borderBottom: '1px solid #F3F4F6',
              }}
            >
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: f.role === '이용자' ? '#EEF2FF' : '#ECFDF5',
                  color: f.role === '이용자' ? '#1E3A8A' : '#15803D',
                  fontWeight: 700,
                }}
              >
                {f.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>{f.name}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  {f.role} · 함께한 활동 {f.activities}회
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<MessageCircle size={14} aria-hidden="true" />}
                sx={{
                  textTransform: 'none',
                  color: '#1E3A8A',
                  borderRadius: '8px',
                  minHeight: 36,
                }}
              >
                메시지
              </Button>
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function MenuRow({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onClick?: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`${label}${sub ? `, ${sub}` : ''}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        width: '100%',
        px: 2,
        py: 1.5,
        minHeight: 64,
        justifyContent: 'flex-start',
        '&:focus-visible': {
          outline: '3px solid #1E3A8A',
          outlineOffset: -3,
        },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 40,
          height: 40,
          borderRadius: '10px',
          bgcolor: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, textAlign: 'left' }}>
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>{label}</Typography>
        {sub && (
          <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>{sub}</Typography>
        )}
      </Box>
      <ChevronRight size={18} color="#9CA3AF" aria-hidden="true" />
    </ButtonBase>
  );
}

function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 52,
      }}
    >
      <Typography sx={{ fontSize: '0.9375rem' }}>{label}</Typography>
      <Switch
        checked={on}
        onChange={(_, v) => setOn(v)}
        inputProps={{ 'aria-label': label }}
      />
    </Box>
  );
}
