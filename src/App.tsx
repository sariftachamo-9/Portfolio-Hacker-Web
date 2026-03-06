import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Cryptography from './pages/Cryptography';
import React, { useState } from 'react';
import AIAgent from './components/AIAgent';
import LoadingScreen from './components/LoadingScreen';
import { AnimatePresence } from 'motion/react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <LoadingScreen key="loading" onFinish={() => setLoading(false)} />
        )}
      </AnimatePresence>

      <Router>
        <div className="min-h-screen bg-black text-neon-green font-mono relative overflow-hidden">
          {/* Background Effects */}
          <div className="fixed inset-0 bg-grid pointer-events-none opacity-50" />
          <div className="scanlines" />

          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<Portfolio />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cryptography" element={<Cryptography />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          <AIAgent />
        </div>
      </Router>
    </>
  );
}
