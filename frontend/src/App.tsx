import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase/config';
import Login from './components/pages/login';
import Home from './components/pages/home';
import Community from './components/pages/community';
import Events from './components/pages/events';
import Resources from './components/pages/resources';
import RootLayout from './components/layouts/rootlayout';
import Providers from './components/pages/providers';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
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
        { path: 'community', element: <Community /> },
        { path: 'events', element: <Events /> },
        { path: 'resources', element: <Resources /> },
        { path: 'providers', element: <Providers /> }
      ]
    }
  ])

  return <RouterProvider router={router} />
};

export default App;