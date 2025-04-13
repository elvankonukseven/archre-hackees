'use client';

import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '../dashboard';
import Page from './page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Page />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  // Ajoutez d'autres routes ici
]); 