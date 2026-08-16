import React, { useState } from 'react';
import { api } from '../services/api.js';

export default function DashboardChat() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am the Chatterbot Assistant. I can help you understand your teen\'s alerts, give advice on digital boundaries, or explain how our safety monitoring works.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.sendDashboardChat(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error connecting to the server.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 'var(--cb-space-2)' }}>Assistant</h1>
        <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15, marginBottom: 'var(--cb-space-6)' }}>Chat with the AI about your teen's alerts and mental health strategies.</p>
      </div>

      <div style={{ 
        flex: 1, 
        background: 'var(--cb-bg-elevated)', 
        border: '1px solid var(--cb-border)', 
        borderRadius: 'var(--cb-radius-xl)', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--cb-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-4)' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? 'var(--cb-text-primary)' : 'var(--cb-bg-muted)',
              color: msg.role === 'user' ? 'var(--cb-bg-elevated)' : 'var(--cb-text-primary)',
              padding: '12px 16px',
              borderRadius: 'var(--cb-radius-lg)',
              maxWidth: '75%',
              lineHeight: 1.5,
              fontSize: 15
            }}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', padding: '12px 16px', color: 'var(--cb-text-tertiary)', fontSize: 14 }}>
              Chatterbot is typing...
            </div>
          )}
        </div>

        <form onSubmit={handleSend} style={{ padding: 'var(--cb-space-4)', borderTop: '1px solid var(--cb-border)', display: 'flex', gap: 'var(--cb-space-3)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about alerts, setting boundaries, or how the bot works..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--cb-radius-lg)',
              border: '1px solid var(--cb-border)',
              background: 'var(--cb-bg)',
              color: 'var(--cb-text-primary)',
              fontSize: 15,
              outline: 'none'
            }}
          />
          <button type="submit" disabled={loading} style={{
            padding: '0 24px',
            borderRadius: 'var(--cb-radius-lg)',
            background: 'var(--cb-text-primary)',
            color: 'var(--cb-bg-elevated)',
            fontWeight: 500,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
