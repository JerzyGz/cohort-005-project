import { describe, it, expect } from "vitest";
import { calculateCourseProgress, lessonLengthSeconds } from "./course-progress";

describe("lessonLengthSeconds", () => {
  it("is the lesson's duration in seconds when it has a video", () => {
    expect(
      lessonLengthSeconds({ videoUrl: "https://youtu.be/x", durationMinutes: 10 })
    ).toBe(600);
  });

  it("is null for a lesson with no video", () => {
    expect(lessonLengthSeconds({ videoUrl: null, durationMinutes: 10 })).toBe(
      null
    );
  });

  it("is null for a video lesson with no duration", () => {
    expect(
      lessonLengthSeconds({ videoUrl: "https://youtu.be/x", durationMinutes: null })
    ).toBe(null);
    expect(
      lessonLengthSeconds({ videoUrl: "https://youtu.be/x", durationMinutes: 0 })
    ).toBe(null);
  });
});

describe("calculateCourseProgress", () => {
  it("is the furthest point reached as a share of the course's video", () => {
    const lessons = [
      { lessonId: 1, lengthSeconds: 600 },
      { lessonId: 2, lengthSeconds: 600 },
      { lessonId: 3, lengthSeconds: 600 },
      { lessonId: 4, lengthSeconds: 600 },
      { lessonId: 5, lengthSeconds: 600 },
    ];
    const furthest = new Map([
      [1, 600],
      [2, 0],
    ]);

    expect(calculateCourseProgress(lessons, furthest)).toBe(20);
  });

  it("is 0 when the learner has watched nothing", () => {
    expect(
      calculateCourseProgress([{ lessonId: 1, lengthSeconds: 600 }], new Map())
    ).toBe(0);
  });

  it("never counts more than a lesson's length", () => {
    const lessons = [
      { lessonId: 1, lengthSeconds: 600 },
      { lessonId: 2, lengthSeconds: 600 },
    ];
    // The recorded length is rounded to whole minutes, so the player can
    // report a position past it.
    const furthest = new Map([[1, 700]]);

    expect(calculateCourseProgress(lessons, furthest)).toBe(50);
  });

  it("leaves lessons with no length out of both sides", () => {
    const lessons = [
      { lessonId: 1, lengthSeconds: 600 },
      { lessonId: 2, lengthSeconds: null },
    ];
    const furthest = new Map([
      [1, 300],
      [2, 900],
    ]);

    expect(calculateCourseProgress(lessons, furthest)).toBe(50);
  });

  it("is null when no lesson in the course has a length", () => {
    expect(
      calculateCourseProgress(
        [{ lessonId: 1, lengthSeconds: null }],
        new Map([[1, 300]])
      )
    ).toBe(null);
    expect(calculateCourseProgress([], new Map())).toBe(null);
  });

  it("rounds to a whole percent", () => {
    const lessons = [{ lessonId: 1, lengthSeconds: 300 }];

    expect(calculateCourseProgress(lessons, new Map([[1, 100]]))).toBe(33);
  });
});
