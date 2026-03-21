import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Header = ({ onNavigate }) => {
    const { theme, toggleTheme } = useTheme();

    // Triplo-clique no logo abre o Modo Exu secretamente
    let clickCount = 0;
    let clickTimer = null;
    const handleLogoClick = () => {
        clickCount++;
        if (clickTimer) clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            if (clickCount >= 3 && onNavigate) {
                onNavigate('exu');
            }
            clickCount = 0;
        }, 500);
    };

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-academic-light/90 dark:bg-academic-dark/95 border-b border-academic-gold/20 transition-colors duration-300">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <button
                    onClick={handleLogoClick}
                    className="flex items-center gap-2 text-academic-gold hover:opacity-80 transition-opacity select-none"
                    title="Prof. William Melo"
                    aria-label="Início"
                >
                    <img src="/logo.png" alt="Logo William Melo" className="h-10 w-10 object-contain" />
                    <span className="font-serif font-bold text-xl tracking-tight text-academic-brown dark:text-academic-light">
                        Prof. William Melo
                    </span>
                </button>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-academic-brown dark:text-academic-pink"
                    aria-label="Alternar tema"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </header>
    );
};

export default Header;
