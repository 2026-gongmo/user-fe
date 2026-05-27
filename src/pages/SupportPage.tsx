import { useMemo, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  TextField,
  IconButton,
  Avatar,
  Stack,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Sparkles,
  Send,
  Mail,
  ClipboardCopy,
  GraduationCap,
  FileText,
  Headphones,
  Footprints,
  BookOpen,
  Clock,
  Timer,
  Plus,
} from 'lucide-react';

import { supportRequests as initialRequests, initialChatMessages } from '../data/mockData';
import type { ChatMessage, SupportRequest, SupportRequestType } from '../types';

const TYPE_META: Record<SupportRequestType, { color: string; bg: string; icon: React.ReactNode; desc: string }> = {
  시험시간연장: { color: '#4338CA', bg: '#EEF2FF', icon: <Timer size={18} />, desc: '시험시간 1.25 / 1.5 / 2배 연장 신청' },
  강의자료사전제공: { color: '#BE185D', bg: '#FCE7F3', icon: <BookOpen size={18} />, desc: '강의 24시간 전까지 자료 사전 제공 요청' },
  학습보조기기대여: { color: '#B45309', bg: '#FEF3C7', icon: <Headphones size={18} />, desc: '점자정보단말기, 보청기 등 학기 대여' },
  속기지원: { color: '#047857', bg: '#D1FAE5', icon: <FileText size={18} />, desc: '강의 속기/문자통역 매칭 신청' },
  이동지원: { color: '#0369A1', bg: '#E0F2FE', icon: <Footprints size={18} />, desc: '강의실 ↔ 강의실 이동 동행 신청' },
  기타: { color: '#4B5563', bg: '#F3F4F6', icon: <Plus size={18} />, desc: '기타 편의 요청' },
};

const STATUS_COLOR: Record<SupportRequest['status'], { bg: string; fg: string }> = {
  접수: { bg: '#F3F4F6', fg: '#4B5563' },
  검토중: { bg: '#FEF3C7', fg: '#92400E' },
  교수회신대기: { bg: '#FFEDD5', fg: '#9A3412' },
  승인: { bg: '#D1FAE5', fg: '#065F46' },
  반려: { bg: '#FEE2E2', fg: '#991B1B' },
  완료: { bg: '#E0E7FF', fg: '#3730A3' },
};

export default function SupportPage() {
  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const [requests, setRequests] = useState<SupportRequest[]>(initialRequests);

  // 챗봇 상태
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [draft, setDraft] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // 신청 폼 다이얼로그
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<SupportRequestType>('시험시간연장');
  const [formCourse, setFormCourse] = useState('');
  const [formProfessor, setFormProfessor] = useState('');
  const [formReason, setFormReason] = useState('');

  // 교수자 이메일 다이얼로그
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [emailContext, setEmailContext] = useState<{ professor: string; course: string; needs: string }>({
    professor: '',
    course: '',
    needs: '',
  });

  const [snack, setSnack] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === '접수' || r.status === '검토중' || r.status === '교수회신대기').length,
    [requests],
  );

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text, at: '방금' };
    const aiMsg = composeAiReply(text);
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setDraft('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const openNewRequest = (type: SupportRequestType) => {
    setFormType(type);
    setFormCourse('');
    setFormProfessor('');
    setFormReason('');
    setFormOpen(true);
  };

  const submitRequest = () => {
    const id = `SR-${Date.now()}`;
    const newReq: SupportRequest = {
      id,
      type: formType,
      course: formCourse || undefined,
      professor: formProfessor || undefined,
      reason: formReason || '(사유 없음)',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: '접수',
    };
    setRequests((prev) => [newReq, ...prev]);
    setFormOpen(false);
    setSnack('신청이 접수되었습니다. 검토 후 안내드릴게요.');
  };

  const openEmailGenerator = (req?: SupportRequest) => {
    setEmailContext({
      professor: req?.professor ?? '',
      course: req?.course ?? '',
      needs: req?.type ?? '시험시간연장',
    });
    setEmailDraft('');
    setEmailLoading(true);
    setEmailOpen(true);
    setTimeout(() => {
      setEmailDraft(buildProfessorEmail(req?.professor ?? '교수님', req?.course ?? '해당 강의', req?.type ?? '편의 요청', req?.reason ?? ''));
      setEmailLoading(false);
    }, 700);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailDraft);
      setSnack('이메일 초안을 클립보드에 복사했습니다');
    } catch {
      setSnack('복사에 실패했습니다');
    }
  };

  return (
    <Box sx={{ p: 2, pb: 12 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Avatar sx={{ bgcolor: '#EEF2FF', color: '#4338CA', width: 36, height: 36 }}>
          <Sparkles size={18} aria-hidden="true" />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 800 }}>AI 행정지원</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
            장애학생지원센터 편의지원 신청을 AI가 도와드립니다
          </Typography>
        </Box>
      </Box>

      {/* 진행 중 신청 요약 */}
      <Card sx={{ borderRadius: '14px', mb: 2, bgcolor: '#F5F3FF', border: '1px solid #DDD6FE' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
          <Clock size={20} color="#6D28D9" aria-hidden="true" />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#5B21B6' }}>
              진행 중 신청 {pendingCount}건
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#5B21B6' }}>
              상태가 변경되면 알림으로 안내드립니다
            </Typography>
          </Box>
          <Button size="small" onClick={() => setTab(2)} sx={{ textTransform: 'none', color: '#6D28D9', fontWeight: 700 }}>
            보기
          </Button>
        </CardContent>
      </Card>

      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        variant="fullWidth"
        sx={{
          mb: 2,
          minHeight: 40,
          '& .MuiTab-root': { minHeight: 40, fontSize: '0.8125rem', textTransform: 'none', fontWeight: 700 },
        }}
      >
        <Tab label="AI 챗봇" />
        <Tab label="빠른 신청" />
        <Tab label={`내 신청 (${requests.length})`} />
      </Tabs>

      {tab === 0 && (
        <Card sx={{ borderRadius: '14px' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, maxHeight: '52vh', overflowY: 'auto' }}>
              <Stack spacing={1.5}>
                {messages.map((m) => (
                  <ChatBubble key={m.id} msg={m} onSuggest={(type) => openNewRequest(type)} />
                ))}
                <div ref={chatEndRef} />
              </Stack>
            </Box>
            <Divider />
            <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="예: 시험시간 연장 어떻게 신청해요?"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
              />
              <IconButton
                onClick={() => send(draft)}
                aria-label="메시지 전송"
                sx={{ bgcolor: '#4338CA', color: '#fff', '&:hover': { bgcolor: '#3730A3' } }}
              >
                <Send size={18} aria-hidden="true" />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Stack spacing={1.5}>
          {(Object.keys(TYPE_META) as SupportRequestType[]).map((t) => {
            const m = TYPE_META[t];
            return (
              <Card key={t} sx={{ borderRadius: '14px' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.75 }}>
                  <Avatar sx={{ bgcolor: m.bg, color: m.color, width: 38, height: 38 }}>{m.icon}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700 }}>{t}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>{m.desc}</Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => openNewRequest(t)}
                    sx={{ textTransform: 'none', bgcolor: m.color, boxShadow: 'none' }}
                  >
                    신청
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          <Card sx={{ borderRadius: '14px', bgcolor: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Mail size={18} color="#B45309" aria-hidden="true" />
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#92400E' }}>
                  교수자에게 보낼 이메일 자동 생성
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#78350F', mb: 1 }}>
                강의명·필요한 편의를 입력하면 AI가 정중한 요청 이메일을 만들어드립니다.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => openEmailGenerator()}
                sx={{ textTransform: 'none', borderColor: '#B45309', color: '#B45309' }}
              >
                이메일 초안 만들기
              </Button>
            </CardContent>
          </Card>
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={1.5}>
          {requests.map((r) => {
            const sc = STATUS_COLOR[r.status];
            const m = TYPE_META[r.type];
            return (
              <Card key={r.id} sx={{ borderRadius: '14px' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={m.icon as any}
                      label={r.type}
                      size="small"
                      sx={{ height: 24, fontWeight: 700, bgcolor: m.bg, color: m.color, '& .MuiChip-icon': { color: m.color } }}
                    />
                    <Chip
                      label={r.status}
                      size="small"
                      sx={{ height: 24, fontWeight: 700, bgcolor: sc.bg, color: sc.fg }}
                    />
                    <Typography sx={{ ml: 'auto', fontSize: '0.6875rem', color: '#9CA3AF' }}>{r.id}</Typography>
                  </Box>
                  {r.course && (
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
                      {r.course}
                      <Typography component="span" sx={{ ml: 0.5, color: '#6B7280', fontWeight: 400, fontSize: '0.75rem' }}>
                        · {r.professor ?? '교수님'}
                      </Typography>
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: '0.8125rem', color: '#374151', mt: 0.5, lineHeight: 1.6 }}>
                    {r.reason}
                  </Typography>
                  {r.centerNote && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: '#F9FAFB', borderRadius: '8px', fontSize: '0.75rem', color: '#4B5563' }}>
                      센터 메모 · {r.centerNote}
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>접수 {r.createdAt}</Typography>
                    {r.status === '교수회신대기' && (
                      <Button
                        size="small"
                        startIcon={<Mail size={14} aria-hidden="true" />}
                        onClick={() => openEmailGenerator(r)}
                        sx={{ textTransform: 'none', color: '#4338CA' }}
                      >
                        교수자 이메일
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* 신청 폼 다이얼로그 */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GraduationCap size={18} color="#4338CA" aria-hidden="true" />
          편의지원 신청
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <TextField
              select
              label="신청 유형"
              size="small"
              value={formType}
              onChange={(e) => setFormType(e.target.value as SupportRequestType)}
            >
              {(Object.keys(TYPE_META) as SupportRequestType[]).map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField label="강의명 (선택)" size="small" value={formCourse} onChange={(e) => setFormCourse(e.target.value)} />
            <TextField label="담당 교수 (선택)" size="small" value={formProfessor} onChange={(e) => setFormProfessor(e.target.value)} />
            <TextField
              label="요청 사유"
              size="small"
              multiline
              minRows={3}
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              helperText="진단 정보·기존 인정 이력 등을 함께 적어주시면 처리가 빨라집니다"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} sx={{ textTransform: 'none' }}>취소</Button>
          <Button
            variant="contained"
            onClick={submitRequest}
            sx={{ textTransform: 'none', bgcolor: '#4338CA', boxShadow: 'none' }}
          >
            신청
          </Button>
        </DialogActions>
      </Dialog>

      {/* 교수자 이메일 다이얼로그 */}
      <Dialog open={emailOpen} onClose={() => setEmailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sparkles size={18} color="#6D28D9" aria-hidden="true" />
          교수자 이메일 초안
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <TextField
                label="교수님"
                size="small"
                value={emailContext.professor}
                onChange={(e) => setEmailContext({ ...emailContext, professor: e.target.value })}
              />
              <TextField
                label="강의명"
                size="small"
                value={emailContext.course}
                onChange={(e) => setEmailContext({ ...emailContext, course: e.target.value })}
              />
            </Box>
            <TextField
              label="필요한 편의"
              size="small"
              value={emailContext.needs}
              onChange={(e) => setEmailContext({ ...emailContext, needs: e.target.value })}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setEmailLoading(true);
                setEmailDraft('');
                setTimeout(() => {
                  setEmailDraft(buildProfessorEmail(emailContext.professor || '교수님', emailContext.course || '해당 강의', emailContext.needs || '편의 요청', ''));
                  setEmailLoading(false);
                }, 600);
              }}
              sx={{ textTransform: 'none' }}
            >
              다시 생성
            </Button>
            {emailLoading ? (
              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mb: 0.5 }}>AI가 초안을 작성하고 있어요…</Typography>
                <LinearProgress />
              </Box>
            ) : (
              <TextField fullWidth multiline minRows={10} value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={copyEmail} startIcon={<ClipboardCopy size={14} aria-hidden="true" />} sx={{ textTransform: 'none' }}>
            복사
          </Button>
          <Button
            variant="contained"
            startIcon={<Mail size={14} aria-hidden="true" />}
            onClick={() => {
              setEmailOpen(false);
              setSnack('메일 앱에 전달했습니다 (Mock)');
            }}
            sx={{ textTransform: 'none', bgcolor: '#4338CA', boxShadow: 'none' }}
          >
            메일 앱 열기
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2200} onClose={() => setSnack(null)}>
        <Alert severity="success" variant="filled" onClose={() => setSnack(null)} sx={{ bgcolor: '#4338CA' }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ---------- 보조 컴포넌트 ----------
function ChatBubble({ msg, onSuggest }: { msg: ChatMessage; onSuggest: (t: SupportRequestType) => void }) {
  const isAi = msg.role === 'ai';
  return (
    <Box sx={{ display: 'flex', flexDirection: isAi ? 'row' : 'row-reverse', gap: 1, alignItems: 'flex-start' }}>
      {isAi && (
        <Avatar sx={{ bgcolor: '#EEF2FF', color: '#4338CA', width: 28, height: 28 }}>
          <Sparkles size={14} aria-hidden="true" />
        </Avatar>
      )}
      <Box sx={{ maxWidth: '78%' }}>
        <Box
          sx={{
            p: 1.25,
            borderRadius: isAi ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
            bgcolor: isAi ? '#F3F4F6' : '#1E3A8A',
            color: isAi ? '#111827' : '#fff',
            fontSize: '0.8125rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}
        >
          {msg.text}
        </Box>
        {msg.suggestions && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
            {msg.suggestions.map((s) => (
              <Chip
                key={s.label}
                label={s.label}
                size="small"
                onClick={() => onSuggest(s.type)}
                sx={{ height: 28, fontWeight: 700, bgcolor: '#EEF2FF', color: '#4338CA', cursor: 'pointer' }}
              />
            ))}
          </Box>
        )}
        <Typography sx={{ fontSize: '0.625rem', color: '#9CA3AF', mt: 0.5, textAlign: isAi ? 'left' : 'right' }}>
          {msg.at}
        </Typography>
      </Box>
    </Box>
  );
}

// ---------- AI 응답 합성 (Mock) ----------
function composeAiReply(userText: string): ChatMessage {
  const lower = userText.toLowerCase();
  const id = `a-${Date.now()}`;
  const at = '방금';

  if (lower.includes('시험') || lower.includes('extension')) {
    return {
      id,
      role: 'ai',
      at,
      text:
        '시험시간 연장은 보통 1.25 / 1.5 / 2배 중에서 선택할 수 있어요.\n진단 정보와 직전 학기 인정 이력이 있으면 신청이 빠르게 처리됩니다.\n아래 버튼으로 바로 신청해보시겠어요?',
      suggestions: [{ label: '시험시간 연장 신청', type: '시험시간연장' }],
    };
  }
  if (lower.includes('자료') || lower.includes('pdf')) {
    return {
      id,
      role: 'ai',
      at,
      text:
        '강의자료 사전 제공은 강의 24시간 전까지 PDF로 받아볼 수 있도록 교수님께 요청합니다.\n신청 시 강의명을 입력해 주세요.',
      suggestions: [{ label: '강의자료 사전 제공 신청', type: '강의자료사전제공' }],
    };
  }
  if (lower.includes('속기') || lower.includes('자막')) {
    return {
      id,
      role: 'ai',
      at,
      text: '속기/문자통역 지원은 강의 시간표에 맞춰 외부 속기사를 매칭해드립니다. 신청해보시겠어요?',
      suggestions: [{ label: '속기 지원 신청', type: '속기지원' }],
    };
  }
  if (lower.includes('이동') || lower.includes('동행')) {
    return {
      id,
      role: 'ai',
      at,
      text: '강의실 ↔ 강의실 이동을 도와줄 동행 도우미를 매칭해드립니다.',
      suggestions: [{ label: '이동 지원 신청', type: '이동지원' }],
    };
  }
  if (lower.includes('기기') || lower.includes('보청') || lower.includes('점자')) {
    return {
      id,
      role: 'ai',
      at,
      text: '학습보조기기는 학기 단위로 대여할 수 있습니다. 현재 점자정보단말기·보청기·노트북 거치대 등이 가능합니다.',
      suggestions: [{ label: '학습보조기기 대여 신청', type: '학습보조기기대여' }],
    };
  }
  return {
    id,
    role: 'ai',
    at,
    text:
      '아래 항목 중 하나를 선택하거나, 필요한 도움을 좀 더 구체적으로 적어주세요.\n예: "전자기학 시험 1.5배 연장", "데이터구조 강의자료 미리 받고 싶어요"',
    suggestions: [
      { label: '시험시간 연장', type: '시험시간연장' },
      { label: '강의자료 사전 제공', type: '강의자료사전제공' },
      { label: '학습보조기기 대여', type: '학습보조기기대여' },
      { label: '속기 지원', type: '속기지원' },
      { label: '이동 지원', type: '이동지원' },
    ],
  };
}

function buildProfessorEmail(professor: string, course: string, needs: string, reason: string) {
  return `안녕하세요 ${professor},\n\n장애학생지원센터를 통해 등록된 학생입니다. ${course} 강의와 관련하여 「${needs}」 편의를 요청드립니다.${reason ? `\n\n사유: ${reason}` : ''}\n\n관련하여 가능한 일정과 방식에 대해 회신 부탁드립니다. 진단서 및 센터 확인서가 필요한 경우 즉시 송부해드릴 수 있습니다.\n\n감사합니다.`;
}
