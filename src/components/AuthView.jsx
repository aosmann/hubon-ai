import { useState } from 'react';

export default function AuthView({ mode, onModeChange, onSubmit, formValues, onChange, error, loading }) {
  const [showPassword, setShowPassword] = useState(false);
  const isSignUp = mode === 'sign_up';

  return (
    <>
      <div className="auth-wrap">
        <div className="auth-card">
          <header className="auth-header">
            <h1>{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
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
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
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
              {isSignUp && <small className="hint muted">Use at least 8 characters.</small>}
            </label>

            {error && (
              <div className="banner banner-error" role="alert">
                {error}
              </div>
            )}

            <div className="form-actions auth-actions">
              <button type="submit" className="primary" disabled={loading}>
                {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => onModeChange(isSignUp ? 'sign_in' : 'sign_up')}
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
