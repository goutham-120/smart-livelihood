import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export const Login = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('beneficiary@demo.gov.in');
  const [password, setPassword] = useState('Demo@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.login(identifier, password);
      if (res.token) {
        onLoginSuccess(res.token, res.user);
        navigate(res.user.role === 'officer' || res.user.role === 'admin' ? '/dashboard' : '/assistant');
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role, district) => {
    setLoading(true);
    try {
      const res = await api.demoLogin(role, district);
      if (res.token) {
        onLoginSuccess(res.token, res.user);
        navigate(res.user.role === 'officer' || res.user.role === 'admin' ? '/dashboard' : '/assistant');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '480px', marginTop: '60px' }}>
      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Sign In to Livelihood Assistant</h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>PM-AJAY AI Voice Skilling & Mapping Portal</p>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email or Phone Number</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Instant Demo Access</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={() => handleDemo('beneficiary', 'Warangal')} className="btn btn-secondary" style={{ fontSize: '12px' }}>Beneficiary</button>
            <button onClick={() => handleDemo('officer', 'Warangal')} className="btn btn-secondary" style={{ fontSize: '12px' }}>Officer (Warangal)</button>
            <button onClick={() => handleDemo('officer', 'Adilabad')} className="btn btn-secondary" style={{ fontSize: '12px' }}>Officer (Adilabad)</button>
            <button onClick={() => handleDemo('admin', 'Warangal')} className="btn btn-secondary" style={{ fontSize: '12px' }}>Ministry Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
};
