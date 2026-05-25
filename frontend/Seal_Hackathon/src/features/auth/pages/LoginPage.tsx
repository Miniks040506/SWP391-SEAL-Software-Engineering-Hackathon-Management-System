import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { AuthUser } from '@/stores/authStore';

// ─── Mock users để test các role khác nhau ────────────────────────────────────
const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  'student@seal.dev': {
    password: '123456',
    user: { id: '1', email: 'student@seal.dev', fullName: 'Nguyen Van A', role: 'STUDENT', status: 'ACTIVE' },
  },
  'mentor@seal.dev': {
    password: '123456',
    user: { id: '2', email: 'mentor@seal.dev', fullName: 'Tran Thi B', role: 'MENTOR', status: 'ACTIVE' },
  },
  'judge@seal.dev': {
    password: '123456',
    user: { id: '3', email: 'judge@seal.dev', fullName: 'Le Van C', role: 'JUDGE', status: 'ACTIVE' },
  },
  'coordinator@seal.dev': {
    password: '123456',
    user: { id: '4', email: 'coordinator@seal.dev', fullName: 'Pham Thi D', role: 'COORDINATOR', status: 'ACTIVE' },
  },
  'admin@seal.dev': {
    password: '123456',
    user: { id: '5', email: 'admin@seal.dev', fullName: 'Hoang Van E', role: 'ADMIN', status: 'ACTIVE' },
  },
};
// ─────────────────────────────────────────────────────────────────────────────

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    const match = MOCK_USERS[email];

    if (!match || match.password !== password) {
      setError('Email hoặc mật khẩu không đúng.');
      return;
    }

    // Gọi đúng setAuth như store yêu cầu
    setAuth(match.user, 'mock-access-token', 'mock-refresh-token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-blue-500/20">
            S
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-bold text-gray-900 tracking-tighter italic">SEAL</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Hackathon System</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Đăng nhập</h1>
        <p className="text-sm text-gray-400 mb-6">Dùng mock account bên dưới để test.</p>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@seal.dev"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123456"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleLogin}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-all shadow-md active:translate-y-0.5"
          >
            Đăng nhập
          </button>
        </div>

        {/* Mock accounts hint */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Mock accounts (password: 123456)</p>
          <div className="space-y-1">
            {Object.entries(MOCK_USERS).map(([email, { user }]) => (
              <button
                key={email}
                onClick={() => { setEmail(email); setPassword('123456'); }}
                className="w-full text-left flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-white transition-colors group"
              >
                <span className="text-xs text-gray-600 group-hover:text-gray-900">{email}</span>
                <span className="text-xs font-bold text-blue-500">{user.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};