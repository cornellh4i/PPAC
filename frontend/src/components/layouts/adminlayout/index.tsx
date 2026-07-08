import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import AdminSidebar from '../../organisms/AdminSidebar/AdminSidebar';
import { isAllowedAdminEmail } from '../../pages/admin/adminAccess';
import './index.scss';

const AdminLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !isAllowedAdminEmail(currentUser.email)) {
        void signOut(auth!).finally(() => {
          setUser(null);
          setLoading(false);
        });
        return;
      }

      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="admin-layout__loading">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-layout__content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
