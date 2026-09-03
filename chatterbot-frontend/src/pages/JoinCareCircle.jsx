import {
  BellRing,
  Check,
  CheckCircle2,
  HeartHandshake,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ChatterbotLogo } from '@/components/ChatterbotLogo.jsx'
import { api } from '@/services/api.js'
import './JoinCareCircle.css'

const ROLE_LABELS = {
  co_guardian: 'Co-guardian',
  family_member: 'Family member',
  counselor: 'Counselor',
  mentor: 'Mentor or coach',
}

const ACCESS_COPY = {
  safety_only: 'Urgent safety alerts only',
  signals: 'Safety alerts and broad support signals',
  coordination: 'Safety alerts, support signals, and shared next steps',
}

export default function JoinCareCircle() {
  const { token } = useParams()
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api
      .getCareCircleInvitation(token)
      .then((response) => {
        if (active) setInvitation(response.invitation)
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError?.data?.error ||
              'This invitation is invalid or no longer available.'
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token])

  const accept = async () => {
    setAccepting(true)
    setError('')
    try {
      await api.acceptCareCircleInvitation(token)
      setAccepted(true)
    } catch (requestError) {
      setError(
        requestError?.data?.error || 'The invitation could not be accepted.'
      )
    } finally {
      setAccepting(false)
    }
  }

  return (
    <main className="join-circle">
      <Link to="/" className="join-circle__brand" aria-label="Chatterbot home">
        <ChatterbotLogo size={38} />
        <span>Chatterbot</span>
      </Link>

      <section className="join-circle__card">
        {loading ? (
          <div className="join-circle__loading" aria-label="Loading invitation">
            <span />
            <span />
            <span />
          </div>
        ) : accepted ? (
          <div className="join-circle__success">
            <span className="join-circle__success-icon">
              <CheckCircle2 size={34} aria-hidden="true" />
            </span>
            <p className="join-circle__eyebrow">Invitation accepted</p>
            <h1>You&apos;re in the circle.</h1>
            <p>
              You are now part of {invitation.teen_first_name}&apos;s trusted
              support team. The guardian will continue to manage your signal
              access.
            </p>
            <Link to="/" className="join-circle__button">
              Return to Chatterbot
            </Link>
          </div>
        ) : error || !invitation ? (
          <div className="join-circle__error">
            <span className="join-circle__error-icon">
              <LockKeyhole size={28} aria-hidden="true" />
            </span>
            <p className="join-circle__eyebrow">Link unavailable</p>
            <h1>This invitation cannot be opened.</h1>
            <p>
              {error || 'Ask the guardian to create a fresh invitation link.'}
            </p>
            <Link
              to="/"
              className="join-circle__button join-circle__button--ghost"
            >
              Go to Chatterbot
            </Link>
          </div>
        ) : (
          <>
            <div className="join-circle__intro">
              <span className="join-circle__icon">
                <HeartHandshake size={27} aria-hidden="true" />
              </span>
              <p className="join-circle__eyebrow">Care Circle invitation</p>
              <h1>Show up when it matters.</h1>
              <p>
                {invitation.guardian_first_name} invited you to support{' '}
                {invitation.teen_first_name} through Chatterbot.
              </p>
            </div>

            <div className="join-circle__details">
              <div>
                <span>Your role</span>
                <strong>
                  {ROLE_LABELS[invitation.role] || 'Trusted adult'}
                </strong>
                {invitation.relationship && (
                  <small>{invitation.relationship}</small>
                )}
              </div>
              <div>
                <span>Your access</span>
                <strong>{ACCESS_COPY[invitation.access_level]}</strong>
              </div>
            </div>

            <div className="join-circle__guardrails">
              <h2>Clear boundaries from day one</h2>
              <ul>
                <li>
                  <ShieldCheck size={17} />
                  <span>
                    <strong>Signals, not surveillance</strong>Only the access
                    listed above is shared.
                  </span>
                </li>
                <li>
                  <LockKeyhole size={17} />
                  <span>
                    <strong>No full transcripts</strong>Care Circle never
                    provides the complete conversation.
                  </span>
                </li>
                <li>
                  <BellRing size={17} />
                  <span>
                    <strong>Purposeful notifications</strong>You are contacted
                    only for enabled signal types.
                  </span>
                </li>
              </ul>
            </div>

            {error && (
              <div className="join-circle__inline-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="button"
              className="join-circle__button"
              disabled={accepting}
              onClick={accept}
            >
              {accepting ? (
                'Joining…'
              ) : (
                <>
                  <Check size={17} /> Accept Care Circle invitation
                </>
              )}
            </button>
            <p className="join-circle__fine-print">
              Accepting confirms that you agree to use shared signals only to
              support {invitation.teen_first_name}.
            </p>
          </>
        )}
      </section>
    </main>
  )
}
