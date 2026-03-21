import React from 'react';
import { useAuth } from '../../context/AuthContext';
import ExuTableEditor from './ExuTableEditor';
import { LogOut, Database, ShieldCheck } from 'lucide-react';

const ExuDashboard = ({ onBack }) => {
  const { signOut, session } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onBack();
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Topbar */}
      <header className="sticky top-0 z-50 bg-stone-900 border-b border-amber-900/30 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔱</span>
          <div>
            <h1 className="font-serif font-bold text-amber-400 leading-none">Modo Exu</h1>
            <p className="text-xs text-stone-500 leading-none mt-0.5">
              {session?.user?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-sm text-stone-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-stone-800"
          >
            ← Voltar ao Site
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm font-medium bg-red-900/40 hover:bg-red-900/60 text-red-300 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-900/30 to-stone-900 border border-amber-800/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database size={20} className="text-amber-400" />
            <h2 className="text-lg font-bold text-amber-300 font-serif">Banco de Dados Completo</h2>
          </div>
          <p className="text-stone-400 text-sm leading-relaxed">
            Gerencie todos os dados do site abaixo. Clique em cada seção para expandir e editar.
            Campos com <span className="text-amber-400">🖼 imagem</span> e{' '}
            <span className="text-blue-400">&lt;/&gt; embed</span> permitem conteúdo visual e embeds HTML
            que aparecerão na página de detalhe de cada item.
          </p>
        </div>

        {/* Tabelas editáveis */}
        <ExuTableEditor tableName="projects" />
        <ExuTableEditor tableName="bibliography" />
        <ExuTableEditor tableName="testimonials" />
        <ExuTableEditor tableName="admin_settings" />

        {/* Log de auditoria — somente leitura */}
        <div className="mt-8 mb-2 flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-widest">
          <ShieldCheck size={14} className="text-amber-600" />
          Segurança
        </div>
        <ExuTableEditor tableName="audit_log" />
      </main>

      <footer className="text-center py-6 text-stone-700 text-xs">
        Modo Exu — só entra quem é convidado.
      </footer>
    </div>
  );
};

export default ExuDashboard;
