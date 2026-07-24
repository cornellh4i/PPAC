import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase/config';
import Home from './components/pages/home';
import Team from './components/pages/community';
import Events from './components/pages/events';
import Resources from './components/pages/resources';
import StudentStories from './components/pages/student-stories';
import RootLayout from './components/layouts/rootlayout';
import AdminLayout from './components/layouts/adminlayout';
import Providers from './components/pages/providers';
import AdminLogin from './components/pages/admin/login';
import AdminHome from './components/pages/admin/home';
import AdminSettings from './components/pages/admin/settings';
import AdminEvents from './components/pages/admin/events';
import AdminResources from './components/pages/admin/resources';
import AdminCommunity from './components/pages/admin/community';
import AdminTeam from './components/pages/admin/team';
import NotFound from './components/pages/notfound';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const App: React.FC = () => {
  const [, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'team', element: <Team /> },
        { path: 'student-stories', element: <StudentStories /> },
        { path: 'events', element: <Events /> },
        { path: 'resources', element: <Resources /> },
        { path: 'providers', element: <Providers /> }
      ]
    },
    {
      path: '/admin/login',
      element: <AdminLogin />
    },
    {
      path: '/admin',
      element: <AdminLayout />,
      children: [
        { index: true, element: <AdminSettings /> },
        { path: 'home', element: <AdminHome /> },
        { path: 'events', element: <AdminEvents /> },
        { path: 'resources', element: <AdminResources /> },
        { path: 'community', element: <AdminCommunity /> },
        { path: 'team', element: <AdminTeam /> }
      ]
    },
    {
      path: '*',
      element: <NotFound />
    }
  ])

  return <RouterProvider router={router} />
};

export default App;
