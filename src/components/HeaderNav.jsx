import { Home, LayoutTemplate, Palette, Settings2, User2, LogOut } from 'lucide-react';

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
    <aside className="side-nav">
      <div className="branding">
        <span className="product-mark">Hubon AI</span>
        <span className="product-subtitle">Powered by Kesewi</span>
      </div>

      {isAuthed && (
        <nav className="side-nav-links">
          <button type="button" className={activeView === 'home' ? 'action-btn active' : 'action-btn'} onClick={onHome}>
            <Home size={18} />
            <span>Home</span>
          </button>
          <button
            type="button"
            className={activeView === 'templates' ? 'action-btn active' : 'action-btn'}
            onClick={onTemplates}
          >
            <LayoutTemplate size={18} />
            <span>Templates</span>
          </button>
          <button type="button" className={activeView === 'brand' ? 'action-btn active' : 'action-btn'} onClick={onBrand}>
            <Palette size={18} />
            <span>Brand Style</span>
          </button>
          {canEditTemplates && (
            <button
              type="button"
              className={`action-btn ${isAdminMode ? 'admin-active' : ''}`}
              onClick={onToggleAdmin}
            >
              <Settings2 size={18} />
              <span>Admin Mode</span>
            </button>
          )}
        </nav>
      )}

      <div className="side-nav-grow" />

      {isAuthed ? (
        <div className="user-menu">
          <button type="button" className="user-menu-trigger">
            <User2 size={18} />
            <span className="user-email">{user.email}</span>
          </button>
          <div className="user-menu-pop">
            <button type="button" onClick={onLogout}>
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
