import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  AlertTriangle,
  Camera,
  Database,
  Lightbulb,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';

type ReportProblemType =
  | '계단'
  | '단차'
  | '급경사'
  | '엘리베이터 고장'
  | '공사 구간'
  | '노면 파손'
  | '기타';

type Urgency = '낮음' | '보통' | '높음';

interface ReportAnalysis {
  placeName: string;
  problemType: ReportProblemType;
  affectedGroups: string[];
  urgency: Urgency;
  suggestion: string;
  repeatReports: number;
}

interface AccessibilityReportDialogProps {
  open: boolean;
  onClose: () => void;
  defaultPlaceName?: string;
}

const problemTypes: ReportProblemType[] = [
  '계단',
  '단차',
  '급경사',
  '엘리베이터 고장',
  '공사 구간',
  '노면 파손',
  '기타',
];

const urgencyColor: Record<Urgency, string> = {
  낮음: '#047857',
  보통: '#B45309',
  높음: '#D97706',
};

export default function AccessibilityReportDialog({
  open,
  onClose,
  defaultPlaceName = '',
}: AccessibilityReportDialogProps) {
  const [placeName, setPlaceName] = useState(defaultPlaceName);
  const [problemType, setProblemType] = useState<ReportProblemType>('급경사');
  const [description, setDescription] = useState('');
  const [analysis, setAnalysis] = useState<ReportAnalysis | null>(null);

  useEffect(() => {
    if (open) setPlaceName(defaultPlaceName);
  }, [defaultPlaceName, open]);

  const canAnalyze = placeName.trim().length > 0 && description.trim().length > 0;

  const helperText = useMemo(() => {
    if (canAnalyze) return '입력한 내용을 바탕으로 제보 내용을 정리할 수 있어요.';
    return '장소와 설명을 입력하면 제보 내용을 자동으로 정리해드려요.';
  }, [canAnalyze]);

  const handleAnalyze = () => {
    if (!canAnalyze) return;

    setAnalysis(createMockAnalysis(placeName, problemType));
  };

  const handleClose = () => {
    onClose();
    setAnalysis(null);
    setDescription('');
    if (!defaultPlaceName) setPlaceName('');
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800, pb: 1, fontSize: '1.25rem' }}>
        불편한 곳 알려주기
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Alert severity="info" sx={{ borderRadius: '8px', mb: 2 }}>
          불편한 길이나 장소를 알려주면 이동 안내와 개선 요청에 참고할 수 있게 정리합니다.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            label="장소명"
            value={placeName}
            onChange={(event) => setPlaceName(event.target.value)}
            placeholder="예: 공학관 후문 경사로"
            fullWidth
          />
          <TextField
            label="불편한 점"
            select
            value={problemType}
            onChange={(event) => setProblemType(event.target.value as ReportProblemType)}
            fullWidth
          >
            {problemTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="설명"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="예: 비가 오면 바퀴가 미끄러지고, 안내 표지가 없어 우회하기 어려워요."
            multiline
            minRows={3}
            fullWidth
          />

          <Button
            variant="outlined"
            startIcon={<Camera size={18} aria-hidden="true" />}
            sx={{
              minHeight: 48,
              justifyContent: 'flex-start',
              borderRadius: '8px',
              borderColor: '#CBD5E1',
              color: '#334155',
              textTransform: 'none',
            }}
          >
            사진 첨부하기
          </Button>
          <Typography sx={{ color: '#6B7280', fontSize: '0.8125rem', mt: -0.75 }}>
            사진 첨부는 현재 안내 기능으로 제공됩니다.
          </Typography>

          <Alert severity={canAnalyze ? 'success' : 'warning'} sx={{ borderRadius: '8px' }}>
            {helperText}
          </Alert>

          {analysis && <AnalysisResultCard analysis={analysis} />}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ minHeight: 44, textTransform: 'none' }}>
          닫기
        </Button>
        <Button
          variant="contained"
          startIcon={<Sparkles size={18} aria-hidden="true" />}
          disabled={!canAnalyze}
          onClick={handleAnalyze}
          sx={{
            minHeight: 48,
            bgcolor: '#1E3A8A',
            borderRadius: '8px',
            boxShadow: 'none',
            textTransform: 'none',
            '&:hover': { bgcolor: '#172554' },
          }}
        >
          제보 내용 정리하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AnalysisResultCard({ analysis }: { analysis: ReportAnalysis }) {
  return (
    <Card
      sx={{
        borderRadius: '8px',
        border: '1px solid #BBF7D0',
        bgcolor: '#FBFEFC',
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1.5 }}>
          <Box
            aria-hidden="true"
            sx={{
              width: 42,
              height: 42,
              borderRadius: '8px',
              bgcolor: '#D1FAE5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={21} color="#047857" />
          </Box>
          <Box>
            <Typography sx={{ color: '#047857', fontSize: '0.8125rem', fontWeight: 800 }}>
              제보 정리 결과
            </Typography>
            <Typography sx={{ color: '#111827', fontSize: '1.125rem', fontWeight: 800 }}>
              주의할 점과 개선 제안을 정리했어요.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <ResultRow icon={<MapPin size={17} />} label="장소" value={analysis.placeName} />
        <ResultRow icon={<AlertTriangle size={17} />} label="불편한 점" value={analysis.problemType} />
        <ResultRow
          icon={<Users size={17} />}
          label="영향 대상"
          value={analysis.affectedGroups.join(', ')}
        />
        <ResultRow icon={<Lightbulb size={17} />} label="개선 제안" value={analysis.suggestion} />

        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.25 }}>
          <Chip
            label={`긴급도 ${analysis.urgency}`}
            sx={{
              bgcolor: `${urgencyColor[analysis.urgency]}18`,
              color: urgencyColor[analysis.urgency],
              fontWeight: 800,
            }}
          />
          <Chip
            label={`반복 제보 ${analysis.repeatReports}건`}
            sx={{ bgcolor: '#EEF2FF', color: '#1E3A8A', fontWeight: 800 }}
          />
        </Box>

        <Alert
          icon={<Database size={18} aria-hidden="true" />}
          severity="success"
          sx={{ borderRadius: '8px', mt: 1.75 }}
        >
          비슷한 제보가 쌓이면 학교와 지역의 개선 우선순위 판단에 활용됩니다.
        </Alert>
      </CardContent>
    </Card>
  );
}

function ResultRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', py: 0.625 }}>
      <Box sx={{ color: '#047857', display: 'flex', pt: 0.125 }} aria-hidden="true">
        {icon}
      </Box>
      <Typography sx={{ width: 74, color: '#6B7280', fontWeight: 700, fontSize: '0.875rem' }}>
        {label}
      </Typography>
      <Typography sx={{ flex: 1, color: '#111827', fontWeight: 700, fontSize: '0.9375rem' }}>
        {value}
      </Typography>
    </Box>
  );
}

function createMockAnalysis(
  placeName: string,
  problemType: ReportProblemType,
): ReportAnalysis {
  const trimmedPlace = placeName.trim();

  if (problemType === '엘리베이터 고장') {
    return {
      placeName: trimmedPlace,
      problemType,
      affectedGroups: ['휠체어 사용자', '목발 사용자', '고령자'],
      urgency: '높음',
      suggestion: '대체 엘리베이터 안내와 접근 가능 출입구 표지를 추가해요.',
      repeatReports: 12,
    };
  }

  if (problemType === '급경사' || problemType === '계단' || problemType === '단차') {
    return {
      placeName: trimmedPlace,
      problemType,
      affectedGroups: ['휠체어 사용자', '유아차 사용자', '목발 사용자'],
      urgency: '높음',
      suggestion: '경사로 설치와 정문 우회 경로 안내가 필요해요.',
      repeatReports: 8,
    };
  }

  if (problemType === '공사 구간' || problemType === '노면 파손') {
    return {
      placeName: trimmedPlace,
      problemType,
      affectedGroups: ['휠체어 사용자', '고령자', '시각장애 학생'],
      urgency: '보통',
      suggestion: '임시 안전 표지와 접근 가능한 우회 동선을 함께 안내해요.',
      repeatReports: 5,
    };
  }

  return {
    placeName: trimmedPlace,
    problemType,
    affectedGroups: ['이동에 도움이 필요한 사람', '고령자'],
    urgency: '낮음',
    suggestion: '현장 확인 후 접근 가능 안내 표지를 보완해요.',
    repeatReports: 3,
  };
}
