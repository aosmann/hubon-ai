import { LogOut, Mail, Settings2, Sun, Moon } from 'lucide-react';

export default function ProfileView({
  user,
  canEditTemplates,
  isAdminMode,
  isDarkMode,
  onToggleAdmin,
  onDarkModeChange,
  onLogout
}) {
  const email = user?.email ?? 'Not available';
  const avatarInitial = email?.charAt?.(0)?.toUpperCase() || 'U';

  function handleDarkModeToggle(event) {
    onDarkModeChange?.(event.target.checked);
  }

  function handleDarkModeRowClick(event) {
    if (event.target instanceof HTMLElement && event.target.closest('label.toggle')) {
      return;
    }
    onDarkModeChange?.(!isDarkMode);
  }

  function handleDarkModeRowKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onDarkModeChange?.(!isDarkMode);
    }
  }

  return (
    <div className="profile-page">
      <section className="profile-card">
        <header className="profile-card-header">
          <div className="profile-card-avatar" aria-hidden="true">
            {avatarInitial}
          </div>
          <div className="profile-card-meta">
            <span className="profile-card-label">Signed in as</span>
            <span className="profile-card-value">{email}</span>
          </div>
        </header>
        <div className="profile-field">
          <div className="profile-field-icon">
            <Mail size={16} />
          </div>
          <div className="profile-field-details">
            <span className="profile-field-label">Email</span>
            <span className="profile-field-value">{email}</span>
          </div>
        </div>
      </section>

      <section className="profile-card">
        <header className="profile-card-section">
          <h2>Preferences</h2>
          <p>Personalize how Hubon AI behaves on this device.</p>
        </header>

        <div
          className="profile-toggle"
          role="button"
          tabIndex={0}
          onClick={handleDarkModeRowClick}
          onKeyDown={handleDarkModeRowKeyDown}
          aria-label="Toggle dark mode"
        >
          <div className="profile-toggle-text">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <div>
              <span className="profile-toggle-label">Dark mode</span>
              <span className="profile-toggle-description">Switch between dark and light themes.</span>
            </div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={Boolean(isDarkMode)} onChange={handleDarkModeToggle} />
            <span className="toggle-slider" aria-hidden="true" />
          </label>
        </div>

        {canEditTemplates && (
          <div className="profile-toggle" aria-label="Toggle admin mode">
            <div className="profile-toggle-text">
              <Settings2 size={18} />
              <div>
                <span className="profile-toggle-label">Admin mode</span>
                <span className="profile-toggle-description">Unlock template editing tools.</span>
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={isAdminMode}
                onChange={() => onToggleAdmin?.()}
              />
              <span className="toggle-slider" aria-hidden="true" />
            </label>
          </div>
        )}
      </section>

      <section className="profile-card profile-actions">
        <button type="button" className="profile-signout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </section>
    </div>
  );
}
