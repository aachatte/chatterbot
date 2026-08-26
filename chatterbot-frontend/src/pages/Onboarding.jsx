import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import './Onboarding.css';

const STEPS = ['Add your teen', 'Verify phone', 'Set preferences'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [teenId, setTeenId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [verifyCode, setVerifyCode] = useState('');
  const [prefs, setPrefs] = useState({
    crisis_alerts: true,
    weekly_digest: true,
    checkin_reminders: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handleAddTeen = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.addTeen(form.name, form.phone);
      setTeenId(data.teen.id);
      setStep(1);
    } catch (e) {
      setError(e?.data?.error || 'Failed to add teen. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setLoading(true);
    setError('');
    try {
      await api.beginPhoneVerification(teenId);
      setVerificationSent(true);
    } catch (e) {
      setError(e?.data?.error || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verifyCode.trim()) { setError('Enter the 6-digit code.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.verifyPhone(teenId, verifyCode);
      setStep(2);
    } catch (e) {
      setError(e?.data?.error || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrefs = async () => {
    setLoading(true);
    setError('');
    try {
      await api.updateGuardianPreferences(prefs);
    } catch (_) {
      // non-fatal
    } finally {
      setLoading(false);
      navigate('/dashboard');
    }
  };

  return (
    <div className="onboarding">
      <div className="onboarding__card">
        <div className="onboarding__progress">
          {STEPS.map((label, i) => (
            <div key={label} className={`onboarding__step ${i === step ? 'onboarding__step--active' : ''} ${i < step ? 'onboarding__step--done' : ''}`}>
              <div className="onboarding__step-circle">{i < step ? '✓' : i + 1}</div>
              <span className="onboarding__step-label">{label}</span>
              {i < STEPS.length - 1 && <div className="onboarding__step-line" />}
            </div>
          ))}
        </div>

        {error && <div className="onboarding__error">{error}</div>}

        {step === 0 && (
          <div className="onboarding__body">
            <h2 className="onboarding__heading">Add your teen</h2>
            <p className="onboarding__desc">We'll set up Chatterbot on their phone so they can start texting.</p>
            <label className="onboarding__label">Teen's name
              <input className="onboarding__input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Alex" />
            </label>
            <label className="onboarding__label">Teen's cell phone
              <input className="onboarding__input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" type="tel" />
            </label>
            <button className="onboarding__btn" onClick={handleAddTeen} disabled={loading}>
              {loading ? 'Adding…' : 'Continue →'}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="onboarding__body">
            <h2 className="onboarding__heading">Verify phone</h2>
            <p className="onboarding__desc">We'll send a verification text to your teen's phone to confirm the number.</p>
            {!verificationSent ? (
              <button className="onboarding__btn" onClick={handleSendVerification} disabled={loading}>
                {loading ? 'Sending…' : 'Send verification text'}
              </button>
            ) : (
              <>
                <p className="onboarding__sent-note">✅ Verification text sent! Have your teen read you the 6-digit code.</p>
                <label className="onboarding__label">6-digit code
                  <input className="onboarding__input onboarding__input--code" value={verifyCode} onChange={e => setVerifyCode(e.target.value)} placeholder="123456" maxLength={6} />
                </label>
                <button className="onboarding__btn" onClick={handleVerifyCode} disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify →'}
                </button>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="onboarding__body">
            <h2 className="onboarding__heading">Set alert preferences</h2>
            <p className="onboarding__desc">Choose how Chatterbot keeps you in the loop.</p>
            <div className="onboarding__toggles">
              {[
                { key: 'crisis_alerts', label: 'Notify me immediately for crisis alerts', desc: 'Get an instant SMS if Chatterbot detects a crisis.' },
                { key: 'weekly_digest', label: 'Send weekly digest', desc: 'A Sunday evening summary of your teen\'s week.' },
                { key: 'checkin_reminders', label: 'Proactive check-in reminders', desc: 'Chatterbot will nudge your teen every few days.' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="onboarding__toggle-row">
                  <div className="onboarding__toggle-text">
                    <strong>{label}</strong>
                    <span>{desc}</span>
                  </div>
                  <div
                    className={`onboarding__toggle ${prefs[key] ? 'onboarding__toggle--on' : ''}`}
                    onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}
                    role="switch"
                    aria-checked={prefs[key]}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setPrefs(p => ({ ...p, [key]: !p[key] }))}
                  />
                </label>
              ))}
            </div>
            <button className="onboarding__btn" onClick={handleSavePrefs} disabled={loading}>
              {loading ? 'Saving…' : 'Finish setup 🎉'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
