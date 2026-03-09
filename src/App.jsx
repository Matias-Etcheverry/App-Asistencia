import React, { useState, useEffect } from 'react';
import StudentCheckIn from './components/StudentCheckIn';
import TeacherDashboard from './components/TeacherDashboard';
import AdminLogin from './components/AdminLogin';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState(null);
  const [isCheckinRoute, setIsCheckinRoute] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check URL parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkin') === 'true' || params.get('clase')) {
      setIsCheckinRoute(true);
    }

    // 2. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session fetch:", session ? "LOGGED IN" : "NO SESSION");
      setSession(session);
      setLoading(false);
    });

    // 3. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event triggered:", event, "Session exists:", !!session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Determine what to render
  const renderContent = () => {
    if (loading) return <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div></div>;

    // Always show checkin if accessed via QR, regardless of auth
    if (isCheckinRoute) return <StudentCheckIn />;

    // If not a student route, show dashboard IF logged in, else login screen
    if (session) return <TeacherDashboard />;

    return <AdminLogin />;
  };

  return (
    <div className="min-h-screen relative font-sans text-text-main bg-bg-primary overflow-x-hidden selection:bg-accent selection:text-white">
      {/* Dynamic Background - Professional Abstract Minimal */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="px-6 py-5 flex justify-between items-center max-w-7xl mx-auto w-full border-b border-slate-200/50 bg-surface/50 backdrop-blur-md">
          <h1 className="text-xl font-bold tracking-tight text-accent-dark flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm opacity-90">CA</div>
            Control de Asistencia
          </h1>

          {session && !isCheckinRoute && (
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm font-medium text-text-muted hover:text-red-500 transition-colors cursor-pointer"
            >
              Cerrar Sesión
            </button>
          )}
        </header>

        <main className="flex-1 flex flex-col justify-center p-4 sm:p-8">
          <div className="w-full max-w-7xl mx-auto animate-fade-in-up">
            {renderContent()}
          </div>
        </main>

        <footer className="p-6 text-center text-xs font-medium text-text-muted">
          Sistema de Asistencia &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

export default App;
