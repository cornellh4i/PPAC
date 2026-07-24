import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import AdminSidebar from '../../organisms/AdminSidebar/AdminSidebar';
import { isAllowedAdminEmail } from '../../pages/admin/adminAccess';
import { syncUserInBackend } from '../../../services/authService';
import './index.scss';
import avatar from '../../../assets/icons/heart_profile.png';

const adminPageLabels: Record<string, string> = {
  '/admin': 'Admin Settings',
  '/admin/home': 'Home',
  '/admin/events': 'Events',
  '/admin/resources': 'Resources',
  '/admin/community': 'Community',
  '/admin/team': 'Team',
  '/admin/providers': 'Providers',
};

const AdminLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const firebaseAuth = auth;

    if (!firebaseAuth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      void (async () => {
        if (currentUser) {
          const token = await currentUser.getIdToken();
          if (!(await isAllowedAdminEmail(token))) {
            await signOut(firebaseAuth);
            setUser(null);
            setLoading(false);
            return;
          }
        }

        if (currentUser) {
          try {
            await syncUserInBackend(await currentUser.getIdToken(), {
              name: currentUser.displayName || undefined,
              role: 'admin',
            });
          } catch (error) {
            console.error('Failed to sync admin user:', error);
          }
        }

        setUser(currentUser);
        setLoading(false);
      })();
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="admin-layout__loading">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  const pageName = adminPageLabels[location.pathname] || 'Admin';
  const adminName = user.displayName?.trim() || user.email || 'Admin';

  const handleLogout = () => {
    const firebaseAuth = auth;

    if (!firebaseAuth) {
      return;
    }

    void signOut(firebaseAuth);
    setUser(null);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar email={user.email} onLogout={handleLogout} />
      <main className="admin-layout__content">
        <header className="admin-layout__topbar">
          <h1 className="admin-layout__page-title">{pageName}</h1>

          <div className="admin-layout__profile">
            <img
              className="admin-layout__avatar"
              src={avatar}
              alt=""
              aria-hidden="true"
            />

            <div className="admin-layout__profile-copy">
              <span className="admin-layout__profile-name">{adminName}</span>
              <span className="admin-layout__profile-role">Admin</span>
            </div>
          </div>
        </header>

        <div className="admin-layout__page">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
