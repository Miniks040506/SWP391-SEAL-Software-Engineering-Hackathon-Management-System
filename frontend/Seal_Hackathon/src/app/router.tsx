import { createBrowserRouter } from 'react-router-dom';
import { CoordinatorLayout } from '../layouts/CoordinatorLayout';
import { Dashboard } from '../pages/coordinator/Dashboard';
import { Home } from "../pages/home/Home";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/coordinator',
    element: <CoordinatorLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
]);