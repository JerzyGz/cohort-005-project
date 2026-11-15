import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "~/db";
import {
  coupons,
  courses,
  lessons,
  modules,
  purchases,
  refundRequests,
  RefundRequestStatus,
  users,
  videoWatchEvents,
} from "~/db/schema";
import { calculateCourseProgress, lessonLengthSeconds } from "~/lib/course-progress";

export type RefundRequestReview =
  | { kind: "learner"; courseProgress: number | null }
  | { kind: "teamLicence"; seats: number; seatsClaimed: number };

export interface RefundRequestRow {
  id: number;
  status: RefundRequestStatus;
  reason: string;
  requestedAt: string;
  resolvedAt: string | null;
  resolvedByName: string | null;
  learnerName: string;
  learnerEmail: string;
  courseTitle: string;
  courseSlug: string;
  refundAmount: number;
  review: RefundRequestReview;
}

export function hasOpenRefundRequest(): boolean {
  const row = db
    .select({ id: refundRequests.id })
    .from(refundRequests)
    .where(eq(refundRequests.status, RefundRequestStatus.Open))
    .limit(1)
    .get();
  return row !== undefined;
}

/**
 * Open requests come oldest first, so the Admin works them as a queue.
 * Any other listing comes newest first.
 */
export function listRefundRequests(filter: {
  status: RefundRequestStatus | null;
  oldestFirst: boolean;
}): RefundRequestRow[] {
  const resolver = alias(users, "resolver");

  const rows = db
    .select({
      id: refundRequests.id,
      status: refundRequests.status,
      reason: refundRequests.reason,
      requestedAt: refundRequests.requestedAt,
      resolvedAt: refundRequests.resolvedAt,
      resolvedByName: resolver.name,
      purchaseId: purchases.id,
      learnerId: users.id,
      learnerName: users.name,
      learnerEmail: users.email,
      courseId: courses.id,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      refundAmount: purchases.amountPaid,
    })
    .from(refundRequests)
    .innerJoin(purchases, eq(refundRequests.purchaseId, purchases.id))
    .innerJoin(users, eq(purchases.userId, users.id))
    .innerJoin(courses, eq(purchases.courseId, courses.id))
    .leftJoin(resolver, eq(refundRequests.resolvedByUserId, resolver.id))
    .where(
      filter.status ? eq(refundRequests.status, filter.status) : undefined
    )
    .orderBy(
      filter.oldestFirst
        ? asc(refundRequests.requestedAt)
        : desc(refundRequests.requestedAt)
    )
    .all();

  return rows.map(({ purchaseId, learnerId, courseId, ...row }) => ({
    ...row,
    review: getReview(purchaseId, learnerId, courseId),
  }));
}

function getReview(
  purchaseId: number,
  learnerId: number,
  courseId: number
): RefundRequestReview {
  const seats = db
    .select({
      seats: sql<number>`count(*)`,
      seatsClaimed: sql<number>`count(${coupons.redeemedAt})`,
    })
    .from(coupons)
    .where(eq(coupons.purchaseId, purchaseId))
    .get();

  if (seats && seats.seats > 0) {
    return {
      kind: "teamLicence",
      seats: seats.seats,
      seatsClaimed: seats.seatsClaimed,
    };
  }

  return {
    kind: "learner",
    courseProgress: getCourseProgress(learnerId, courseId),
  };
}

export function getCourseProgress(
  userId: number,
  courseId: number
): number | null {
  const courseLessons = db
    .select({
      id: lessons.id,
      videoUrl: lessons.videoUrl,
      durationMinutes: lessons.durationMinutes,
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(eq(modules.courseId, courseId))
    .all();

  if (courseLessons.length === 0) return null;

  const furthest = db
    .select({
      lessonId: videoWatchEvents.lessonId,
      furthest: sql<number>`max(${videoWatchEvents.positionSeconds})`,
    })
    .from(videoWatchEvents)
    .where(
      and(
        eq(videoWatchEvents.userId, userId),
        inArray(
          videoWatchEvents.lessonId,
          courseLessons.map((lesson) => lesson.id)
        ),
      )
    )
    .groupBy(videoWatchEvents.lessonId)
    .all();

  return calculateCourseProgress(
    courseLessons.map((lesson) => ({
      lessonId: lesson.id,
      lengthSeconds: lessonLengthSeconds(lesson),
    })),
    new Map(furthest.map((row) => [row.lessonId, row.furthest]))
  );
}
