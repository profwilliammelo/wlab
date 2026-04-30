import React, { useContext, useState, useEffect } from 'react';
import Home from './components/Home';
import GamesGallery from './components/GamesGallery';
import ItemDetailPage from './components/ItemDetailPage';
import ExuMode from './components/ExuMode';
import { ThemeContext } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const { isDark } = useContext(ThemeContext);
  // currentView pode ser: 'home' | 'games' | 'exu' | { view: 'item', type, id }
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.view) {
        setCurrentView(event.state.view === 'item'
          ? { view: 'item', type: event.state.type, id: event.state.id }
          : event.state.view
        );
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Verificar URL inicial
    const hash = window.location.hash;
    const itemMatch = hash.match(/^#item-(project|bibliography)-(\d+)$/);
    if (window.location.pathname === '/exu' || hash === '#exu') {
      setCurrentView('exu');
    } else if (itemMatch) {
      setCurrentView({ view: 'item', type: itemMatch[1], id: parseInt(itemMatch[2]) });
    } else if (hash === '#games') {
      setCurrentView('games');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view, params = null) => {
    if (view === 'item' && params) {
      const stateObj = { view: 'item', type: params.type, id: params.id };
      window.history.pushState(stateObj, '', `#item-${params.type}-${params.id}`);
      setCurrentView({ view: 'item', type: params.type, id: params.id });
    } else if (view === 'exu') {
      window.history.pushState({ view: 'exu' }, '', '/exu');
      setCurrentView('exu');
    } else {
      window.history.pushState({ view }, '', view === 'home' ? '/' : `#${view}`);
      setCurrentView(view);
    }
    window.scrollTo(0, 0);
  };

  const goHome = () => navigateTo('home');

  const viewName = typeof currentView === 'object' ? currentView.view : currentView;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark
      ? 'dark bg-academic-dark text-academic-light'
      : 'bg-academic-light text-academic-dark'
      } font-sans selection:bg-academic-gold/30 selection:text-academic-dark`}>

      {viewName === 'home' && <Home onNavigate={navigateTo} />}
      {viewName === 'games' && <GamesGallery onBack={goHome} />}
      {viewName === 'exu' && <ExuMode onBack={goHome} />}
      {viewName === 'item' && (
        <div>
          {/* Header mínimo para páginas de detalhe */}
          <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-academic-light/90 dark:bg-academic-dark/95 border-b border-academic-gold/20">
            <div className="container mx-auto px-4 h-16 flex items-center gap-3">
              <button
                onClick={goHome}
                className="flex items-center gap-2 text-academic-brown dark:text-academic-pink hover:text-academic-gold transition text-sm font-medium"
              >
                ← Prof. William Melo
              </button>
            </div>
          </header>
          <ItemDetailPage
            itemType={currentView.type}
            itemId={currentView.id}
            onBack={goHome}
          />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
