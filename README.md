# Chatterbot

Chatterbot is an SMS first support platform for teens and their guardians. Teens receive conversational check ins by text, while guardians use a privacy conscious dashboard for enrollment, preferences, summaries, and safety alerts.

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

## Production notes

Production requires strong values for `SECRET_KEY`, `JWT_SECRET_KEY`, and `ADMIN_API_KEY`. Flask debug mode is rejected in production. Configure the frontend API URL and all service credentials through the deployment platform rather than committing environment files.

This product handles sensitive wellness information. Before a production launch, complete legal, privacy, consent, security, crisis escalation, and clinical safety reviews for every supported jurisdiction.
