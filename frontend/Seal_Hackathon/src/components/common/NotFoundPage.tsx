import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-40 space-y-6 text-center">
      <span className="text-7xl font-extrabold text-blue-400">404</span>
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-gray-800">Page not found</h1>
        <p className="text-sm text-gray-400 font-medium">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-all"
      >
        Back to Home
      </button>
    </div>
  );
};