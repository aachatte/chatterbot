# Incident response runbook

## Severity

1. Critical: immediate safety workflow failure, unauthorized data access, or
   complete service outage.
2. High: repeated SMS delivery failure, provider webhook backlog, privacy job
   failure, or loss of administrative access.
3. Moderate: isolated provider failure with a safe fallback and no data loss.

## First response

1. Assign an incident lead and record the start time.
2. Pause the family pilot when safety, privacy, or message delivery integrity is
   uncertain.
3. Preserve logs and provider event identifiers. Never copy teen message text
   into the incident record.
4. Confirm liveness, readiness, privacy heartbeat, open operational events, and
   provider dashboards.
5. Contain the affected workflow and communicate only verified information.

## Safety incident

Confirm deterministic crisis resources still operate without an AI provider.
Review alert delivery evidence and contact the approved human escalation owner.
Chatterbot must never claim that emergency services were contacted unless the
record contains verified evidence.

## Privacy incident

Disable the affected export or deletion workflow, preserve the audit trail, and
notify the privacy owner. Begin the applicable legal review before communicating
scope or impact.

## Recovery

1. Resolve the operational event with an attributed note.
2. Run the full automated suite and staging smoke test.
3. Resume the pilot only after the incident lead confirms the affected workflow.
4. Record cause, impact, recovery time, corrective action, and owner.
