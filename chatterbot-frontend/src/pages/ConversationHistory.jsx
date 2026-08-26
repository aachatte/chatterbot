import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import './ConversationHistory.css';

export default function ConversationHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teenName, setTeenName] = useState('');

  useEffect(() => {
    Promise.all([
      api.getMoodHistory(id).catch(() => []),
      api.getTeen ? api.getTeen(id).catch(() => null) : Promise.resolve(null),
    ]).then(([moods, teen]) => {
      setEntries(moods || []);
      if (teen?.teen?.first_name) setTeenName(teen.teen.first_name);
      setLoading(false);
    });
  }, [id]);

  const getTopicFromNote = (note) => {
    if (!note) return 'General';
    const lower = note.toLowerCase();
    if (lower.includes('school') || lower.includes('homework')) return 'School';
    if (lower.includes('anxi') || lower.includes('stress') || lower.includes('nervous')) return 'Anxiety';
    if (lower.includes('friend') || lower.includes('social')) return 'Friendships';
    if (lower.includes('sleep') || lower.includes('tired')) return 'Sleep';
    if (lower.includes('family') || lower.includes('parent')) return 'Family';
    if (lower.includes('sad') || lower.includes('depress')) return 'Mood';
    return 'General';
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMoodColor = (score) => {
    if (!score) return '#999';
    if (score >= 7) return '#22c55e';
    if (score >= 5) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="convhist">
      <div className="convhist__header">
        <button className="convhist__back" onClick={() => navigate(`/dashboard/teens/${id}`)}>
          ← Back to {teenName || 'Teen'}
        </button>
        <h1 className="convhist__title">Conversation History</h1>
        <p className="convhist__subtitle">for {teenName}</p>
      </div>

      <div className="convhist__notice">
        <span className="convhist__notice-icon">🔒</span>
        <p>Chatterbot shows <strong>topic summaries</strong>, not verbatim messages, to protect your teen's privacy.</p>
      </div>

      {loading ? (
        <div className="convhist__loading">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="convhist__empty">No conversations recorded yet.</div>
      ) : (
        <div className="convhist__list">
          {entries.map((entry) => (
            <div key={entry.id} className="convhist__card">
              <div className="convhist__card-left" />
              <div className="convhist__card-body">
                <div className="convhist__card-top">
                  <span className="convhist__topic">{getTopicFromNote(entry.note)}</span>
                  <span className="convhist__date">{formatDate(entry.created_at)}</span>
                </div>
                <p className="convhist__summary">
                  {entry.note || 'No summary available for this session.'}
                </p>
              </div>
              {entry.score && (
                <div
                  className="convhist__mood-badge"
                  style={{ background: getMoodColor(entry.score) }}
                >
                  {entry.score}/10
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
