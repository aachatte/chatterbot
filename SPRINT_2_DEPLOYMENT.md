# Sprint 2 deployment checklist

Sprint 2 adds columns and tables used by alert ownership, notification delivery
evidence, audit timelines, and family safety plans. Apply the database migrations
before starting application instances that serve this release.

1. Back up the production database and confirm the current Alembic revision.
2. From `chatterbot-backend`, run `flask --app run.py db upgrade` with the
   production `DATABASE_URL` configured.
3. Confirm the revision is `20260905_add_safety_operations`.
4. Deploy the backend, then the frontend.
5. Trigger a non-emergency test alert in a staging account and confirm an alert
   event and notification delivery row appear.
6. Confirm the Twilio status callback URL is publicly reachable at
   `/api/sms/delivery-status` and is configured with the backend `APP_URL`.
7. Confirm the guardian can activate a plan only when a reachable adult exists.

Do not automatically stamp an existing database whose Alembic revision is
unknown. Reconcile its schema against the migration history first.
