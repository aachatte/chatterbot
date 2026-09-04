# Chatterbot security review package

Status: Engineering review complete, independent penetration test pending

## Trust boundaries

1. Guardians authenticate through the web application and receive a short lived
   access token plus an HTTP only refresh cookie.
2. Teens interact through signed Twilio webhooks after guardian consent and
   phone verification.
3. The API stores family configuration, privacy safe alert summaries, safety
   operations records, and message content subject to retention redaction.
4. Administrative operations require a dedicated API key. Changes also require
   a named administrative actor.
5. OpenAI receives conversation context only for ordinary responses. Detected
   safety messages use deterministic crisis output.

## Threats and implemented controls

### Account takeover

Refresh sessions store only hashed token identifiers. Every refresh rotates the
session and revokes its predecessor. Logout and password changes increment the
account session version, invalidating existing access and refresh tokens.

Residual work: independent testing, stronger password policy, optional multi
factor authentication, and account recovery review.

### Cross account access

Guardian routes scope teen, alert, Care Circle, deletion, consent, and export
records to the authenticated guardian. Automated tests attempt access using a
different guardian identity.

Residual work: independent authorization testing across every route.

### SMS spoofing and replay

Inbound and delivery webhooks verify Twilio signatures. Message identifiers are
unique, preventing replayed inbound messages from duplicating alerts. Delivery
callbacks are idempotent for terminal states.

Residual work: staging validation behind the production proxy and monitoring
for signature failures.

### Sensitive data in logs

Inbound SMS content and phone numbers are not logged. A logging filter redacts
common phone and credential shapes. Request logs contain method, path, status,
and request identifier without query strings or bodies.

Residual work: inspect infrastructure and vendor logs during the pilot.

### Administrative misuse

Administrative requests use a separate constant time compared credential,
rate limiting, and a required actor name for changes. Broadcast messaging is
disabled unless explicitly enabled. Pilot pause changes retain the actor and
reason.

Residual work: replace the shared administrative key with individual staff
accounts and role based access before a wider launch.

### Dependency and source compromise

Continuous integration runs backend tests, the safety evaluation, migration
validation, Python compilation, frontend production dependency audit, Python
dependency audit, a high confidence secret scan, and a container build.

Residual work: enable repository branch protection and platform secret scanning.

## Required external approvals

1. Independent penetration test
2. Privacy counsel review
3. Licensed child and adolescent mental health review
4. Cloud infrastructure and backup review
5. Pilot incident drill sign off
