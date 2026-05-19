import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItemButton,
  Snackbar,
  Typography,
} from '@mui/material';
import {
  AlertTriangle,
  CalendarDays,
  HandHeart,
  MapPin,
  Navigation,
  ShieldCheck,
} from 'lucide-react';

import { facilities } from '../data/mockData';
import { sampleCourseSchedules } from '../data/sampleSchedules';
import {
  createScheduleRouteRecommendation,
  formatMinutes,
  getNextSchedule,
  getTodaySchedules,
} from '../utils/scheduleUtils';
import type { ScheduleDifficultyLabel } from '../types/schedule';

interface ScheduleRouteCardProps {
  currentStartNodeId: string;
  onSelectRoute?: (startNodeId: string, destinationNodeId: string) => void;
}

const DEMO_COMPANION_MESSAGE =
  '동행 요청 기능은 데모입니다. 실제 서비스에서는 학교 인증 도우미 또는 장애학생지원센터와 연결됩니다.';

const difficultyColor: Record<ScheduleDifficultyLabel, string> = {
  '편하게 이동 가능': '#047857',
  '조금 주의 필요': '#B45309',
  '주의해서 이동': '#B91C1C',
};

export default function ScheduleRouteCard({
  currentStartNodeId,
  onSelectRoute,
}: ScheduleRouteCardProps) {
  const [routeNotice, setRouteNotice] = useState('');
  const [companionOpen, setCompanionOpen] = useState(false);
  const now = useMemo(() => new Date(), []);

  const todaySchedules = useMemo(
    () => getTodaySchedules(sampleCourseSchedules, now),
    [now],
  );
  const nextSchedule = useMemo(
    () => getNextSchedule(sampleCourseSchedules, now),
    [now],
  );
  const recommendation = useMemo(
    () =>
      nextSchedule
        ? createScheduleRouteRecommendation({
            course: nextSchedule,
            startNodeId: currentStartNodeId,
            facilities,
            date: now,
          })
        : null,
    [currentStartNodeId, nextSchedule, now],
  );

  const startLocation =
    facilities.find((facility) => String(facility.id) === currentStartNodeId) ??
    facilities[0];
  const difficulty = recommendation?.difficultyLabel ?? '편하게 이동 가능';

  const handleShowRoute = () => {
    if (!recommendation) {
      setRouteNotice('오늘 남은 수업이 없어 수업길을 만들 수 없습니다.');
      return;
    }

    if (onSelectRoute) {
      onSelectRoute(recommendation.startNodeId, recommendation.destinationNodeId);
      setRouteNotice('선택한 수업길을 지도에 보낼 준비를 했습니다.');
      return;
    }

    console.log('schedule route selected', {
      startNodeId: recommendation.startNodeId,
      destinationNodeId: recommendation.destinationNodeId,
    });
    setRouteNotice('현재는 데모 안내만 표시합니다. 지도 연결 시 이 경로가 선택됩니다.');
  };

  return (
    <Card
      component="section"
      aria-labelledby="today-schedule-route-heading"
      sx={{
        borderRadius: '12px',
        mb: 2,
        border: '1px solid #BBF7D0',
        bgcolor: '#F8FFFB',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <CalendarDays size={22} color="#047857" aria-hidden="true" />
          <Box>
            <Typography
              id="today-schedule-route-heading"
              component="h2"
              sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#064E3B' }}
            >
              오늘의 수업길
            </Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '0.9375rem', mt: 0.25 }}>
              오늘 수업과 다음 장소까지 가는 길을 쉽게 확인해요.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.25,
            mb: 1.5,
            borderRadius: '10px',
            bgcolor: '#ECFDF5',
            border: '1px solid #BBF7D0',
          }}
        >
          <MapPin size={18} color="#047857" aria-hidden="true" />
          <Typography sx={{ color: '#065F46', fontSize: '0.9375rem', fontWeight: 700 }}>
            현재 출발지: {startLocation?.name ?? '기본 위치'}
          </Typography>
        </Box>

        <Card sx={{ borderRadius: '12px', boxShadow: 'none', mb: 1.5 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, mb: 1 }}>
              오늘 수업 목록
            </Typography>
            {todaySchedules.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: '10px' }}>
                오늘 수업이 없습니다.
              </Alert>
            ) : (
              <List sx={{ p: 0 }}>
                {todaySchedules.map((schedule, index) => {
                  const isNext = schedule.id === nextSchedule?.id;
                  return (
                    <Box key={schedule.id}>
                      <ListItemButton
                        selected={isNext}
                        sx={{
                          borderRadius: '10px',
                          alignItems: 'flex-start',
                          gap: 1,
                          px: 1.25,
                          py: 1.25,
                          bgcolor: isNext ? '#ECFDF5' : 'transparent',
                          border: isNext ? '2px solid #34D399' : '1px solid transparent',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mb: 0.5 }}>
                            {isNext && (
                              <Chip
                                label="다음 수업"
                                size="small"
                                sx={{
                                  bgcolor: '#047857',
                                  color: '#fff',
                                  fontWeight: 800,
                                  height: 24,
                                }}
                              />
                            )}
                            <Typography sx={{ fontSize: '1rem', fontWeight: 800 }}>
                              {schedule.courseName}
                            </Typography>
                          </Box>
                          <Typography sx={{ color: '#374151', fontSize: '0.9375rem' }}>
                            {formatMinutes(schedule.startMinutes)} - {formatMinutes(schedule.endMinutes)}
                          </Typography>
                          <Typography sx={{ color: '#4B5563', fontSize: '0.9375rem', mt: 0.25 }}>
                            {schedule.locationName} {schedule.roomName}
                          </Typography>
                        </Box>
                      </ListItemButton>
                      {index < todaySchedules.length - 1 && <Divider />}
                    </Box>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>

        {recommendation ? (
          <Card sx={{ borderRadius: '12px', boxShadow: 'none', border: '1px solid #D1FAE5' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1.5 }}>
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={22} color="#1E3A8A" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: '#4B5563', fontSize: '0.875rem', fontWeight: 700 }}>
                    다음 수업 강조 카드
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, mt: 0.25 }}>
                    {recommendation.course.courseName}
                  </Typography>
                  <Typography sx={{ color: '#374151', fontSize: '1rem', mt: 0.5 }}>
                    {recommendation.course.locationName} {recommendation.course.roomName}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <InfoTile label="수업 시작" value={formatMinutes(recommendation.course.startMinutes)} />
                <InfoTile
                  label="추천 출발"
                  value={formatMinutes(recommendation.recommendedDepartureMinutes)}
                />
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  bgcolor: `${difficultyColor[difficulty]}12`,
                  border: `1px solid ${difficultyColor[difficulty]}33`,
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                  <ShieldCheck size={18} color={difficultyColor[difficulty]} aria-hidden="true" />
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: difficultyColor[difficulty],
                    }}
                  >
                    이동 난이도
                  </Typography>
                  <Chip
                    label={difficulty}
                    size="small"
                    sx={{
                      bgcolor: difficultyColor[difficulty],
                      color: '#fff',
                      fontWeight: 800,
                    }}
                  />
                </Box>
                {recommendation.warnings.length > 0 ? (
                  <Box component="ul" sx={{ m: 0, pl: 2.5, color: '#374151' }}>
                    {recommendation.warnings.map((warning) => (
                      <Typography component="li" key={warning} sx={{ fontSize: '0.9375rem', mb: 0.25 }}>
                        {warning}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: '#374151', fontSize: '0.9375rem' }}>
                    지금은 특별한 주의 문구가 없습니다.
                  </Typography>
                )}
              </Box>

              <Alert
                icon={<AlertTriangle size={18} />}
                severity="info"
                sx={{ borderRadius: '10px', mb: 1.5, bgcolor: '#EEF2FF', color: '#172554' }}
              >
                데모에서는 이동 유형만 사용합니다. 도움 요청은 인증된 도움 제공자 또는 장애학생지원센터와 연결됩니다.
              </Alert>

              {routeNotice && (
                <Alert severity="success" sx={{ borderRadius: '10px', mb: 1.5 }}>
                  {routeNotice}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Navigation size={18} aria-hidden="true" />}
                  onClick={handleShowRoute}
                  sx={{
                    minHeight: 52,
                    borderRadius: '12px',
                    bgcolor: '#1E3A8A',
                    boxShadow: 'none',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': { bgcolor: '#172554' },
                  }}
                >
                  수업길 보기
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HandHeart size={18} aria-hidden="true" />}
                  onClick={() => setCompanionOpen(true)}
                  sx={{
                    minHeight: 52,
                    borderRadius: '12px',
                    borderColor: '#047857',
                    color: '#047857',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': { bgcolor: '#ECFDF5', borderColor: '#065F46' },
                  }}
                >
                  동행 요청하기
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="success" sx={{ borderRadius: '10px' }}>
            오늘 남은 수업이 없습니다.
          </Alert>
        )}
      </CardContent>

      <Snackbar
        open={companionOpen}
        autoHideDuration={5000}
        onClose={() => setCompanionOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          onClose={() => setCompanionOpen(false)}
          sx={{ width: '100%', borderRadius: '10px' }}
        >
          {DEMO_COMPANION_MESSAGE}
        </Alert>
      </Snackbar>
    </Card>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: '10px',
        bgcolor: '#F8FAFC',
        border: '1px solid #E5E7EB',
      }}
    >
      <Typography sx={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography sx={{ color: '#111827', fontSize: '1.125rem', fontWeight: 800, mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}
