import React, { useContext, useState, useEffect } from 'react';
import Home from './components/Home';
import GamesGallery from './components/GamesGallery';
import { ThemeContext } from './context/ThemeContext';

function App() {
  const { isDark } = useContext(ThemeContext);
  const [currentView, setCurrentView] = useState('home');

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.view) {
        setCurrentView(event.state.view);
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view) => {
    window.history.pushState({ view }, '', view === 'home' ? '/' : `#${view}`);
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-academic-dark text-academic-light' : 'bg-academic-light text-academic-dark'} font-sans selection:bg-academic-gold/30 selection:text-academic-dark`}>
      {currentView === 'home' ? (
        <Home onNavigate={navigateTo} />
      ) : currentView === 'games' ? (
        <GamesGallery onBack={() => navigateTo('home')} />
      ) : (
        <Home onNavigate={navigateTo} />
      )}
    </div>
  );
}

export default App;
