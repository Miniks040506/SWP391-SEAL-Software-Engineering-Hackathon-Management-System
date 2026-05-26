// Public layout
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const RootLayout = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 min-h-[calc(100vh-280px)]">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};