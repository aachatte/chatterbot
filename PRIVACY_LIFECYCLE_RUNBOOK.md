# Privacy lifecycle runbook

Owner: Privacy operations

Status: Engineering draft pending privacy counsel review

## Data boundaries

Guardian exports contain guardian account data, teen enrollment metadata,
conversation metadata, Care Circle configuration, family safety plans, and
privacy safe alert records. Teen message text is never included in a guardian
export.

## Retention job

Run `flask --app run.py run-privacy-jobs` daily. The command redacts expired
message content and removes the associated Twilio identifier and matched safety
patterns. It also completes deletion requests whose recovery window has ended.

If the job fails, retain the failure log, notify the privacy operations owner,
and retry after resolving the database or configuration issue. Do not shorten
or extend retention manually without an approved policy change.

## Deletion requests

A guardian must type the teen name to schedule deletion. Scheduling immediately
deactivates the teen profile. During the configured recovery window, the
guardian can cancel and reactivate it. After the deadline, the privacy job
deletes the teen profile and related operational data while retaining a minimal
request record and completion event.

## Consent withdrawal

Consent withdrawal immediately disables the teen profile and blocks SMS
processing through the existing enrollment gate. A new authenticated guardian
confirmation is required before reactivation.

## Export incidents

If an export includes message text, verification secrets, raw invitation
tokens, or data belonging to another guardian, disable exports, preserve logs,
follow the incident response runbook, and begin the applicable breach review.
