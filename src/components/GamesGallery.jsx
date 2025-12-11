import React from 'react';
import { ArrowLeft, Gamepad2, ExternalLink } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const GamesGallery = ({ onBack }) => {
    // Hardcoded games list as per user request (one-off 2025 event)
    const games = [
        {
            id: 1,
            title: "Mundo Quente - 712 | 2025",
            type: "Jogo Educacional",
            year: 2025,
            description: "Jogo educativo sobre aquecimento global criado pela turma 712. Ajude a salvar o planeta combatendo o efeito estufa!",
            link: "https://williammelo.my.canva.site/mundo-quente-712-2025",
            image_url: null // Can be added later if needed
        }
    ];

    return (
        <div className="min-h-screen bg-academic-light dark:bg-academic-dark text-academic-dark dark:text-academic-light transition-colors duration-300">
            <Header />

            <main className="pt-32 pb-20 container mx-auto px-4 min-h-screen">
                <button
                    onClick={onBack}
                    className="mb-8 flex items-center gap-2 text-academic-gold hover:text-academic-brown dark:hover:text-academic-pink transition-colors font-medium"
                >
                    <ArrowLeft size={20} />
                    Voltar para Home
                </button>

                <div className="flex flex-col items-center mb-12">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-center text-academic-brown dark:text-academic-light mb-4">
                        Jogos Educativos
                    </h1>
                    <p className="max-w-2xl text-center text-lg text-academic-brown/80 dark:text-academic-light/80">
                        Explore os jogos desenvolvidos por nossos alunos sobre Efeito Estufa e Aquecimento Global.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {games.map(game => (
                        <a
                            key={game.id}
                            href={game.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-white dark:bg-academic-brown/40 border border-academic-gold/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col"
                        >
                            <div className="h-48 bg-academic-gold/20 flex items-center justify-center relative overflow-hidden">
                                {game.image_url ? (
                                    <img src={game.image_url} alt={game.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Gamepad2 size={64} className="text-academic-gold opacity-50 group-hover:scale-110 transition-transform duration-500" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                    <span className="text-white font-bold tracking-wider flex items-center gap-2">
                                        JOGAR AGORA <ExternalLink size={16} />
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-academic-gold uppercase tracking-wider">{game.type || 'Jogo'}</span>
                                    <span className="text-xs text-academic-brown/60 dark:text-academic-pink/60">{game.year}</span>
                                </div>
                                <h3 className="font-serif text-xl font-bold mb-3 text-academic-dark dark:text-academic-light group-hover:text-academic-gold transition-colors">
                                    {game.title}
                                </h3>
                                <p className="text-sm text-academic-brown/80 dark:text-academic-pink/80 line-clamp-3">
                                    {game.description}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default GamesGallery;
