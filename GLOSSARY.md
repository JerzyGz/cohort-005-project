# Cadence

An online course platform where learners buy courses, watch lessons, and can ask for their money back.

## Language

### Learning

**Course Progress**:
How much of a course's video a learner has watched, from 0% to 100%. In each lesson, it counts up to the furthest point they reached. Lessons with no video don't count.
_Avoid_: Completion rate, lessons completed

### Team Licences

**Team Licence**:
One purchase of several Seats of a course by one buyer, who does not join the course themselves.
_Avoid_: Team purchase, bulk purchase

**Seat**:
One place on a Team Licence, handed out as a code that lets one person join the course.
_Avoid_: Coupon, voucher

**Claimed**:
A Seat someone has used to join the course. A Team Licence with any Claimed Seat cannot get a Refund Request.
_Avoid_: Redeemed, used

### Refund Requests

**Refund Request**:
A learner's ask to get their money back for a purchase, which an Admin reviews by hand. It records the decision, not the movement of money.
_Avoid_: Reversal, Chargeback, Cancellation, cancel my purchase

**Refund Window**:
The 14 calendar days after a purchase in which the learner can raise a Refund Request.
_Avoid_: Grace period, cooling-off period

**Watch Limit**:
How much of a course's video a learner can watch, 2 hours, before they can no longer raise a Refund Request. It is measured the same way as Course Progress, but in hours, not percent.
_Avoid_: 2-hour rule, max watched hours

**Open**:
The state of a Refund Request that has been raised and not yet reviewed.
_Avoid_: Pending, Requested, waiting

**Approved**:
The state of a Refund Request an Admin has accepted. The learner loses access to the course, and a Refund is started.

**Declined**:
The state of a Refund Request an Admin has rejected, so no Refund is started.
_Avoid_: Rejected, denied

### Refunds

**Refund**:
One attempt by the payment provider to pay the Refund Amount back for an Approved Refund Request. A Refund Request may have several Refunds, and at most one is Completed.
_Avoid_: Reversal, payout, Chargeback

**Refund Amount**:
What a Refund pays back: always exactly what the learner paid for the purchase, never the list price.
_Avoid_: Refundable amount, reversal amount

**Processing**:
The state of a Refund sent to the payment provider that has no final result yet.
_Avoid_: Pending, Open (that is a Refund Request state)

**Completed**:
The state of a Refund the payment provider has confirmed: the money is back with the learner.
_Avoid_: Refunded (that describes the purchase), done, settled

**Failed**:
The state of a Refund the payment provider could not carry out.

**Refunded**:
A purchase whose Refund Request has a Completed Refund.
_Avoid_: Reversed, cancelled
