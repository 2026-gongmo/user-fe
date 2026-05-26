import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Typography,
} from '@mui/material';
import {
  AlertTriangle,
  CalendarDays,
  HandHeart,
  MapPin,
  Megaphone,
  Navigation,
  ShieldCheck,
} from 'lucide-react';

import AccessibilityReportDialog from './AccessibilityReportDialog';
import CompanionTicketDialog from './CompanionTicketDialog';
import { facilities } from '../data/mockData';
import { sampleCourseSchedules } from '../data/sampleSchedules';
import {
  createScheduleRouteRecommendation,
  formatMinutes,
  getNextSchedule,
  getTodaySchedules,
} from '../utils/scheduleUtils';
import type { ScheduleDifficultyLabel, ScheduleRouteRequest } from '../types/schedule';

interface ScheduleRouteCardProps {
  currentStartNodeId: string;
  onSelectRoute?: (startNodeId: string, destinationNodeId: string) => void;
}

const DEMO_NOW = new Date(2026, 4, 21, 9, 20);

const difficultyColor: Record<ScheduleDifficultyLabel, string> = {
  '편하게 이동 가능': '#047857',
  '조금 주의 필요': '#B45309',
  '주의해서 이동': '#D97706',
};

const routeComparisonOptions = [
  {
    title: '빠른 길',
    minutes: '8분',
    note: '계단과 경사 구간이 있어요',
    color: '#1E3A8A',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  {
    title: '안전한 길',
    minutes: '11분',
    note: '계단과 급경사를 피해요',
    color: '#047857',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    badge: '추천',
  },
] as const;

export default function ScheduleRouteCard({
  currentStartNodeId,
  onSelectRoute,
}: ScheduleRouteCardProps) {
  const navigate = useNavigate();
  const [routeNotice, setRouteNotice] = useState('');
  const [companionOpen, setCompanionOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const now = useMemo(() => DEMO_NOW, []);

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
  const destinationLocation = recommendation
    ? facilities.find((facility) => String(facility.id) === recommendation.destinationNodeId)
    : null;
  const difficulty = recommendation?.difficultyLabel ?? '편하게 이동 가능';

  const routeRequest = useMemo<ScheduleRouteRequest | null>(() => {
    if (!recommendation) return null;

    return {
      source: 'schedule',
      courseId: recommendation.course.id,
      courseName: recommendation.course.courseName,
      destinationNodeId: recommendation.destinationNodeId,
      destinationName: destinationLocation?.name ?? recommendation.course.locationName,
      roomName: recommendation.course.roomName,
      difficultyLabel: recommendation.difficultyLabel,
      warnings: recommendation.warnings,
    };
  }, [destinationLocation?.name, recommendation]);

  const handleShowRoute = () => {
    if (!recommendation) {
      setRouteNotice('오늘 남은 수업이 없어 이동 안내를 만들 수 없어요.');
      return;
    }

    if (onSelectRoute) {
      onSelectRoute(recommendation.startNodeId, recommendation.destinationNodeId);
      setRouteNotice('지도에서 수업길을 확인할 수 있어요.');
      return;
    }

    navigate('/map', {
      state: {
        routeRequest,
      },
    });
  };

  return (
    <Card
      component="section"
      aria-labelledby="today-schedule-route-heading"
      sx={{
        borderRadius: '8px',
        mb: 2,
        border: '1px solid #CDEBDD',
        bgcolor: '#FBFEFC',
        boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
          <CalendarDays size={22} color="#047857" aria-hidden="true" />
          <Box>
            <Typography
              id="today-schedule-route-heading"
              component="h2"
              sx={{ fontWeight: 900, fontSize: '1.375rem', color: '#064E3B' }}
            >
              오늘의 이동
            </Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '0.9375rem', mt: 0.25 }}>
              다음 장소까지 안전하게 이동할 수 있도록 미리 확인해요.
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
            borderRadius: '8px',
            bgcolor: '#ECFDF5',
            border: '1px solid #CDEBDD',
          }}
        >
          <MapPin size={18} color="#047857" aria-hidden="true" />
          <Typography sx={{ color: '#065F46', fontSize: '0.9375rem', fontWeight: 700 }}>
            현재 출발지: {startLocation?.name ?? '현재 위치'}
          </Typography>
        </Box>

        <Card sx={{ borderRadius: '8px', boxShadow: 'none', mb: 1.5, borderColor: '#E2E8F0' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, mb: 1 }}>
              오늘 일정
            </Typography>
            {todaySchedules.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: '8px' }}>
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
                          borderRadius: '8px',
                          alignItems: 'flex-start',
                          gap: 1,
                          px: 1.25,
                          py: 1.25,
                          bgcolor: isNext ? '#ECFDF5' : 'transparent',
                          border: isNext ? '2px solid #A7F3D0' : '1px solid transparent',
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
          <Card sx={{ borderRadius: '8px', boxShadow: 'none', border: '1px solid #D1FAE5' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1.5 }}>
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '8px',
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
                    이동 안내
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, mt: 0.25 }}>
                    오늘 {formatMinutes(recommendation.course.startMinutes)} 수업까지 {difficulty}예요.
                  </Typography>
                  <Typography sx={{ color: '#374151', fontSize: '1rem', mt: 0.5 }}>
                    {recommendation.course.courseName} · {recommendation.course.locationName} {recommendation.course.roomName}
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
                component="section"
                aria-label="빠른 길과 안전한 길 비교"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 1,
                  mb: 1.5,
                }}
              >
                {routeComparisonOptions.map((option) => (
                  <Box
                    key={option.title}
                    sx={{
                      p: 1.5,
                      borderRadius: '8px',
                      bgcolor: option.bg,
                      border: `1px solid ${option.border}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Typography
                        sx={{
                          color: option.color,
                          fontSize: '0.875rem',
                          fontWeight: 900,
                        }}
                      >
                        {option.title}
                      </Typography>
                      {'badge' in option && option.badge && (
                        <Chip
                          label={option.badge}
                          size="small"
                          sx={{
                            bgcolor: option.color,
                            color: '#fff',
                            height: 20,
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                          }}
                        />
                      )}
                    </Box>
                    <Typography sx={{ color: '#111827', fontSize: '1.25rem', fontWeight: 900 }}>
                      {option.minutes}
                    </Typography>
                    <Typography sx={{ color: '#374151', fontSize: '0.8125rem', mt: 0.25 }}>
                      {option.note}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
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
                  <Box role="list" sx={{ display: 'grid', gap: 0.5 }}>
                    {recommendation.warnings.map((warning) => (
                      <Box
                        key={warning}
                        role="listitem"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
                      >
                        <AlertTriangle size={17} color={difficultyColor[difficulty]} aria-hidden="true" />
                        <Typography sx={{ color: '#374151', fontSize: '1rem', fontWeight: 700 }}>
                          {warning}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: '#374151', fontSize: '1rem' }}>
                    지금은 특별히 주의할 점이 없습니다.
                  </Typography>
                )}
              </Box>

              <Alert
                icon={<AlertTriangle size={18} />}
                severity="info"
                sx={{ borderRadius: '8px', mb: 1.5, bgcolor: '#F0F7F4', color: '#064E3B' }}
              >
                안전한 길을 추천했어요. 날씨와 제보 정보를 함께 확인해 주의할 구간을 알려드려요.
              </Alert>

              {routeNotice && (
                <Alert severity="success" sx={{ borderRadius: '8px', mb: 1.5 }}>
                  {routeNotice}
                </Alert>
              )}

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                  gap: 1,
                }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Navigation size={18} aria-hidden="true" />}
                  onClick={handleShowRoute}
                  sx={{
                    minHeight: 52,
                    borderRadius: '8px',
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
                  variant="contained"
                  startIcon={<HandHeart size={18} aria-hidden="true" />}
                  onClick={() => setCompanionOpen(true)}
                  sx={{
                    minHeight: 52,
                    borderRadius: '8px',
                    bgcolor: '#047857',
                    color: '#fff',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': { bgcolor: '#065F46' },
                  }}
                >
                  동행 요청
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Megaphone size={18} aria-hidden="true" />}
                  onClick={() => setReportOpen(true)}
                  sx={{
                    gridColumn: { xs: '1 / -1', sm: 'auto' },
                    minHeight: 52,
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
                  }}
                >
                  제보하기
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="success" sx={{ borderRadius: '8px' }}>
            오늘 남은 수업이 없습니다.
          </Alert>
        )}
      </CardContent>

      <CompanionTicketDialog
        open={companionOpen}
        onClose={() => setCompanionOpen(false)}
        routeRequest={routeRequest}
      />
      <AccessibilityReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        defaultPlaceName={destinationLocation?.name ?? ''}
      />
    </Card>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: '8px',
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
