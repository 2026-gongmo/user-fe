export interface CourseSchedule {
  id: string;
  courseName: string;
  dayOfWeek: number;
  startMinutes: number;
  endMinutes: number;
  locationName: string;
  destinationNodeId: string;
  roomName: string;
  memo?: string;
}

export type ScheduleDifficultyLabel =
  | '편하게 이동 가능'
  | '조금 주의 필요'
  | '주의해서 이동';

export interface ScheduleRouteRecommendation {
  course: CourseSchedule;
  startNodeId: string;
  destinationNodeId: string;
  difficultyLabel: ScheduleDifficultyLabel;
  warnings: string[];
  recommendedDepartureMinutes: number;
}

export interface ScheduleRouteRequest {
  source: 'schedule';
  courseId: string;
  courseName: string;
  destinationNodeId: string;
  destinationName: string;
  roomName: string;
  difficultyLabel: ScheduleDifficultyLabel;
  warnings: string[];
}
