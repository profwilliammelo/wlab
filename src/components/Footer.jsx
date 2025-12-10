import React from 'react';

const Footer = () => {
    return (
        <footer className="py-8 mt-12 border-t border-academic-gold/20 bg-academic-light dark:bg-academic-dark transition-colors duration-300">
            <div className="container mx-auto px-4 text-center">
                <p className="text-academic-brown/80 dark:text-academic-pink/60 font-serif text-sm">
                    &copy; {new Date().getFullYear()} Prof. William Melo. Todos os direitos reservados.
                </p>
                <p className="text-xs text-academic-brown/50 dark:text-academic-pink/40 mt-2">
                    Desenvolvido por DrWilliam Melo.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
