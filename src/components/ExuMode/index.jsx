import React from 'react';
import { useAuth } from '../../context/AuthContext';
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

  // Não logado ou não é admin — redireciona pro site
  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 px-4 text-center gap-4">
        <div className="text-5xl">🔱</div>
        <h1 className="text-2xl font-bold text-amber-400 font-serif">Modo Exu</h1>
        <p className="text-stone-400 text-sm max-w-xs">
          {session
            ? 'Seu e-mail não tem permissão de administrador.'
            : 'Faça login com o e-mail admin pelo botão no topo do site.'}
        </p>
        <button
          onClick={onBack}
          className="mt-2 bg-stone-700 hover:bg-stone-600 text-white px-6 py-2 rounded-lg transition text-sm"
        >
          ← Voltar ao Site
        </button>
      </div>
    );
  }

  // Logado e é admin
  return <ExuDashboard onBack={onBack} />;
};

export default ExuMode;
