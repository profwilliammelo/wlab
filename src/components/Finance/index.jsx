import React from 'react';
import { useAuth } from '../../context/AuthContext';
import FinanceDashboard from './FinanceDashboard';
import { Loader2, Wallet } from 'lucide-react';

const Finance = ({ onBack }) => {
  const { session, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950">
        <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
      </div>
    );
  }

  // Área privada — só o dono (admin) acessa suas finanças.
  if (!session || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-950 px-4 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-600/15 text-amber-400">
          <Wallet size={28} />
        </span>
        <h1 className="font-serif text-2xl font-bold text-amber-400">Finanças Pessoais</h1>
        <p className="max-w-xs text-sm text-stone-400">
          {session
            ? 'Seu e-mail não tem permissão para acessar esta área.'
            : 'Faça login com o e-mail admin pelo botão no topo do site.'}
        </p>
        <button onClick={onBack}
          className="mt-2 rounded-lg bg-stone-700 px-6 py-2 text-sm text-white transition hover:bg-stone-600">
          ← Voltar ao Site
        </button>
      </div>
    );
  }

  return <FinanceDashboard onBack={onBack} />;
};

export default Finance;
