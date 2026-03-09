import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react';

const AdminLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Success! We reload the page to ensure App.jsx catches the session properly
            // and the TeacherDashboard loads without blank screen issues.
            if (onLoginSuccess) onLoginSuccess();
            window.location.reload();

        } catch (error) {
            console.error('Error in login:', error);
            setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 glass rounded-2xl relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent via-blue-400 to-accent"></div>

            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent/20">
                    <Lock size={28} className="text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-text-main tracking-tight">Acceso Restringido</h2>
                <p className="text-sm text-text-muted mt-2">Ingresa tus credenciales de administrador para continuar.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-main">Correo Electrónico</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={16} className="text-slate-400" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm text-text-main placeholder-slate-400"
                            placeholder="admin@ejemplo.com"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-main">Contraseña</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={16} className="text-slate-400" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm text-text-main placeholder-slate-400"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 mt-2 rounded-xl bg-accent text-white font-medium shadow-md hover:shadow-lg hover:bg-accent-hover transition-all flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Autenticando...
                        </span>
                    ) : (
                        <>
                            Iniciar Sesión
                            <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <p className="text-xs text-center text-text-muted mt-6">
                El acceso a este portal está estrictamente monitorizado.
            </p>
        </div>
    );
};

export default AdminLogin;
