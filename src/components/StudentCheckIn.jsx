import React, { useState, useEffect } from 'react';
import { Send, User, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

const StudentCheckIn = () => {
    const [name, setName] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedProfesor, setSelectedProfesor] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const teacherData = {
        'Maria Clara': [
            'Danza Contemporánea',
            'Elongación Consciente'
        ],
        'Nahuel Muñoz Storni': [
            'Canto'
        ]
    };

    const profesores = Object.keys(teacherData);
    const classes = selectedProfesor ? teacherData[selectedProfesor] : [];

    // Read URL parameters on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const classNameFromUrl = params.get('clase');
        if (classNameFromUrl && classes.includes(classNameFromUrl)) {
            setSelectedClass(classNameFromUrl);
        }
    }, []);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!name.trim() || !selectedClass || !selectedProfesor) return;

        setLoading(true);
        setMessage('');

        try {
            const { error } = await supabase
                .from('asistencias')
                .insert([
                    { nombre_alumno: name, clase: selectedClass, profesor: selectedProfesor }
                ]);

            if (error) throw error;

            setMessage('¡Asistencia registrada con éxito! ✨');
            setName('');
            // Optional: reset class if we want, or keep it for the next person
        } catch (error) {
            console.error('Error in CheckIn:', error);
            setMessage('Hubo un error al registrar la asistencia. Intenta de nuevo.');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 md:p-8 glass rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent via-blue-400 to-accent"></div>

            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-text-main tracking-tight mb-2">Check-in</h2>
                <p className="text-sm text-text-muted">Bienvenido/a a tu clase de hoy</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main flex items-center gap-2">
                        <User size={16} /> Nombre y Apellido
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-sm text-text-main"
                        placeholder="Ej. Ana Pérez"
                    />
                </div>

                <div className="space-y-2 relative">
                    <label className="text-sm font-medium text-text-main">Clase</label>
                    <div className="relative">
                        <select
                            required
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-sm appearance-none text-text-main"
                        >
                            <option value="" disabled>Selecciona tu clase...</option>
                            {classes.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>

                <div className="space-y-2 relative">
                    <label className="text-sm font-medium text-text-main">Profesor</label>
                    <div className="relative">
                        <select
                            required
                            value={selectedProfesor}
                            onChange={(e) => setSelectedProfesor(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-sm appearance-none text-text-main"
                        >
                            <option value="" disabled>Selecciona a tu profesor...</option>
                            {profesores.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-accent text-white font-medium tracking-wide shadow-md hover:shadow-lg hover:bg-accent-hover transition-all flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Registrando...' : 'Confirmar Asistencia'}
                    {!loading && <Send size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
            </form>

            {message && (
                <div className={`mt-6 p-4 rounded-xl text-center text-sm font-medium transition-all ${message.includes('éxito')
                    ? 'bg-green-100/80 text-green-800 border border-green-200/50'
                    : 'bg-red-100/80 text-red-800 border border-red-200/50'
                    }`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default StudentCheckIn;
