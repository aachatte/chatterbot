# Database backup and recovery runbook

Status: Procedure template requiring validation in the production provider

## Backup requirements

1. Enable encrypted automated database backups.
2. Retain enough restore points to cover accidental deletion and delayed
   corruption detection under the approved privacy policy.
3. Restrict backup access to named operators.
4. Monitor the timestamp and outcome of every backup.
5. Never copy production teen data into development environments.

## Restore drill

1. Select an encrypted backup in an isolated recovery environment.
2. Restore without exposing the database publicly.
3. Run `flask --app run.py db current` and confirm the expected revision.
4. Run the backend test suite against a synthetic database, not the restored
   production data.
5. Validate record counts, foreign key integrity, privacy job heartbeat, and a
   synthetic guardian workflow.
6. Destroy the isolated recovery environment according to the approved policy.
7. Record recovery point, recovery duration, operator, findings, and follow up
   work.

Do not promote a restored database into production until the incident lead and
privacy owner approve the recovery point.
