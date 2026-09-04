import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'

const MOCK_TEENS = [
  {
    id: 1,
    first_name: 'Maya',
    phone: '+1 (555) 123-4567',
    age: 16,
    grade: '11th',
    is_active: true,
    consent_verified: true,
    message_count: 187,
    last_interaction_at: '2026-08-13T07:30:00Z',
    interests: ['lacrosse', 'debate'],
  },
  {
    id: 2,
    first_name: 'Ethan',
    phone: '+1 (555) 987-6543',
    age: 14,
    grade: '9th',
    is_active: true,
    consent_verified: true,
    message_count: 155,
    last_interaction_at: '2026-08-12T22:15:00Z',
    interests: ['basketball', 'gaming'],
  },
]

export default function Teens() {
  const [teens, setTeens] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTeen, setNewTeen] = useState({
    first_name: '',
    phone: '',
    age: '',
    grade: '',
    interests: '',
  })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    api
      .getTeens()
      .then((data) => setTeens(data.teens))
      .catch(() => setTeens([]))
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      const data = await api.createTeen({
        ...newTeen,
        age: newTeen.age ? parseInt(newTeen.age) : undefined,
        interests: newTeen.interests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      })
      setTeens((prev) => [...prev, data.teen])
      setShowAddModal(false)
      setNewTeen({
        first_name: '',
        phone: '',
        age: '',
        grade: '',
        interests: '',
      })
    } catch (err) {
      alert(err.data?.error || 'Failed to add teen')
    }
    setAdding(false)
  }

  const handleDelete = async (id) => {
    const teen = teens.find((item) => item.id === id)
    const confirmation = prompt(
      `Type ${teen?.first_name || 'the teen name'} to schedule deletion. You can cancel during the recovery window.`
    )
    if (!confirmation) return
    try {
      await api.deleteTeen(id, confirmation)
      setTeens((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_active: false } : item
        )
      )
      alert(
        'Deletion scheduled. You can cancel it from Privacy controls during the recovery window.'
      )
    } catch (err) {
      alert(err.data?.error || 'Failed to delete')
    }
  }

  if (loading)
    return (
      <div
        style={{
          color: 'var(--cb-text-tertiary)',
          textAlign: 'center',
          padding: 'var(--cb-space-10)',
        }}
      >
        Loading...
      </div>
    )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--cb-space-6)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 'var(--cb-space-2)',
            }}
          >
            Teens
          </h1>
          <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>
            Manage who Chatterbot connects with
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--cb-radius-lg)',
            background: 'var(--cb-text-primary)',
            color: 'var(--cb-bg-elevated)',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cb-space-2)',
          }}
        >
          <PlusIcon /> Add teen
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--cb-space-3)',
        }}
      >
        {teens.map((teen) => (
          <div
            key={teen.id}
            style={{
              background: 'var(--cb-bg-elevated)',
              border: '1px solid var(--cb-border)',
              borderRadius: 'var(--cb-radius-xl)',
              padding: 'var(--cb-space-5)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--cb-space-4)',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--cb-bg-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {teen.first_name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--cb-space-2)',
                  marginBottom: 2,
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 15 }}>
                  {teen.first_name}
                </span>
                {!teen.is_active && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 6px',
                      borderRadius: 'var(--cb-radius-sm)',
                      background: 'var(--cb-bg-muted)',
                      color: 'var(--cb-text-tertiary)',
                    }}
                  >
                    Inactive
                  </span>
                )}
                {!teen.consent_verified && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 6px',
                      borderRadius: 'var(--cb-radius-sm)',
                      background: 'var(--cb-warning-soft)',
                      color: 'var(--cb-warning)',
                    }}
                  >
                    Consent pending
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--cb-text-tertiary)' }}>
                {teen.phone} · {teen.grade} · {teen.message_count} messages
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--cb-space-2)',
              }}
            >
              <Link
                to={`/dashboard/teens/${teen.id}`}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--cb-radius-md)',
                  border: '1px solid var(--cb-border)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--cb-text-secondary)',
                }}
              >
                View
              </Link>
              <button
                onClick={() => handleDelete(teen.id)}
                style={{
                  padding: '8px',
                  borderRadius: 'var(--cb-radius-md)',
                  border: '1px solid var(--cb-border)',
                  color: 'var(--cb-text-tertiary)',
                  opacity: 0,
                  transition: 'opacity 0.15s',
                }}
                title="Schedule teen data deletion"
                aria-label={`Schedule deletion for ${teen.first_name}`}
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--cb-space-4)',
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: 'var(--cb-bg-elevated)',
              borderRadius: 'var(--cb-radius-xl)',
              padding: 'var(--cb-space-6)',
              width: '100%',
              maxWidth: 440,
              boxShadow: 'var(--cb-shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 'var(--cb-space-5)',
              }}
            >
              Add a teen
            </h2>
            <form onSubmit={handleAdd}>
              {['first_name', 'phone', 'age', 'grade'].map((field) => (
                <div key={field} style={{ marginBottom: 'var(--cb-space-4)' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 500,
                      marginBottom: 'var(--cb-space-2)',
                      color: 'var(--cb-text-secondary)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {field.replace('_', ' ')}
                  </label>
                  <input
                    value={newTeen[field]}
                    onChange={(e) =>
                      setNewTeen((p) => ({ ...p, [field]: e.target.value }))
                    }
                    required={field === 'first_name' || field === 'phone'}
                    placeholder={
                      field === 'phone'
                        ? '+1 (555) 000-0000'
                        : field === 'age'
                          ? '16'
                          : field === 'grade'
                            ? '11th'
                            : 'Maya'
                    }
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--cb-radius-lg)',
                      border: '1px solid var(--cb-border)',
                      background: 'var(--cb-bg)',
                      color: 'var(--cb-text-primary)',
                      fontSize: 15,
                      outline: 'none',
                    }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 'var(--cb-space-5)' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 'var(--cb-space-2)',
                    color: 'var(--cb-text-secondary)',
                  }}
                >
                  Interests (comma separated)
                </label>
                <input
                  value={newTeen.interests}
                  onChange={(e) =>
                    setNewTeen((p) => ({ ...p, interests: e.target.value }))
                  }
                  placeholder="lacrosse, debate, music"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--cb-radius-lg)',
                    border: '1px solid var(--cb-border)',
                    background: 'var(--cb-bg)',
                    color: 'var(--cb-text-primary)',
                    fontSize: 15,
                    outline: 'none',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--cb-space-3)',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--cb-radius-lg)',
                    border: '1px solid var(--cb-border)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--cb-text-secondary)',
                    background: 'transparent',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--cb-radius-lg)',
                    background: 'var(--cb-text-primary)',
                    color: 'var(--cb-bg-elevated)',
                    fontSize: 14,
                    fontWeight: 500,
                    border: 'none',
                    opacity: adding ? 0.7 : 1,
                  }}
                >
                  {adding ? 'Adding...' : 'Add teen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}
