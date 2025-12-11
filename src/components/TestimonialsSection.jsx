import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Quote } from 'lucide-react';

const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const { data, error } = await supabase
                    .from('testimonials')
                    .select('*')
                    .eq('active', true)
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }

                setTestimonials(data || []);
            } catch (err) {
                console.error('Error fetching testimonials:', err);
                setError('Não foi possível carregar os depoimentos no momento.');
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    if (loading) {
        return (
            <section className="py-20 bg-academic-gold/10 dark:bg-academic-dark relative overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-8 bg-gray-300 dark:bg-gray-700 w-64 mb-8 rounded"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Se não houver depoimentos e não estiver carregando, não mostrar nada (ou mostrar mensagem)
    if (!loading && testimonials.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-academic-gold/10 dark:bg-academic-dark relative overflow-hidden transition-colors duration-300">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center mb-12">
                    <div className="w-16 h-1 bg-academic-gold mb-6 rounded-full"></div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-academic-brown dark:text-academic-light mb-4">
                        Redes profissionais e afetivas
                    </h2>
                    <p className="max-w-2xl text-center text-lg text-academic-brown/80 dark:text-academic-light/80">
                        Relatos de quem caminhou ou caminha comigo nas encruzilhadas educacionais
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {testimonials.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-academic-brown/40 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-academic-gold/20 flex flex-col"
                        >
                            <div className="mb-6 text-academic-gold">
                                <Quote size={40} className="opacity-50" />
                            </div>

                            <p className="flex-grow text-academic-brown dark:text-gray-200 mb-8 italic leading-relaxed text-lg">
                                "{item.content}"
                            </p>

                            <div className="flex items-center gap-6 mt-auto">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-academic-gold shadow-md"
                                    />
                                ) : (
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-academic-gold/20 flex items-center justify-center text-academic-brown dark:text-academic-gold font-bold text-3xl border-4 border-academic-gold shadow-md">
                                        {item.name.charAt(0)}
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-bold text-xl text-academic-brown dark:text-academic-light">
                                        {item.name}
                                    </h4>
                                    {item.role && (
                                        <p className="text-sm font-medium text-academic-brown/70 dark:text-academic-light/60 uppercase tracking-wide">
                                            {item.role}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
