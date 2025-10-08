import { useState } from 'react';

export default function AuthView({ mode, onModeChange, onSubmit, formValues, onChange, error, loading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: '', email: '', hasBrandGuideline: '' });
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const isRequestMode = mode === 'request_account';

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    // Here you can add logic to send the request to your backend/email
    console.log('Account request submitted:', requestForm);
    setRequestSubmitted(true);
  };

  if (requestSubmitted) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <header className="auth-header">
            <h1>Request Received</h1>
            <p className="muted">
              Thank you for your interest! We've received your account request and will get back to you shortly.
            </p>
          </header>
          <div className="auth-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setRequestSubmitted(false);
                onModeChange('sign_in');
              }}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isRequestMode) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <header className="auth-header">
            <h1>Request an Account</h1>
            <p className="muted">Fill in your details and we'll get back to you shortly to set up your account.</p>
          </header>

          <form className="auth-form" onSubmit={handleRequestSubmit}>
            <label className="auth-label">
              <span>Full Name</span>
              <input
                type="text"
                required
                value={requestForm.name}
                onChange={e => setRequestForm(prev => ({ ...prev, name: e.target.value }))}
                autoFocus
              />
            </label>

            <label className="auth-label">
              <span>Email</span>
              <input
                type="email"
                required
                value={requestForm.email}
                onChange={e => setRequestForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </label>

            <label className="auth-label">
              <span>Do you have brand guidelines?</span>
              <select
                required
                value={requestForm.hasBrandGuideline}
                onChange={e => setRequestForm(prev => ({ ...prev, hasBrandGuideline: e.target.value }))}
              >
                <option value="">Select an option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <div className="form-actions auth-actions">
              <button type="submit" className="primary">
                Submit Request
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => onModeChange('sign_in')}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="auth-wrap">
        <div className="auth-card">
          <header className="auth-header">
            <h1>Welcome back</h1>
            <p className="muted">Sign in to sync your brand settings, templates, and image history.</p>
          </header>

          <form
            className="auth-form"
            onSubmit={e => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <label className="auth-label">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={formValues.email}
                onChange={e => onChange('email', e.target.value)}
                aria-invalid={!!error}
                autoFocus
              />
            </label>

            <label className="auth-label">
              <span>Password</span>
              <div className="input-with-action">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formValues.password}
                  onChange={e => onChange('password', e.target.value)}
                  aria-invalid={!!error}
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            {error && (
              <div className="banner banner-error" role="alert">
                {error}
              </div>
            )}

            <div className="form-actions auth-actions">
              <button type="submit" className="primary" disabled={loading}>
                {loading ? 'Please wait…' : 'Sign in'}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => onModeChange('request_account')}
              >
                Request an Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
