export default function AuthView({ mode, onModeChange, onSubmit, formValues, onChange, error, loading }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1>{mode === 'sign_up' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="page-subtitle">Sign in to sync your brand settings, templates, and image history.</p>
        </div>
      </div>

      <form
        className="auth-form"
        onSubmit={event => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label>
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={formValues.email}
            onChange={event => onChange('email', event.target.value)}
          />
        </label>
        <label>
          <span>Password</span>
          <input
            type="password"
            autoComplete={mode === 'sign_up' ? 'new-password' : 'current-password'}
            required
            value={formValues.password}
            onChange={event => onChange('password', event.target.value)}
          />
        </label>
        {error && <p className="error-message">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'sign_up' ? 'Create account' : 'Sign in'}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => onModeChange(mode === 'sign_up' ? 'sign_in' : 'sign_up')}
          >
            {mode === 'sign_up' ? 'Already have an account? Sign in' : "Need an account? Sign up"}
          </button>
        </div>
      </form>
    </>
  );
}
