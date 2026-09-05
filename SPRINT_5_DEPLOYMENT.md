# Sprint 5 pilot deployment

## Before deployment

1. Complete the security, privacy, legal, and clinical launch approvals.
2. Configure all required Render secrets and HTTPS application URLs.
3. Apply migration 20260908_add_pilot_launch_controls.
4. Configure Twilio inbound and delivery webhooks on the final API domain.
5. Confirm provider consoles do not retain unnecessary message content.

## Deployment

The Render Blueprint safely prepares a fresh database or upgrades a versioned
database, then runs the privacy lifecycle before releasing the API. It refuses
to guess the version of a populated database without an Alembic record. It
deploys only after repository checks pass and schedules the privacy lifecycle
daily.

After deployment, run the Staging Smoke Test workflow. Confirm STOP, START, HELP,
phone verification, normal conversation, deterministic crisis response, alert
delivery, and consent withdrawal using synthetic pilot accounts.

## Rollback

Pause the pilot first. Roll the API back to the last verified image. Do not
downgrade the database while Sprint 5 records exist. If the schema itself is the
cause, restore through the approved database recovery procedure.

## Required secrets

1. Application and JWT secrets
2. Administrative API key
3. PostgreSQL and Redis connection URLs
4. Twilio account credentials and sender number
5. OpenAI API key
6. Stripe API and webhook credentials
7. Staging smoke test URL and administrative key
