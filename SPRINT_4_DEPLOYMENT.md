# Sprint 4 deployment checklist

1. Back up the database and apply migration
   `20260907_add_security_and_pilot_ops`.
2. Set production `APP_URL` and `FRONTEND_URL` to HTTPS origins. Configure
   `PILOT_MODE=true` and confirm the pilot capacity.
3. Run the privacy lifecycle job once so the readiness heartbeat is current.
4. Confirm `/health/live` returns success and `/health/ready` reports every
   dependency healthy.
5. Confirm the frontend and API use related HTTPS domains so the secure refresh
   cookie is sent as intended.
6. Test sign in, refresh rotation, logout, consent, phone verification, safety
   plan activation, and pilot readiness in staging.
7. Pause and resume the staging pilot using `PATCH /api/admin/pilot` with both
   `X-Admin-API-Key` and `X-Admin-Actor` headers.
8. Keep `ENABLE_ADMIN_BROADCAST=false` unless an approved emergency procedure
   requires it.
9. Require the frontend and backend security workflows on the main branch.
10. Complete a backup restore drill and record recovery time and recovery point.

This sprint does not replace independent security, privacy, legal, or clinical
review.
