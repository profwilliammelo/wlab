import React, { useContext } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ProjectsSection from './components/ProjectsSection';
import BibliographySection from './components/BibliographySection';
import TimelineSection from './components/TimelineSection';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import CarouselSection from './components/CarouselSection';
import { ThemeContext } from './context/ThemeContext';
import { ArrowDown } from 'lucide-react';

function App() {
  const { isDark } = useContext(ThemeContext);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-academic-dark text-academic-light' : 'bg-academic-light text-academic-dark'} font-sans selection:bg-academic-gold/30 selection:text-academic-dark`}>

      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 flex flex-col items-center justify-center min-h-screen text-center overflow-hidden">
        {/* Background Texture/Gradient */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-academic-gold blur-[128px] rounded-full"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-academic-pink blur-[128px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-academic-gold rotate-6 rounded-full opacity-20 transform scale-105"></div>
            <img
              src="/will.jpg"
              alt="William Melo"
              className="w-40 h-40 md:w-56 md:h-56 rounded-full object-cover border-4 border-academic-gold shadow-2xl relative z-10"
            />
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 tracking-tight leading-tight">
            <span className="block text-academic-brown dark:text-academic-light">William Melo</span>
            <span className="block text-2xl md:text-3xl mt-2 font-light italic text-academic-brown dark:text-academic-accent opacity-80">
              (W-Black)
            </span>
          </h1>

          <p className="font-sans text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10 text-academic-brown dark:text-academic-light/80">
            Doutor em Educação, Pesquisador, Professor e Artista. <br />
            Unindo a <strong className="text-academic-brown dark:text-academic-light font-bold">ciência</strong>, a <strong className="text-academic-brown dark:text-academic-light font-bold">arte</strong> e a <strong className="text-academic-brown dark:text-academic-light font-bold">vivência</strong> para construir pontes e promover equidade social através da educação com evidências e da cultura Hip Hop.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="#projects"
              className="px-8 py-3 rounded-full bg-academic-dark dark:bg-academic-light text-academic-light dark:text-academic-dark font-medium hover:scale-105 transition-transform shadow-lg border border-transparent"
            >
              Ver Projetos
            </a>
            <a
              href="#contact"
              className="px-8 py-3 rounded-full border border-academic-dark dark:border-academic-light text-academic-dark dark:text-academic-light font-medium hover:bg-academic-dark/5 dark:hover:bg-academic-light/10 transition-colors"
            >
              Entrar em Contato
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-50 text-academic-brown dark:text-academic-light">
          <ArrowDown size={32} />
        </div>
      </section>

      {/* About Section */}
      <div id="about">
        <AboutSection />
      </div>

      {/* Timeline Section */}
      <div id="timeline">
        <TimelineSection />
      </div>

      {/* Carousel Section */}
      <div id="gallery">
        <CarouselSection />
      </div>

      {/* Projects Section */}
      <div id="projects">
        <ProjectsSection />
      </div>

      {/* Bibliography Section */}
      <div id="bibliography">
        <BibliographySection />
      </div>

      {/* Contact Section */}
      <div id="contact">
        <ContactSection />
      </div>

      <Footer />
    </div>
  );
}

export default App;
