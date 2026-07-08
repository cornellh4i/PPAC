import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminSidebar.scss';

const navItems = [
  { label: 'Home', path: '/admin' },
  { label: 'Events', path: '/admin/events' },
  { label: 'Resources', path: '/admin/resources' },
  { label: 'Community', path: '/admin/community' },
];

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname === path;
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__header">
        <div className="admin-sidebar__logo-circle">P</div>
        <span className="admin-sidebar__title">PPAC Admin</span>
      </div>

      <nav className="admin-sidebar__nav">
        {navItems.map(({ label, path }) => (
          <button
            key={path}
            type="button"
            className={`admin-sidebar__link${isActive(path) ? ' admin-sidebar__link--active' : ''}`}
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
