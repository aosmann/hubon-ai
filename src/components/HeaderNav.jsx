import { useEffect, useRef, useState } from 'react';
import { Home, LayoutTemplate, Palette, Settings2, User2, LogOut, Moon, Sun } from 'lucide-react';

export default function HeaderNav({
  activeView,
  isAdminMode,
  canEditTemplates,
  user,
  isDarkMode,
  onHome,
  onTemplates,
  onBrand,
  onToggleAdmin,
  onDarkModeChange,
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

  function handleDarkModeToggle(event) {
    if (typeof onDarkModeChange === 'function') {
      onDarkModeChange(event.target.checked);
    }
  }

  function handleDarkModeRowClick(event) {
    if (typeof onDarkModeChange !== 'function') return;
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('label.toggle')) {
      return;
    }
    onDarkModeChange(!isDarkMode);
  }

  function handleDarkModeRowKeyDown(event) {
    if (typeof onDarkModeChange !== 'function') return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onDarkModeChange(!isDarkMode);
    }
  }

  return (
    <aside className="side-nav">
      <div className="branding">
        <img src="/hubon-logo.svg" alt="Hubon AI" style={{ width: '80%', height: 'auto' }} />
      </div>

      {isAuthed && (
        <nav className="side-nav-links">
          <button
            type="button"
            className={activeView === 'home' ? 'action-btn active' : 'action-btn'}
            onClick={onHome}
            aria-label="Home"
          >
            <Home size={18} />
            <span>Home</span>
          </button>
          <button
            type="button"
            className={activeView === 'templates' ? 'action-btn active' : 'action-btn'}
            onClick={onTemplates}
            aria-label="Templates"
          >
            <LayoutTemplate size={18} />
            <span>Templates</span>
          </button>
          <button
            type="button"
            className={activeView === 'brand' ? 'action-btn active' : 'action-btn'}
            onClick={onBrand}
            aria-label="Brand style"
          >
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
            aria-label={menuOpen ? 'Close account menu' : 'Open account menu'}
          >
            <User2 size={18} />
            <span className="user-email">{user.email}</span>
          </button>
          {menuOpen && (
            <div className="user-menu-pop">
              <div
                className="user-menu-item user-menu-dark-toggle"
                role="button"
                tabIndex={0}
                onClick={handleDarkModeRowClick}
                onKeyDown={handleDarkModeRowKeyDown}
              >
                <div className="user-menu-item-text">
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  <span>Dark</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(isDarkMode)}
                    onChange={handleDarkModeToggle}
                    aria-label="Toggle dark mode"
                  />
                  <span className="toggle-slider" aria-hidden="true" />
                </label>
              </div>
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
