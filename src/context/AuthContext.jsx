import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (currentSession) => {
    if (!currentSession) {
      setIsAdmin(false);
      return;
    }
    try {
      // Verificar via função RPC is_admin() que roda server-side com SECURITY DEFINER
      const { data, error } = await supabase.rpc('is_admin');
      if (error) {
        setIsAdmin(false);
        return;
      }
      setIsAdmin(data === true);
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Sessão inicial
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      checkAdmin(s).finally(() => setLoading(false));
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      checkAdmin(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
