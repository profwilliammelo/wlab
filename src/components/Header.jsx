import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, GraduationCap } from 'lucide-react';

const Header = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-academic-dark/90 dark:bg-academic-dark/95 bg-academic-light/90 border-b border-academic-gold/20 transition-colors duration-300">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 text-academic-gold">
                    <img src="/logo.png" alt="Logo William Melo" className="h-10 w-10 object-contain" />
                    <span className="font-serif font-bold text-xl tracking-tight text-academic-brown dark:text-academic-light">
                        Prof. William Melo
                    </span>
                </div>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-academic-brown dark:text-academic-pink"
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </header>
    );
};

export default Header;
