# Sprint 6 pilot operations

## Purpose

Sprint 6 replaces anonymous operational changes with individual staff accounts,
role based authorization, expiring sessions, login lockouts, and a privacy safe
audit history. It also adds aggregate pilot outcomes and teen accessible sharing
transparency through SMS.

## Before deployment

1. Apply migration `20260909_add_staff_operations`.
2. Confirm the API and staff console use HTTPS.
3. Keep the legacy administrative key in the secret manager for emergency
   bootstrap access only.
4. Create the first named administrator from a trusted service shell.

```bash
flask --app run.py create-staff
```

5. Sign in at `/staff` and create separate accounts for each approved operator.
6. Assign the minimum required role: viewer, operator, safety lead, or admin.

## Access model

Viewers can inspect pilot signals. Operators and safety leads can resolve
operational events and update the safety workflow. Safety leads and admins can
review the staff audit history. Only admins can pause the pilot, run the
scheduler, send an enabled broadcast, or manage staff access.

Staff sessions expire after eight hours. Five failed password attempts lock an
account for fifteen minutes. Disabling an account revokes its active sessions.

## Pilot validation

Review the thirty day metrics in the staff operations center at least weekly.
Track activation, engagement, alert resolution, provider failures, open
operational events, and SMS opt outs. These measures contain no phone numbers or
message text.

Test the teen transparency commands with a synthetic enrolled number:

1. `PRIVACY` explains what guardians and Care Circle adults can receive.
2. `CIRCLE` lists active approved support adults.
3. `HELP` includes the transparency commands and crisis resources.

## Remaining external release gates

Clinical review, privacy counsel approval, independent penetration testing,
infrastructure backup verification, and a staffed incident drill remain required
before a broad public launch.
