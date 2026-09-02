import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import NotificationBell from './NotificationBell';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-wine' : 'text-inkSoft hover:text-ink'}`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-ink/10 bg-paper/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-tight text-ink">
          Write<span className="text-wine">Circle</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/explore" className={navLinkClass}>Explore</NavLink>
          <NavLink to="/circles" className={navLinkClass}>Circles</NavLink>
          {user && <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <div className="relative">
                <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2">
                  <Avatar user={user} size="sm" />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 card shadow-lg z-50 py-1"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <Link to={`/writers/${user.username}`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-ink/5">
                      My profile
                    </Link>
                    <Link to="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-ink/5">
                      Settings
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm hover:bg-ink/5 text-wine">
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Log in</Link>
              <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">Join WriteCircle</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
