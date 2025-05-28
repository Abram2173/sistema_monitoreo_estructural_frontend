import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ReportList = ({ token }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comment, setComment] = useState({}); // Estado para los comentarios de cada reporte

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Obteniendo reportes con token:', token);
            const response = await axios.get('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/reports', {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000,
            });
            console.log('Reportes recibidos:', response.data);
            setReports(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error al obtener los reportes:', err.response?.data || err.message);
            setError(err.response?.data?.detail || 'Error al cargar los reportes');
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchReports();
        } else {
            setError('No se proporcionó un token de autenticación');
            setLoading(false);
        }
    }, [token, fetchReports]);

    const handleRefresh = () => {
        fetchReports();
    };

    const handleAction = async (reportId, status) => {
        try {
            const commentText = comment[reportId] || '';
            console.log(`Enviando acción para reporte ${reportId}: ${status}, Comentario: ${commentText}`);
            const response = await axios.put(
                `https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/reports/${reportId}`,
                {
                    status: status,
                    recommendations: commentText || null
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }
            );
            console.log('Reporte actualizado:', response.data);
            // Actualizar el estado local
            setReports(reports.map(report =>
                report.id === reportId
                    ? { ...report, status: status, recommendations: commentText || null }
                    : report
            ));
            // Limpiar el comentario después de enviar
            setComment(prev => ({ ...prev, [reportId]: '' }));
        } catch (err) {
            console.error('Error al actualizar el reporte:', err.response?.data || err.message);
            setError(err.response?.data?.detail || 'Error al actualizar el reporte');
        }
    };

    const handleCommentChange = (reportId, value) => {
        setComment(prev => ({ ...prev, [reportId]: value }));
    };

    if (loading) {
        return <div className="text-center p-4">Cargando reportes...</div>;
    }

    if (error) {
        return (
            <div className="text-center p-4">
                <p className="text-rojo mb-4">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="bg-azul-secundario text-blanco px-4 py-2 rounded hover:bg-azul-secundario/80 transition"
                >
                    Intentar de Nuevo
                </button>
            </div>
        );
    }

    return (
        <div className="bg-blanco p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Lista de Reportes</h2>
                <button
                    onClick={handleRefresh}
                    className="bg-azul-secundario text-blanco px-4 py-2 rounded hover:bg-azul-secundario/80 transition"
                >
                    Actualizar
                </button>
            </div>
            {reports.length === 0 ? (
                <p className="text-gray-500">No hay reportes disponibles.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                        <thead>
                            <tr className="bg-gris-muyClaro text-gris-oscuro">
                                <th className="p-3 text-left text-base font-bold border-b border-gris-borde">ID</th>
                                <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Inspector</th>
                                <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Ubicación</th>
                                <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Riesgo</th>
                                <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Estado</th>
                                <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Comentario</th>
                                <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, index) => (
                                <tr
                                    key={report.id}
                                    className={`border-b border-gris-borde ${index % 2 === 0 ? 'bg-blanco' : 'bg-gris-muyClaro'} hover:bg-gris-medio transition`}
                                >
                                    <td className="p-3 text-gris-oscuro text-sm">{report.id}</td>
                                    <td className="p-3 text-gris-oscuro text-sm">{report.inspector_name}</td>
                                    <td className="p-3 text-gris-oscuro text-sm">{report.location}</td>
                                    <td className="p-3 text-gris-oscuro text-sm">{report.risk_level}</td>
                                    <td className="p-3">
                                        <span
                                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize
                                                ${report.status === 'Pendiente' ? 'bg-azulPendiente text-azul-secondary' : ''}
                                                ${report.status === 'Aprobado' ? 'bg-verdeAprobado text-verde' : ''}
                                                ${report.status === 'Rechazado' ? 'bg-rojoRechazado text-rojo' : ''}`}
                                        >
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gris-oscuro text-sm">
                                        {report.status === 'Pendiente' ? (
                                            <textarea
                                                value={comment[report.id] || ''}
                                                onChange={(e) => handleCommentChange(report.id, e.target.value)}
                                                placeholder="Añade un comentario (opcional)"
                                                className="w-full p-2 border rounded"
                                                rows="2"
                                            />
                                        ) : (
                                            report.recommendations || 'Sin comentario'
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {report.status === 'Pendiente' ? (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleAction(report.id, 'Aprobado')}
                                                    className="bg-verde text-blanco px-3 py-1 rounded hover:bg-verde/80 transition"
                                                >
                                                    Aprobar
                                                </button>
                                                <button
                                                    onClick={() => handleAction(report.id, 'Rechazado')}
                                                    className="bg-rojo text-blanco px-3 py-1 rounded hover:bg-rojo/80 transition"
                                                >
                                                    Rechazar
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gris-oscuro">Acción completada</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ReportList;