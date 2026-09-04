# Chatterbot

Chatterbot is an SMS first support platform for teens and their guardians. Teens receive conversational check ins by text, while guardians use a privacy conscious dashboard for enrollment, Care Circle permissions, summaries, and safety alerts.

Care Circle lets a guardian create a teen specific network of trusted adults, issue expiring invitation links, choose which support signals each member can receive, pause or remove access, and review a privacy safe activity history. Accepted members with SMS safety alerts enabled can receive a minimal safety signal without conversation text.

Privacy controls provide versioned consent events, guardian exports that exclude
teen message text, configurable content redaction, recoverable deletion
requests, and controlled pilot capacity. Run the privacy lifecycle command on a
daily schedule in deployed environments.

## Project structure

| Directory | Stack | Purpose |
| --- | --- | --- |
| `chatterbot-frontend` | React, Vite, TypeScript, Tailwind | Landing page and guardian dashboard |
| `chatterbot-backend` | Flask, SQLAlchemy, PostgreSQL, Redis | API, messaging, scheduling, billing, and alerts |

## Local setup

### Frontend

```bash
cd chatterbot-frontend
cp .env.example .env
npm ci
npm run dev
```

The Vite development server prints its local URL when it starts.

### Backend

```bash
cd chatterbot-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

For PostgreSQL and Redis through Docker:

```bash
cd chatterbot-backend
docker compose up -d
```

Review both `.env.example` files before connecting Twilio, OpenAI, Stripe, PostgreSQL, or Redis. Never commit real credentials.

## Quality checks

Run the frontend checks:

```bash
cd chatterbot-frontend
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Run the backend tests through Python so the project root is resolved correctly:

```bash
cd chatterbot-backend
.venv/bin/python -m pytest
.venv/bin/python -m pip check
```

The application creates the Care Circle tables during normal startup. Deployments with externally managed schemas can use the included Care Circle migration as the schema reference.

## Production notes

Production requires strong values for `SECRET_KEY`, `JWT_SECRET_KEY`, and `ADMIN_API_KEY`. Flask debug mode is rejected in production. Configure the frontend API URL and all service credentials through the deployment platform rather than committing environment files.

This product handles sensitive wellness information. Before a production launch, complete legal, privacy, consent, security, crisis escalation, and clinical safety reviews for every supported jurisdiction.
