// Course Progress: how much of a course's video a learner has watched. In each
// lesson it counts up to the furthest point reached, the same measure the
// Watch Limit uses. See docs/adr/0001-course-progress-from-furthest-video-point.md.

export interface LessonLength {
  lessonId: number;
  /** Null when the lesson has no video, or no recorded duration. */
  lengthSeconds: number | null;
}

export function lessonLengthSeconds(lesson: {
  videoUrl: string | null;
  durationMinutes: number | null;
}): number | null {
  if (!lesson.videoUrl || !lesson.durationMinutes) return null;
  return lesson.durationMinutes * 60;
}

/**
 * A whole percent from 0 to 100, or null when no lesson in the course has a
 * length, so there is nothing to measure against.
 */
export function calculateCourseProgress(
  lessons: LessonLength[],
  furthestSecondsByLesson: Map<number, number>
): number | null {
  let totalSeconds = 0;
  let watchedSeconds = 0;

  for (const lesson of lessons) {
    if (lesson.lengthSeconds === null) continue;
    totalSeconds += lesson.lengthSeconds;
    const furthest = furthestSecondsByLesson.get(lesson.lessonId) ?? 0;
    watchedSeconds += Math.min(furthest, lesson.lengthSeconds);
  }

  if (totalSeconds === 0) return null;
  return Math.round((watchedSeconds / totalSeconds) * 100);
}
