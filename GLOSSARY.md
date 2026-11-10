# Cadence

An online course platform where learners buy courses, watch lessons, and can ask for their money back.

## Language

### Refund Requests

**Refund Request**:
A learner's ask to get their money back for a purchase, which an Admin reviews by hand. It records the decision, not the movement of money.
_Avoid_: Reversal, Chargeback, Cancellation, cancel my purchase

**Pending**:
The state of a Refund Request that has been raised and not yet reviewed.
_Avoid_: Requested, open, waiting

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
_Avoid_: Pending (that is a Refund Request state)

**Completed**:
The state of a Refund the payment provider has confirmed: the money is back with the learner.
_Avoid_: Refunded (that describes the purchase), done, settled

**Failed**:
The state of a Refund the payment provider could not carry out.

**Refunded**:
A purchase whose Refund Request has a Completed Refund.
_Avoid_: Reversed, cancelled
