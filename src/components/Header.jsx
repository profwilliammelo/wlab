import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogIn, LogOut } from 'lucide-react';
import LoginModal from './LoginModal';

const Header = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const { session, isAdmin, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-academic-light/90 dark:bg-academic-dark/95 border-b border-academic-gold/20 transition-colors duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => onNavigate && onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity select-none"
            aria-label="Início"
          >
            <img src="/logo.png" alt="Logo William Melo" className="h-10 w-10 object-contain" />
            <span className="font-serif font-bold text-xl tracking-tight text-academic-brown dark:text-academic-light">
              Prof. William Melo
            </span>
          </button>

          {/* Ações */}
          <div className="flex items-center gap-2">

            {/* Botão Modo Exu — só aparece se for admin */}
            {isAdmin && (
              <button
                onClick={() => onNavigate && onNavigate('exu')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-semibold transition"
                title="Modo Exu — Painel Admin"
              >
                <span>🔱</span>
                <span className="hidden sm:inline">Modo Exu</span>
              </button>
            )}

            {/* Login / Logout */}
            {session ? (
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-academic-brown/50 dark:text-academic-pink/50"
                title={`Sair (${session.user.email})`}
              >
                <LogOut size={18} />
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-academic-brown/50 dark:text-academic-pink/50"
                title="Entrar"
              >
                <LogIn size={18} />
              </button>
            )}

            {/* Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-academic-brown dark:text-academic-pink"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Modal de login */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default Header;
