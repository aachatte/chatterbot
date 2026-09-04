# Sprint 3 deployment checklist

Sprint 3 adds auditable privacy records, privacy safe guardian exports,
recoverable deletion requests, configurable message retention, and a controlled
family pilot limit.

1. Obtain written approval for the configured policy version, message retention
   period, deletion recovery period, and supported jurisdictions.
2. Back up the database and run `flask --app run.py db upgrade` from
   `chatterbot-backend`.
3. Confirm the Alembic head is `20260906_add_privacy_lifecycle`.
4. Set `PRIVACY_POLICY_VERSION`, `MESSAGE_RETENTION_DAYS`,
   `DELETION_GRACE_DAYS`, `PILOT_MODE`, and `PILOT_FAMILY_CAPACITY` explicitly
   in production.
5. Schedule `flask --app run.py run-privacy-jobs` at least daily. Alert if the
   command fails or has not completed within 26 hours.
6. Test an export and confirm that no teen message text appears in the file.
7. Schedule and cancel a test deletion. In staging, advance a request and
   confirm final erasure completes.
8. Confirm registration returns a capacity response when the pilot limit is
   reached.

The default policy version is marked as a draft. It is an engineering control,
not legal approval of the retention schedule or privacy notice.
