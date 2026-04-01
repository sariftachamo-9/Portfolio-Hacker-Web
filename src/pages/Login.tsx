import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, User, AlertCircle, Terminal } from 'lucide-react';
import MatrixBackground from '../components/MatrixBackground';
import CustomCursor from '../components/CustomCursor';
import { useMechanicalClick } from '../hooks/useMechanicalClick';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { handleClickStrong, handleClick } = useMechanicalClick();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Security-Signal': 'active'
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', data.username);
        navigate('/admin');
      } else {
        setError(data.error || 'ACCESS_DENIED: INVALID_CREDENTIALS');
      }
    } catch (err) {
      setError('SYSTEM_ERROR: CONNECTION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 font-mono selection:bg-neon-green selection:text-black">
      <MatrixBackground />
      <CustomCursor />
      <div className="scanlines" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-10 border-neon-green/50 crt-flicker"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-neon-green/10 mb-4 border border-neon-green/20">
            <Lock className="text-neon-green" size={32} />
          </div>
          <h1 className="text-3xl font-bold glitch uppercase tracking-tighter">
            ADMIN_<span className="neon-text">LOGIN</span>
          </h1>
          <p className="text-neon-green/40 mt-2 text-xs tracking-widest uppercase">./AUTH_REQUIRED</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 text-[10px] flex items-center gap-3 font-bold uppercase tracking-widest">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neon-green/40">User_ID</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-green/20" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="terminal-input w-full pl-12 text-xs"
                placeholder="ENTER_USERNAME"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neon-green/40">Access_Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-green/20" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="terminal-input w-full pl-12 text-xs"
                placeholder="ENTER_PASSWORD"
                required
              />
            </div>
          </div>

          <button
            disabled={loading}
            onClick={handleClickStrong}
            className="w-full py-4 bg-neon-green text-black font-bold uppercase tracking-widest text-xs neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 btn-mechanical"
          >
            {loading ? 'AUTHENTICATING...' : '[ SIGN_IN ]'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={(e) => { handleClick(e); navigate('/'); }}
            className="text-neon-green/40 hover:text-neon-green text-[10px] uppercase tracking-widest transition-colors mechanical-btn"
          >
            ← RETURN_TO_PORTFOLIO
          </button>
        </div>
      </motion.div>
    </div>
  );
}
