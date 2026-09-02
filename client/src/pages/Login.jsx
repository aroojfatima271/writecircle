import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      navigate(location.state?.from?.pathname || '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <h1 className="font-display text-3xl text-ink mb-2">Welcome back</h1>
      <p className="text-muted text-sm mb-8">Log in to keep writing and reviewing.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-inkSoft mb-1.5">Email</label>
          <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm text-inkSoft mb-1.5">Password</label>
          <input type="password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        New to WriteCircle? <Link to="/register" className="text-wine hover:underline">Create an account</Link>
      </p>
      <p className="text-xs text-muted mt-4 text-center">
        Demo: maya@example.com · devon@example.com — password Password123!
      </p>
    </div>
  );
};

export default Login;
