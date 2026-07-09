import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import AdminSidebar from '../../organisms/AdminSidebar/AdminSidebar';
import { isAllowedAdminEmail } from '../../pages/admin/adminAccess';
import { syncUserInBackend } from '../../../services/authService';
import './index.scss';

const AdminLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const firebaseAuth = auth;

    if (!firebaseAuth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      void (async () => {
        if (currentUser && !isAllowedAdminEmail(currentUser.email)) {
          await signOut(firebaseAuth);
          setUser(null);
          setLoading(false);
          return;
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
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
