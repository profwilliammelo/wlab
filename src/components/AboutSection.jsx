import React from 'react';
import { BookOpen, Users, Mic } from 'lucide-react';

const AboutSection = () => {
    return (
        <section className="py-20 bg-academic-light dark:bg-academic-brown/10 border-t border-academic-gold/10">
            <div className="container mx-auto px-4">

                {/* Intro Text */}
                <div className="max-w-4xl mx-auto mb-16 text-center md:text-left flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-academic-brown dark:text-academic-pink mb-6">
                            Sobre Mim
                        </h2>
                        <div className="space-y-4 text-academic-brown dark:text-academic-pink/90 leading-relaxed text-lg text-justify">
                            <p>
                                Minha jornada profissional e pessoal se entrelaça na interseção da educação, pesquisa e
                                cultura Hip Hop. Como <stromg className="font-bold text-academic-brown dark:text-academic-light">Doutor em Educação pela UFRJ</stromg>, dedico minha pesquisa e prática à distribuição equitativa de
                                oportunidades educacionais.
                            </p>
                            <p>
                                Acredito profundamente no potencial transformador do Hip Hop. Além de ser uma forma
                                de expressão artística como <strong className="font-bold text-academic-brown dark:text-academic-light">W-Black</strong>, para mim, o Hip Hop é uma poderosa ferramenta
                                pedagógica. Ele serve como ponte entre o conhecimento acadêmico e as vivências das periferias.
                            </p>
                            <p>
                                Seja na sala de aula, na rua, nas instituições públicas ou privadas, meu compromisso é com
                                a democratização do saber e a valorização de vozes marginalizadas.
                            </p>
                        </div>
                    </div>

                    <div className="w-full md:w-1/3 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-academic-gold rotate-3 rounded-lg opacity-20"></div>
                            <img
                                src="/apresentacao.JPG"
                                alt="William Melo em sala de aula"
                                className="relative rounded-lg shadow-xl w-full max-w-sm md:max-w-md h-auto object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Areas of Expertise Cards */}
                <h3 className="text-center font-serif text-2xl font-bold text-academic-brown dark:text-academic-pink mb-10">
                    Áreas de Atuação
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Pesquisa */}
                    <div className="bg-white dark:bg-academic-brown/30 p-8 rounded-xl border border-academic-gold/20 hover:border-academic-gold/60 transition-colors group">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6" />
                        </div>
                        <h4 className="font-serif text-xl font-bold text-academic-brown dark:text-academic-light mb-3">
                            Pesquisa
                        </h4>
                        <p className="text-academic-brown/80 dark:text-academic-pink/80 text-sm leading-relaxed">
                            Pesquisa sobre parentalidade, desigualdades raciais e inclusão. Foco em políticas públicas e programas educacionais, sob a ótica da Sociologia e Antropologia da Educação.
                        </p>
                    </div>

                    {/* Educação */}
                    <div className="bg-white dark:bg-academic-brown/30 p-8 rounded-xl border border-academic-gold/20 hover:border-academic-gold/60 transition-colors group">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h4 className="font-serif text-xl font-bold text-academic-brown dark:text-academic-light mb-3">
                            Educação
                        </h4>
                        <p className="text-academic-brown/80 dark:text-academic-pink/80 text-sm leading-relaxed">
                            Atuação implementando práticas pedagógicas que visam a distribuição equitativa de oportunidades. Metodologia "Ciência do Afeto" e "Educação com Evidências".
                        </p>
                    </div>

                    {/* Hip Hop */}
                    <div className="bg-white dark:bg-academic-brown/30 p-8 rounded-xl border border-academic-gold/20 hover:border-academic-gold/60 transition-colors group">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Mic className="w-6 h-6" />
                        </div>
                        <h4 className="font-serif text-xl font-bold text-academic-brown dark:text-academic-light mb-3">
                            Hip Hop (W-Black)
                        </h4>
                        <p className="text-academic-brown/80 dark:text-academic-pink/80 text-sm leading-relaxed">
                            Como W-Black, uso o Hip Hop como ferramenta de resistência e transformação social. Produção artística colada na atuação educacional, inspirando jovens da favela.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AboutSection;
