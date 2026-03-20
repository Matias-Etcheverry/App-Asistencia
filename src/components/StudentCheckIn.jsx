import React, { useState, useEffect } from 'react';
import { Send, User, ChevronDown, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const StudentCheckIn = () => {
    const [name, setName] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedProfesor, setSelectedProfesor] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showWhatsappModal, setShowWhatsappModal] = useState(false);

    const whatsappLinks = {
        'Canto y Respirazon TIZON': 'https://chat.whatsapp.com/HbUARBxLvsA8nnXUMeimuV?mode=gi_t',
        'Vientos de Tarde': 'https://chat.whatsapp.com/FQzFMvHQ25R7SJ364X6HOm?mode=gi_t',
        'Coro Municipal': 'https://chat.whatsapp.com/Ki5oNt0Okwm78HckBLOTOP?mode=hqctqta'
    };

    const teacherData = {
        'Maria Clara': [
            'Danza Contemporánea',
            'Elongación Consciente'
        ],
        'Nahuel Muñoz Storni': [
            'Canto y Respirazon TIZON',
            'Vientos de Tarde',
            'Coro Municipal'
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
            // Check if it's the first time before inserting
            let isFirstTime = false;
            if (selectedProfesor === 'Nahuel Muñoz Storni' && whatsappLinks[selectedClass]) {
                const { count, error: countError } = await supabase
                    .from('asistencias')
                    .select('*', { count: 'exact', head: true })
                    .eq('nombre_alumno', name.trim())
                    .eq('clase', selectedClass)
                    .eq('profesor', selectedProfesor);
                
                if (!countError && count === 0) {
                    isFirstTime = true;
                }
            }

            const { error } = await supabase
                .from('asistencias')
                .insert([
                    { nombre_alumno: name.trim(), clase: selectedClass, profesor: selectedProfesor }
                ]);

            if (error) throw error;

            setMessage('¡Asistencia registrada con éxito! ✨');
            setName('');
            
            if (isFirstTime) {
                setShowWhatsappModal(true);
            }
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

            {showWhatsappModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl relative animate-fade-in-up">
                        <button 
                            onClick={() => setShowWhatsappModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="text-center mt-2">
                            <h3 className="text-xl font-bold text-text-main mb-2">¡Asistencia registrada!</h3>
                            <p className="text-slate-600 mb-6 text-sm">Unite al grupo de WhatsApp del taller para mantenerte al tanto de las novedades.</p>
                            <a 
                                href={whatsappLinks[selectedClass]} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full py-3 px-4 bg-[#25D366] text-white font-medium rounded-xl hover:bg-[#128C7E] transition-colors flex justify-center items-center gap-2"
                                onClick={() => setShowWhatsappModal(false)}
                            >
                                Unirme al Grupo
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCheckIn;
