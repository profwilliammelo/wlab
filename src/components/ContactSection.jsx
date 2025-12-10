import React from 'react';
import { Mail, MapPin, MessageCircle } from 'lucide-react';

const ContactSection = () => {
    return (
        <section className="py-20 bg-academic-dark text-academic-light relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-academic-gold/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-academic-pink/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-4 relative z-10 text-center">

                <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-academic-gold to-academic-pink">
                    CHAMA O WILL!
                </h2>

                <p className="text-xl text-academic-light/80 max-w-2xl mx-auto mb-12">
                    Vamos conversar? Estou sempre aberto a diálogos, parcerias e colaborações que promovam educação e cultura.
                </p>

                <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">

                    <a href="mailto:williamcorrea95@gmail.com" className="flex items-center gap-4 group">
                        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-academic-gold group-hover:text-academic-dark transition-all duration-300">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <span className="block text-xs uppercase tracking-wider text-academic-light/50">Email</span>
                            <span className="text-lg font-medium group-hover:text-academic-gold transition-colors">williamcorrea95@gmail.com</span>
                        </div>
                    </a>

                    <div className="flex items-center gap-4 group">
                        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <span className="block text-xs uppercase tracking-wider text-academic-light/50">Localização</span>
                            <span className="text-lg font-medium">Rio de Janeiro, Brasil</span>
                        </div>
                    </div>

                </div>

                <div className="mt-16">
                    <a
                        href="https://wa.me/5521936189048"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-academic-gold to-academic-pink text-academic-dark font-bold text-lg hover:scale-105 hover:shadow-lg hover:shadow-academic-gold/20 transition-all duration-300"
                    >
                        <MessageCircle className="w-6 h-6" />
                        Chamar no WhatsApp
                    </a>
                </div>

            </div>
        </section>
    );
};

export default ContactSection;
