import type { Facility } from '../types';
import type {
  CourseSchedule,
  ScheduleDifficultyLabel,
  ScheduleRouteRecommendation,
} from '../types/schedule';

const DEPARTURE_BUFFER_MINUTES = 10;

export function getTodaySchedules(
  schedules: CourseSchedule[],
  date: Date,
): CourseSchedule[] {
  return schedules
    .filter((schedule) => schedule.dayOfWeek === date.getDay())
    .sort((a, b) => a.startMinutes - b.startMinutes);
}

export function getNextSchedule(
  schedules: CourseSchedule[],
  date: Date,
): CourseSchedule | null {
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  return (
    getTodaySchedules(schedules, date).find(
      (schedule) => schedule.startMinutes > nowMinutes,
    ) ?? null
  );
}

export function formatMinutes(minutes: number): string {
  const safeMinutes = Math.max(0, minutes);
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function getRecommendedDepartureTime(
  schedule: CourseSchedule,
  estimatedMoveMinutes: number,
): number {
  return Math.max(
    0,
    schedule.startMinutes - estimatedMoveMinutes - DEPARTURE_BUFFER_MINUTES,
  );
}

export function calculateScheduleDifficulty(
  warnings: string[],
): ScheduleDifficultyLabel {
  if (warnings.length === 0) return '편하게 이동 가능';
  if (warnings.length <= 2) return '조금 주의 필요';
  return '주의해서 이동';
}

export function estimateMoveMinutes(
  startNodeId: string,
  destinationNodeId: string,
  facilities: Facility[],
): number {
  const start = facilities.find((facility) => String(facility.id) === startNodeId);
  const destination = facilities.find(
    (facility) => String(facility.id) === destinationNodeId,
  );

  if (!start || !destination) return 15;

  const distance = Math.hypot(destination.x - start.x, destination.y - start.y);
  return Math.max(8, Math.round(distance / 4) + 8);
}

export function getScheduleRouteWarnings(
  startNodeId: string,
  destinationNodeId: string,
  facilities: Facility[],
  date = new Date(),
): string[] {
  const warnings: string[] = [];
  const destination = facilities.find(
    (facility) => String(facility.id) === destinationNodeId,
  );

  if (!destination?.accessible) warnings.push('계단 있음');
  if (destination?.category === 'ramp') warnings.push('경사 구간 있음');
  if (destinationNodeId === '3') warnings.push('비 예보');
  if (destinationNodeId === '3') warnings.push('후문 경사 구간');
  if (destinationNodeId === '6') warnings.push('엘리베이터 고장 제보');
  if (date.getDay() === 1 || date.getDay() === 3) warnings.push('비 오는 날 주의');

  if (startNodeId === destinationNodeId) {
    return warnings.filter((warning) => warning !== '공사 구간');
  }

  return warnings;
}

export function createScheduleRouteRecommendation({
  course,
  startNodeId,
  facilities,
  date = new Date(),
}: {
  course: CourseSchedule;
  startNodeId: string;
  facilities: Facility[];
  date?: Date;
}): ScheduleRouteRecommendation {
  const estimatedMoveMinutes = estimateMoveMinutes(
    startNodeId,
    course.destinationNodeId,
    facilities,
  );
  const warnings = getScheduleRouteWarnings(
    startNodeId,
    course.destinationNodeId,
    facilities,
    date,
  );

  return {
    course,
    startNodeId,
    destinationNodeId: course.destinationNodeId,
    difficultyLabel: calculateScheduleDifficulty(warnings),
    warnings,
    recommendedDepartureMinutes: getRecommendedDepartureTime(
      course,
      estimatedMoveMinutes,
    ),
  };
}
