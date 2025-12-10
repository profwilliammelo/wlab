import React, { useState } from 'react';
import { MapPin, GraduationCap, Mic2, ScrollText, ChevronDown, ChevronUp } from 'lucide-react';

const timelineEvents = [
    {
        id: 1,
        year: 'Patrimônio',
        title: 'Morro dos Macacos',
        subtitle: 'O Início',
        description: 'Aqui tudo começa no Rio de Janeiro. Minhas percepções sobre equidade começaram a ser construídas muito antes de estudar sobre isso, vivenciando a realidade do território.',
        icon: MapPin,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-100 dark:bg-emerald-900/20'
    },
    {
        id: 2,
        year: 'Formação',
        title: 'Graduação e Mestrado',
        subtitle: 'UFRJ',
        description: 'Concluí a Graduação em Biologia e o Mestrado em Educação na UFRJ. Foi onde comecei a fazer pesquisa educacional focada na relação entre família e escola.',
        icon: GraduationCap,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
        id: 3,
        year: 'Arte',
        title: 'W-Black',
        subtitle: 'Hip Hop e Cultura',
        description: 'Entre a academia e a pesquisa, o Hip Hop sempre esteve presente. Como artista W-Black, uso a música como ferramenta de expressão, resistência e pedagogia, conectando a teoria à prática das ruas.',
        icon: Mic2,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
        id: 4,
        year: 'Doutorado',
        title: 'Doutor em Educação',
        subtitle: 'UFRJ',
        description: 'Pesquisa sobre parentalidade na educação infantil, com estudo de abordagem mista em escola no centro do Rio. Destaquei o efeito positivo de programas de parentalidade na linguagem de crianças.',
        icon: ScrollText,
        color: 'text-academic-gold',
        bg: 'bg-academic-gold/10'
    }
];

const TimelineSection = () => {
    const [activeId, setActiveId] = useState(null);

    const toggleEvent = (id) => {
        setActiveId(activeId === id ? null : id);
    };

    return (
        <section className="py-20 bg-white dark:bg-academic-dark transition-colors relative overflow-hidden">
            {/* Decorative background line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-academic-gold/30 to-transparent hidden md:block"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl md:text-5xl font-bold text-academic-dark dark:text-academic-light mb-4">
                        Minha Jornada
                    </h2>
                    <p className="text-academic-brown/70 dark:text-academic-pink/70 max-w-2xl mx-auto italic">
                        Do Morro dos Macacos à UFRJ, costurando saberes entre ciência, arte e rua.
                    </p>
                </div>

                <div className="flex flex-col gap-12">
                    {timelineEvents.map((event, index) => {
                        const Icon = event.icon;
                        const isLeft = index % 2 === 0;
                        const isOpen = activeId === event.id;

                        return (
                            <div
                                key={event.id}
                                className={`flex flex-col md:flex-row items-center gap-8 ${isLeft ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Content Side */}
                                <div className="flex-1 w-full md:w-auto group">
                                    <div
                                        className={`
                        relative bg-white dark:bg-academic-brown/20 p-6 rounded-2xl border-l-4 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1
                        ${isOpen ? 'border-academic-gold ring-1 ring-academic-gold/30' : 'border-gray-200 dark:border-gray-700 hover:border-academic-gold/50'}
                      `}
                                        onClick={() => toggleEvent(event.id)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-sm font-bold uppercase tracking-wider ${event.color}`}>
                                                {event.year}
                                            </span>
                                            {isOpen ? <ChevronUp size={20} className="text-academic-brown dark:text-academic-pink/50" /> : <ChevronDown size={20} className="text-academic-brown dark:text-academic-pink/50" />}
                                        </div>

                                        <h3 className="font-serif text-2xl font-bold text-academic-dark dark:text-academic-light mb-1">
                                            {event.title}
                                        </h3>
                                        <p className="text-sm font-medium text-academic-brown/80 dark:text-academic-pink/80 mb-3">
                                            {event.subtitle}
                                        </p>

                                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                            <p className="text-academic-brown dark:text-academic-light/90 leading-relaxed text-sm md:text-base border-t border-academic-gold/10 pt-4">
                                                {event.description}
                                            </p>
                                        </div>

                                        {!isOpen && (
                                            <p className="text-xs text-academic-brown/40 dark:text-academic-pink/40 mt-2 italic">
                                                Clique para saber mais
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Center Icon */}
                                <div className="relative flex items-center justify-center shrink-0">
                                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 border-white dark:border-academic-dark shadow-xl z-10 ${event.bg} ${event.color}`}>
                                        <Icon className="w-6 h-6 md:w-8 md:h-8" />
                                    </div>
                                    {/* Connector line for mobile */}
                                    {index !== timelineEvents.length - 1 && (
                                        <div className="absolute top-14 bottom-[-48px] w-0.5 bg-academic-gold/20 md:hidden"></div>
                                    )}
                                </div>

                                {/* Empty Side for Desktop alignment */}
                                <div className="flex-1 hidden md:block"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default TimelineSection;
