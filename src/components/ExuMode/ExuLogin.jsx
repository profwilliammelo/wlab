import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';

const ExuLogin = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      // AuthContext redireciona automaticamente via estado
    } catch (err) {
      setError('E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔱</div>
          <h1 className="text-3xl font-bold text-amber-400 font-serif mb-1">Modo Exu</h1>
          <p className="text-stone-400 text-sm">Painel Administrativo — Acesso Restrito</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-stone-900 border border-amber-900/40 rounded-2xl p-8 shadow-2xl"
        >
          <div className="mb-5">
            <label className="block text-sm font-medium text-stone-300 mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2.5 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              placeholder="seu@email.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-300 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2.5 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogIn size={18} />
            )}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-stone-600 text-xs mt-6">
          Nas encruzilhadas, só passa quem foi convidado.
        </p>
      </div>
    </div>
  );
};

export default ExuLogin;
