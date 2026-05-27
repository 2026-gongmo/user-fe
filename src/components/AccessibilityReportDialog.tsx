import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  ButtonBase,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  X,
  MapPin,
  Camera,
  Image as ImageIcon,
  TriangleAlert,
} from 'lucide-react';

import type {
  AccessibilityReport,
  FacilityChecklist,
  FacilityStatus,
  ReportCategory,
  ReportUrgency,
} from '../types';

const CATEGORIES: ReportCategory[] = [
  '계단',
  '단차',
  '급경사',
  '엘리베이터 고장',
  '엘리베이터 없음',
  '자동문 없음',
  '장애인 화장실 없음',
  '점자블록 손상',
  '공사 구간',
  '기타',
];

const FACILITY_FIELDS: { key: keyof FacilityChecklist; label: string }[] = [
  { key: 'autoDoor', label: '자동문' },
  { key: 'ramp', label: '경사로' },
  { key: 'elevator', label: '엘리베이터' },
  { key: 'accessibleToilet', label: '장애인 화장실' },
  { key: 'tactilePaving', label: '점자블록' },
];

const STATUS_OPTIONS: { value: FacilityStatus; label: string; color: string }[] = [
  { value: 'yes', label: '있음', color: '#047857' },
  { value: 'no', label: '없음', color: '#B91C1C' },
  { value: 'unknown', label: '모름', color: '#6B7280' },
];

const URGENCY_OPTIONS: { value: ReportUrgency; label: string; color: string }[] = [
  { value: 'low', label: '낮음', color: '#0369A1' },
  { value: 'normal', label: '보통', color: '#B45309' },
  { value: 'high', label: '높음', color: '#B91C1C' },
];

const CORAL = '#FED7AA';
const CORAL_DARK = '#9A3412';

const emptyFacilities: FacilityChecklist = {
  autoDoor: 'unknown',
  ramp: 'unknown',
  elevator: 'unknown',
  accessibleToilet: 'unknown',
  tactilePaving: 'unknown',
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (report: AccessibilityReport) => void;
  initialLat: number | null;
  initialLon: number | null;
  initialBuildingName?: string;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: CORAL,
        color: CORAL_DARK,
        fontSize: '0.75rem',
        fontWeight: 700,
        px: 1,
        py: 0.375,
        borderRadius: '6px',
        minWidth: 92,
        textAlign: 'left',
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}

export default function AccessibilityReportDialog({
  open,
  onClose,
  onSubmit,
  initialLat,
  initialLon,
  initialBuildingName,
}: Props) {
  const [buildingName, setBuildingName] = useState('');
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [facilities, setFacilities] = useState<FacilityChecklist>(emptyFacilities);
  const [description, setDescription] = useState('');
  const [photoName, setPhotoName] = useState<string | undefined>();
  const [urgency, setUrgency] = useState<ReportUrgency>('normal');
  const [anonymous, setAnonymous] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setBuildingName(initialBuildingName ?? '');
      setCategories([]);
      setFacilities(emptyFacilities);
      setDescription('');
      setPhotoName(undefined);
      setUrgency('normal');
      setAnonymous(false);
    }
  }, [open, initialBuildingName]);

  const toggleCategory = (c: ReportCategory) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const setFacility = (key: keyof FacilityChecklist, v: FacilityStatus) =>
    setFacilities((prev) => ({ ...prev, [key]: v }));

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPhotoName(f.name);
  };

  const canSubmit =
    initialLat !== null &&
    initialLon !== null &&
    (categories.length > 0 || description.trim().length > 0);

  const handleSubmit = () => {
    if (initialLat === null || initialLon === null) return;
    onSubmit({
      id: `r-${Date.now()}`,
      lat: initialLat,
      lon: initialLon,
      buildingName: buildingName.trim() || '지도 위 지점',
      categories,
      facilities,
      description: description.trim(),
      photoName,
      urgency,
      anonymous,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle sx={{ pb: 1.25, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TriangleAlert size={20} color="#B91C1C" aria-hidden="true" />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '1.0625rem', fontWeight: 800, color: '#111827' }}>
            접근성 문제 제보
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
            발견한 시설 문제를 알려주세요. 검토 후 지도에 반영됩니다.
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="닫기" size="small">
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 위치 */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <FieldLabel>건물명</FieldLabel>
              <TextField
                fullWidth
                size="small"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                placeholder="예: 우당교양관"
                variant="standard"
                inputProps={{ 'aria-label': '건물명 입력' }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6B7280' }}>
              <MapPin size={14} aria-hidden="true" />
              <Typography sx={{ fontSize: '0.75rem' }}>
                {initialLat !== null && initialLon !== null
                  ? `${initialLat.toFixed(5)}, ${initialLon.toFixed(5)}`
                  : '위치를 지도에서 선택해주세요'}
              </Typography>
            </Box>
          </Box>

          <Divider flexItem />

          {/* 문제 유형 */}
          <Box>
            <Typography
              component="h3"
              sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', mb: 0.75 }}
            >
              어떤 문제인가요? <Box component="span" sx={{ color: '#6B7280', fontWeight: 500 }}>(여러 개 선택 가능)</Box>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {CATEGORIES.map((c) => {
                const active = categories.includes(c);
                return (
                  <Chip
                    key={c}
                    label={c}
                    size="small"
                    onClick={() => toggleCategory(c)}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      bgcolor: active ? '#FEE2E2' : '#F3F4F6',
                      color: active ? '#991B1B' : '#374151',
                      border: active ? '1px solid #FCA5A5' : '1px solid transparent',
                      cursor: 'pointer',
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          <Divider flexItem />

          {/* 시설 현황 */}
          <Box>
            <Typography
              component="h3"
              sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', mb: 1 }}
            >
              시설 현황
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.875 }}>
              {FACILITY_FIELDS.map((field) => (
                <Box
                  key={field.key}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 32 }}
                >
                  <FieldLabel>{field.label}</FieldLabel>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {STATUS_OPTIONS.map((opt) => {
                      const active = facilities[field.key] === opt.value;
                      return (
                        <ButtonBase
                          key={opt.value}
                          onClick={() => setFacility(field.key, opt.value)}
                          aria-pressed={active}
                          sx={{
                            px: 1.25,
                            py: 0.375,
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: active ? '#fff' : opt.color,
                            bgcolor: active ? opt.color : '#fff',
                            border: `1px solid ${active ? opt.color : '#E5E7EB'}`,
                            minHeight: 28,
                          }}
                        >
                          {opt.label}
                        </ButtonBase>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider flexItem />

          {/* 상세 설명 + 사진 */}
          <Box>
            <Typography
              component="h3"
              sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', mb: 0.75 }}
            >
              상세 설명
            </Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={3}
              maxRows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예) 정문 쪽 경사로가 너무 가팔라 휠체어로 진입이 어렵습니다."
              inputProps={{ 'aria-label': '상세 설명 입력' }}
            />

            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={photoName ? <ImageIcon size={16} /> : <Camera size={16} />}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  borderColor: '#E5E7EB',
                  color: '#374151',
                }}
              >
                {photoName ? '사진 변경' : '사진 첨부'}
              </Button>
              <Box
                component="input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onPickPhoto}
                sx={{ display: 'none' }}
                aria-label="사진 선택"
              />
              {photoName && (
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0,
                  }}
                  title={photoName}
                >
                  {photoName}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider flexItem />

          {/* 긴급도 + 익명 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Box>
              <Typography
                component="h3"
                sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', mb: 0.5 }}
              >
                긴급도
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {URGENCY_OPTIONS.map((u) => {
                  const active = urgency === u.value;
                  return (
                    <ButtonBase
                      key={u.value}
                      onClick={() => setUrgency(u.value)}
                      aria-pressed={active}
                      sx={{
                        px: 1.25,
                        py: 0.5,
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: active ? '#fff' : u.color,
                        bgcolor: active ? u.color : '#fff',
                        border: `1px solid ${active ? u.color : '#E5E7EB'}`,
                        minHeight: 32,
                      }}
                    >
                      {u.label}
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={anonymous}
                  onChange={(_e, v) => setAnonymous(v)}
                />
              }
              label={
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  익명 제보
                </Typography>
              }
              sx={{ m: 0 }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="text"
          sx={{ textTransform: 'none', fontWeight: 700, color: '#374151' }}
        >
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            bgcolor: '#1E3A8A',
            '&:hover': { bgcolor: '#172554' },
            borderRadius: 2,
            px: 2.5,
          }}
        >
          제출
        </Button>
      </DialogActions>
    </Dialog>
  );
}
