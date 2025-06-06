import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ReportList = ({ token }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comment, setComment] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const BASE_URL = 'https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com';

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Obteniendo reportes con token:', token);
            const response = await axios.get(`${BASE_URL}/api/reports`, {
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
                `${BASE_URL}/api/reports/${reportId}`,
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
            setReports(reports.map(report =>
                report.id === reportId
                    ? { ...report, status: status, recommendations: commentText || null }
                    : report
            ));
            setComment(prev => ({ ...prev, [reportId]: '' }));
        } catch (err) {
            console.error('Error al actualizar el reporte:', err.response?.data || err.message);
            setError(err.response?.data?.detail || 'Error al actualizar el reporte');
        }
    };

    const handleCommentChange = (reportId, value) => {
        setComment(prev => ({ ...prev, [reportId]: value }));
    };

    const handleDownloadImage = async (imageUrl, reportId, imageNumber) => {
        try {
            const response = await fetch(`${imageUrl}?download=true`);
            if (!response.ok) {
                throw new Error('Error al descargar la imagen');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_${reportId}_imagen${imageNumber}.jpg`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error al descargar la imagen:', err);
            alert('No se pudo descargar la imagen');
        }
    };

    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
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
                                <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Comentario del Inspector</th>
                                <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Imagen 1</th>
                                <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Imagen 2</th>
                                <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Recomendaciones del Supervisor</th>
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
                                        {report.comments || 'Sin comentario'}
                                    </td>
                                    <td className="p-3 text-gris-oscuro text-sm">
                                        {report.image_path_1 ? (
                                            <div className="flex flex-col items-center">
                                                <img
                                                    src={`${BASE_URL}${report.image_path_1}`}
                                                    alt="Reporte Imagen 1"
                                                    className="max-w-[150px] max-h-[150px] rounded object-cover mb-2 cursor-pointer"
                                                    onClick={() => openImageModal(`${BASE_URL}${report.image_path_1}`)}
                                                    onError={() => console.error(`Error loading image 1: ${BASE_URL}${report.image_path_1}`)}
                                                />
                                                <button
                                                    onClick={() => handleDownloadImage(`${BASE_URL}${report.image_path_1}`, report.id, 1)}
                                                    className="bg-azul-secundario text-blanco px-3 py-1 rounded hover:bg-azul-secundario/80 transition text-xs"
                                                >
                                                    Descargar Imagen 1
                                                </button>
                                            </div>
                                        ) : (
                                            'Sin imagen 1'
                                        )}
                                    </td>
                                    <td className="p-3 text-gris-oscuro text-sm">
                                        {report.image_path_2 ? (
                                            <div className="flex flex-col items-center">
                                                <img
                                                    src={`${BASE_URL}${report.image_path_2}`}
                                                    alt="Reporte Imagen 2"
                                                    className="max-w-[150px] max-h-[150px] rounded object-cover mb-2 cursor-pointer"
                                                    onClick={() => openImageModal(`${BASE_URL}${report.image_path_2}`)}
                                                    onError={() => console.error(`Error loading image 2: ${BASE_URL}${report.image_path_2}`)}
                                                />
                                                <button
                                                    onClick={() => handleDownloadImage(`${BASE_URL}${report.image_path_2}`, report.id, 2)}
                                                    className="bg-azul-secundario text-blanco px-3 py-1 rounded hover:bg-azul-secundario/80 transition text-xs"
                                                >
                                                    Descargar Imagen 2
                                                </button>
                                            </div>
                                        ) : (
                                            'Sin imagen 2'
                                        )}
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
                                            report.recommendations || 'Sin recomendaciones'
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

            {/* Modal para la imagen ampliada */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="relative max-w-3xl max-h-[90vh] p-4">
                        <img
                            src={selectedImage}
                            alt="Reporte Ampliado"
                            className="max-w-full max-h-[80vh] object-contain rounded"
                        />
                        <button
                            onClick={closeImageModal}
                            className="absolute top-4 right-4 bg-rojo text-blanco px-4 py-2 rounded hover:bg-rojo/80 transition"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportList;