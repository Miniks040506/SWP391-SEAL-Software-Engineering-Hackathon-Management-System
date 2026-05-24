import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EventsPage, EventDetailPage } from '@/features/events';
import { LeaderboardPage } from '@/features/ranking';
import { NotFoundPage } from '@/components/common/NotFoundPage';

// Layout shell: Navbar + <Outlet /> + Footer
const RootLayout = () => (
  <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
    <Navbar />
    <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 min-h-[calc(100vh-280px)]">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // main page
      { path: '/', element: <EventsPage /> },

      // event detail: /events/seal-spring-24
      { path: '/events/:id', element: <EventDetailPage /> },

      // leaderboard, support ?eventId=... to filter by event
      // VD: /standings?eventId=seal-spring-24
      { path: '/standings', element: <LeaderboardPage /> },

      // { path: '/login', element: <LoginPage /> },
      // { path: '/register', element: <RegisterPage /> },
      // { path: '/dashboard', element: <DashboardPage /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);