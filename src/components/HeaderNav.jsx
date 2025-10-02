export default function HeaderNav({
  activeView,
  isAdminMode,
  canEditTemplates,
  user,
  onHome,
  onTemplates,
  onBrand,
  onToggleAdmin,
  onLogout
}) {
  const isAuthed = Boolean(user);
  return (
    <header className="shell-header">
      <div className="branding">
        <span className="product-mark">Hubon AI</span>
        <span className="product-subtitle">Powered by Kesewi</span>
      </div>
      <nav className="header-actions">
        {isAuthed && (
          <>
            <button type="button" className={activeView === 'home' ? 'action-btn active' : 'action-btn'} onClick={onHome}>
              Home
            </button>
            <button
              type="button"
              className={activeView === 'templates' ? 'action-btn active' : 'action-btn'}
              onClick={onTemplates}
            >
              Templates
            </button>
            <button type="button" className={activeView === 'brand' ? 'action-btn active' : 'action-btn'} onClick={onBrand}>
              Brand Style
            </button>
            {canEditTemplates && (
              <button
                type="button"
                className={`action-btn ${isAdminMode ? 'active' : ''}`}
                onClick={onToggleAdmin}
              >
                Admin Mode
              </button>
            )}
          </>
        )}
      </nav>
      {isAuthed ? (
        <div className="user-pill">
          <span className="user-email">{user.email}</span>
          <button type="button" className="secondary" onClick={onLogout}>
            Sign out
          </button>
        </div>
      ) : null}
    </header>
  );
}
