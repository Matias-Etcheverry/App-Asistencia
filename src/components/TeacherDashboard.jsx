import React, { useState, useEffect } from 'react';
import { Download, RefreshCcw, Users, QrCode, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import { QRCodeCanvas } from 'qrcode.react';

const TeacherDashboard = () => {
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQRModal, setShowQRModal] = useState(false);

    const fetchAttendances = async () => {
        setLoading(true);
        try {
            // Get today's start and end boundaries
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const { data, error } = await supabase
                .from('asistencias')
                .select('*')
                .gte('created_at', today.toISOString())
                .lt('created_at', tomorrow.toISOString())
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Supabase fetch error:", error);
                throw error;
            }
            if (data) {
                setAttendances(data);
            } else {
                setAttendances([]);
            }
        } catch (error) {
            console.error('Error fetching attendances:', error);
            // Don't crash the app, safely set an empty array
            setAttendances([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendances();

        // Subscribe to real-time additions (optional but great for real-time requirement)
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'asistencias' },
                (payload) => {
                    setAttendances((current) => [payload.new, ...current]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const exportToExcel = async () => {
        try {
            // 1. Fetch ALL attendances for the current month to build the matrix
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(endOfMonth.getMonth() + 1);

            const { data: monthAttendances, error } = await supabase
                .from('asistencias')
                .select('*')
                .gte('created_at', startOfMonth.toISOString())
                .lt('created_at', endOfMonth.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (!monthAttendances || monthAttendances.length === 0) {
                return alert('No hay registros este mes para exportar.');
            }

            // 2. Build the matrix structure
            // We need all unique dates and all unique students
            const uniqueDates = [...new Set(monthAttendances.map(a => new Date(a.created_at).toLocaleDateString()))].sort((a, b) => new Date(a) - new Date(b));
            const uniqueStudents = [...new Set(monthAttendances.map(a => a.nombre_alumno))].sort();

            // 3. Create rows
            const worksheetData = uniqueStudents.map(studentName => {
                const row = { 'Alumno': studentName };
                // Also get the main class/professor for context if needed, taking the first known
                const studentRecords = monthAttendances.filter(a => a.nombre_alumno === studentName);
                row['Clase'] = studentRecords[0]?.clase || '-';

                // Initialize all dates as Absent (-)
                uniqueDates.forEach(date => {
                    row[date] = '-';
                });

                // Mark Present (P)
                studentRecords.forEach(record => {
                    const recordDate = new Date(record.created_at).toLocaleDateString();
                    row[recordDate] = 'P';
                });

                return row;
            });

            // 4. Generate Excel
            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();

            // Set column widths for better readability
            const colWidths = [
                { wch: 30 }, // Alumno
                { wch: 25 }, // Clase
                ...uniqueDates.map(() => ({ wch: 12 })) // Dates
            ];
            worksheet['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencias Mensuales');

            const monthName = startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
            XLSX.writeFile(workbook, `Asistencias_${monthName}.xlsx`);

        } catch (error) {
            console.error('Error generating Excel:', error);
            alert('Hubo un error al generar el archivo Excel.');
        }
    };

    const downloadQR = () => {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) return;

        const pngUrl = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream');

        let downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'QR_Asistencia.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-8 glass rounded-2xl relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-main flex items-center gap-3 tracking-tight">
                        <Users size={24} className="text-accent" /> Panel Administrativo
                    </h2>
                    <p className="text-text-muted text-sm mt-1">Asistencias registradas el día de hoy</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={fetchAttendances}
                        className="p-2.5 bg-surface border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors text-text-muted hover:text-text-main flex-shrink-0"
                        title="Actualizar lista"
                    >
                        <RefreshCcw size={18} className={loading ? 'animate-spin cursor-wait' : ''} />
                    </button>

                    <button
                        onClick={() => setShowQRModal(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-surface border border-slate-200 hover:bg-slate-50 text-text-main font-medium py-2.5 px-4 rounded-lg transition-all shadow-sm focus:ring-2 focus:ring-accent/50 focus:outline-none text-sm"
                    >
                        <QrCode size={16} /> Crear QR
                    </button>

                    <button
                        onClick={exportToExcel}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium py-2.5 px-5 rounded-lg transition-all shadow-sm focus:ring-2 focus:ring-accent/50 focus:outline-none text-sm"
                    >
                        <Download size={16} /> Exportar Excel
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl bg-surface border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-text-muted bg-slate-50/50 border-b border-slate-200">
                            <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">Hora</th>
                            <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">Alumno</th>
                            <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">Clase</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {attendances.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-text-muted font-medium text-sm">
                                    Nadie se ha registrado todavía hoy.
                                </td>
                            </tr>
                        ) : (
                            attendances.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">
                                        {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 text-text-main font-semibold flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                            {record.nombre_alumno.charAt(0).toUpperCase()}
                                        </div>
                                        {record.nombre_alumno}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-muted">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 font-medium text-xs">
                                            {record.clase}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* QR Generator Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="font-bold text-text-main flex items-center gap-2">
                                <QrCode size={18} className="text-accent" />
                                Generador de QR
                            </h3>
                            <button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col items-center print-qr-container">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
                                <QRCodeCanvas
                                    id="qr-canvas"
                                    value={`${window.location.origin}/?checkin=true`}
                                    size={300}
                                    level="H"
                                    imageSettings={{
                                        src: "/bailarina_nueva.png",
                                        x: undefined,
                                        y: undefined,
                                        height: 60,
                                        width: 60,
                                        excavate: true,
                                    }}
                                />
                            </div>

                            <p className="text-xl font-bold bg-white px-6 py-2 rounded-full border border-slate-200 text-slate-800 text-center mt-2 print:text-2xl print:border-transparent print:bg-transparent">
                                Escanea para Asistencia
                            </p>

                            <p className="text-xs text-text-muted text-center mt-4 print-hide">
                                Descarga e imprime este único QR. Los alumnos lo escanearán para elegir su clase y registrarse.
                            </p>

                            <button
                                onClick={downloadQR}
                                className="mt-6 w-full py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors text-sm shadow-md print-hide flex items-center justify-center gap-2"
                            >
                                <Download size={18} /> Descargar Código QR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
