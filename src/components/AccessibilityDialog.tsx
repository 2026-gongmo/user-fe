import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Switch,
  Divider,
  ButtonBase,
  Slider,
} from '@mui/material';
import {
  X,
  Type,
  Contrast,
  Zap,
  Captions,
  Hand,
  Volume2,
  Eye,
  Languages,
} from 'lucide-react';

type Setting = {
  id: string;
  icon: typeof Type;
  label: string;
  sub: string;
  defaultOn?: boolean;
};

const visualSettings: Setting[] = [
  {
    id: 'highContrast',
    icon: Contrast,
    label: '고대비 모드',
    sub: '배경과 글자 대비를 강화합니다',
  },
  {
    id: 'reduceMotion',
    icon: Zap,
    label: '모션 줄이기',
    sub: '애니메이션과 전환 효과를 최소화',
  },
  {
    id: 'screenReader',
    icon: Eye,
    label: '스크린리더 최적화',
    sub: '레이아웃과 라벨을 음성 출력에 최적화',
  },
];

const captionSettings: Setting[] = [
  {
    id: 'captionDefault',
    icon: Captions,
    label: '영상 자막 기본 표시',
    sub: '모든 영상에 자막 자동 활성화',
    defaultOn: true,
  },
  {
    id: 'signLanguage',
    icon: Hand,
    label: '수어 영상 우선 표시',
    sub: '제공되는 콘텐츠는 수어 영상을 먼저 보여줍니다',
  },
  {
    id: 'audioDescription',
    icon: Volume2,
    label: '화면 음성 해설',
    sub: '이미지·UI를 음성으로 설명합니다',
  },
];

export default function AccessibilityDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [fontSize, setFontSize] = useState(2);
  const [settings, setSettings] = useState<Record<string, boolean>>({
    captionDefault: true,
  });

  const toggle = (id: string) =>
    setSettings((s) => ({ ...s, [id]: !s[id] }));

  const fontLabels = ['작게', '보통', '크게', '아주 크게'];
  const previewFontSize = ['0.875rem', '1rem', '1.125rem', '1.25rem'][fontSize];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      aria-labelledby="a11y-title"
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1,
          py: 1.5,
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="접근성 설정 닫기"
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <X size={22} aria-hidden="true" />
        </IconButton>
        <Typography
          id="a11y-title"
          component="h1"
          sx={{ fontSize: '1.125rem', fontWeight: 700 }}
        >
          접근성 설정
        </Typography>
      </Box>

      <DialogContent sx={{ p: 2 }}>
        <Box
          component="section"
          aria-labelledby="a11y-font"
          sx={{
            bgcolor: '#F9FAFB',
            borderRadius: '12px',
            p: 2,
            mb: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Type size={20} color="#4338CA" aria-hidden="true" />
            <Typography
              id="a11y-font"
              component="h2"
              sx={{ fontSize: '0.9375rem', fontWeight: 700 }}
            >
              글자 크기
            </Typography>
          </Box>
          <Slider
            value={fontSize}
            onChange={(_, v) => setFontSize(v as number)}
            min={0}
            max={3}
            step={1}
            marks={fontLabels.map((l, i) => ({ value: i, label: l }))}
            aria-label="글자 크기 선택"
            valueLabelDisplay="off"
            sx={{
              color: '#4338CA',
              '& .MuiSlider-markLabel': { fontSize: '0.8125rem' },
            }}
          />
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: '8px',
              bgcolor: '#fff',
              border: '1px solid #E5E7EB',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mb: 0.5 }}>
              미리보기
            </Typography>
            <Typography sx={{ fontSize: previewFontSize, color: '#111827' }}>
              함께하는 캠퍼스 생활을 만들어가요
            </Typography>
          </Box>
        </Box>

        <Typography
          component="h2"
          sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4B5563', mb: 1, mt: 1 }}
        >
          시각 설정
        </Typography>
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            mb: 2.5,
          }}
        >
          {visualSettings.map((s, idx) => {
            const Icon = s.icon;
            const on = settings[s.id] ?? false;
            return (
              <Box key={s.id}>
                <ButtonBase
                  onClick={() => toggle(s.id)}
                  aria-pressed={on}
                  aria-label={`${s.label}, ${on ? '켜짐' : '꺼짐'}`}
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
                      outline: '3px solid #4338CA',
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
                      bgcolor: '#EEF0FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color="#4338CA" />
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'left' }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                      {s.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                      {s.sub}
                    </Typography>
                  </Box>
                  <Switch
                    checked={on}
                    onChange={() => toggle(s.id)}
                    inputProps={{ 'aria-label': s.label }}
                  />
                </ButtonBase>
                {idx < visualSettings.length - 1 && <Divider />}
              </Box>
            );
          })}
        </Box>

        <Typography
          component="h2"
          sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4B5563', mb: 1 }}
        >
          자막 / 음성 / 수어
        </Typography>
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            mb: 2.5,
          }}
        >
          {captionSettings.map((s, idx) => {
            const Icon = s.icon;
            const on = settings[s.id] ?? !!s.defaultOn;
            return (
              <Box key={s.id}>
                <ButtonBase
                  onClick={() => toggle(s.id)}
                  aria-pressed={on}
                  aria-label={`${s.label}, ${on ? '켜짐' : '꺼짐'}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    width: '100%',
                    px: 2,
                    py: 1.5,
                    minHeight: 64,
                    justifyContent: 'flex-start',
                  }}
                >
                  <Box
                    aria-hidden="true"
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: '#FCE7F3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color="#BE185D" />
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'left' }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                      {s.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                      {s.sub}
                    </Typography>
                  </Box>
                  <Switch
                    checked={on}
                    onChange={() => toggle(s.id)}
                    inputProps={{ 'aria-label': s.label }}
                  />
                </ButtonBase>
                {idx < captionSettings.length - 1 && <Divider />}
              </Box>
            );
          })}
        </Box>

        <Typography
          component="h2"
          sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4B5563', mb: 1 }}
        >
          언어
        </Typography>
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            mb: 4,
          }}
        >
          <ButtonBase
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              width: '100%',
              px: 2,
              py: 1.5,
              minHeight: 64,
              justifyContent: 'flex-start',
            }}
            aria-label="언어 변경, 현재 한국어"
          >
            <Box
              aria-hidden="true"
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Languages size={20} color="#047857" />
            </Box>
            <Box sx={{ flex: 1, textAlign: 'left' }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                언어
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                한국어
              </Typography>
            </Box>
          </ButtonBase>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
