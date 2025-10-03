import { useEffect, useRef, useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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
            <div className="admin-toggle">
              <span className="admin-toggle-label">
                <Settings2 size={18} />
                Admin
              </span>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={isAdminMode}
                  onChange={onToggleAdmin}
                />
                <span className="toggle-slider" aria-hidden="true" />
              </label>
            </div>
          )}
        </nav>
      )}

      <div className="side-nav-grow" />

      {isAuthed ? (
        <div className="user-menu" ref={menuRef}>
          <button
            type="button"
            className="user-menu-trigger"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-expanded={menuOpen}
          >
            <User2 size={18} />
            <span className="user-email">{user.email}</span>
          </button>
          {menuOpen && (
            <div className="user-menu-pop">
              <button type="button" onClick={() => { setMenuOpen(false); onLogout(); }}>
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      ) : null}
    </aside>
  );
}
