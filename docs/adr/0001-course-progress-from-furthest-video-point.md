---
status: accepted
---

# Course Progress is measured by the furthest point reached in each lesson's video

Admins need to see how far a learner is through a course when reviewing a Refund Request. We measure Course Progress as the furthest point the learner reached in each lesson's video, capped at the lesson's length, as a share of the course's total video length. Lessons with no video or no length are left out. This is the same measure the Watch Limit already uses, so the progress an Admin sees can never contradict whether the learner was allowed to raise the request.

## Considered Options

- **Lessons marked Completed ÷ all lessons.** This is what learners see today. Rejected: it's self-reported, so a learner who watched most of the course but never pressed Mark complete shows 0%, and one who pressed it without watching shows a high number.
- **Only the parts of the video actually played** (built from the position saved every 10 seconds). It resists skipping ahead and doesn't count rewatching twice. Rejected for now because it would disagree with the Watch Limit, which uses the furthest point.
- **Furthest point reached in each lesson.** Chosen.

## Consequences

- Skipping to the end of a video counts as watching all of it. If that becomes a problem, Course Progress and the Watch Limit change together, never one without the other.
- Learner pages still show the Mark complete percentage until they are switched to Course Progress, so for a while learners and Admins can see different numbers.
- Progress at any past moment can be rebuilt from the timestamped watch events, so showing live progress (not a snapshot taken when the request was raised) loses nothing.
