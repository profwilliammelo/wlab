import React from 'react';
import { useAuth } from '../../context/AuthContext';
import ExuLogin from './ExuLogin';
import ExuDashboard from './ExuDashboard';
import { Loader2 } from 'lucide-react';

const ExuMode = ({ onBack }) => {
  const { session, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <Loader2 className="animate-spin text-amber-400 w-10 h-10" />
      </div>
    );
  }

  // Usuário logado mas não é admin — mostra acesso negado
  if (session && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 px-4 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-red-400 mb-2">Acesso Negado</h1>
        <p className="text-stone-400 mb-6">
          O e-mail <strong className="text-white">{session.user.email}</strong> não tem permissão de administrador.
        </p>
        <button
          onClick={onBack}
          className="bg-stone-700 hover:bg-stone-600 text-white px-6 py-2 rounded-lg transition text-sm"
        >
          ← Voltar ao Site
        </button>
      </div>
    );
  }

  // Não logado — mostrar login
  if (!session) {
    return <ExuLogin />;
  }

  // Logado e é admin — mostrar dashboard
  return <ExuDashboard onBack={onBack} />;
};

export default ExuMode;
