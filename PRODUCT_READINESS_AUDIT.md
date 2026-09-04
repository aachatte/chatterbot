# Chatterbot Product Readiness Audit

Audit date: September 4, 2026

## Current architecture

Chatterbot is an SMS first teen support service with a React guardian dashboard and a Flask API. The repository includes authentication, guardian enrollment, phone verification, AI responses, Care Circle permissions, alerts, mood tracking, gamification, billing, and administrative APIs.

## Verified baseline

The frontend passes lint, type checking, 10 component tests, and a production build. The backend passed 30 tests before this sprint. The public landing experience is deployed through Vercel.

## Readiness inventory

| Area | State before sprint | Readiness gap |
| --- | --- | --- |
| Guardian accounts | Functional API and UI | Independent security review needed |
| Teen enrollment | Consent and phone verification exist | SMS processing did not enforce either state |
| Teen chat | Functional SMS path | Crisis output depended on a model completion |
| Safety detection | Keyword rules | No documented version, imminence signal, or third party distinction |
| Guardian alerts | Functional list and resolution | Exposed internal matching patterns and lacked concrete actions |
| Care Circle | Functional permissions and invitation flow | Delivery outcome not summarized on the alert |
| Retry handling | Twilio signature validated | Replayed webhooks could duplicate messages and alerts |
| Privacy | Conversation text hidden from guardians | Retention schedule and formal privacy review remain open |
| Operations | Admin endpoints exist | Staff review workflow, service levels, and incident runbook remain open |
| Clinical safety | Supportive copy exists | Licensed clinical review and formal red team remain open |

## Sprint safety decision

This sprint establishes a reviewable rules based first line classifier. Explicit self harm or violence produces a high severity alert. Imminence or overdose produces a critical alert. Third party disclosures receive crisis guidance without creating an alert about the teen. All detected safety messages receive deterministic resource language rather than an unconstrained model response.

This classifier is a prototype safety layer. It must be evaluated against a clinically reviewed test set before public release.

## Next release gates

1. Licensed child and adolescent mental health review of categories, thresholds, and copy
2. Privacy counsel review of consent, retention, disclosure, and jurisdiction coverage
3. Automated adversarial evaluation with documented false negative and false positive targets
4. Staff safety queue with ownership, response times, and escalation audit history
5. Data retention jobs and guardian export workflow
6. Security review and penetration test
7. Closed pilot with 25 to 50 families
