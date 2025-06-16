// src/components/ReportList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';

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
      console.log('Fetch reports - Token recibido en ReportList:', token);
      const username = sessionStorage.getItem('username') || 'supervisor3@gmail.com';
      const response = await axios.get(`${BASE_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { assigned_supervisor: username },
        timeout: 10000,
      });
      console.log('Reportes recibidos:', response.data);
      setReports(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener los reportes:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Error al cargar los reportes. Verifica tu token.');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchReports();
  }, [token, fetchReports]);

  const handleRefresh = () => {
    if (token) fetchReports();
  };

  const handleAction = async (reportId, status) => {
    try {
      const commentText = comment[reportId] || '';
      console.log(`Enviando acción para reporte ${reportId}: ${status}, Comentario: ${commentText}`);
      const response = await axios.put(
        `${BASE_URL}/api/reports/${reportId}`,
        {
          status: status,
          recommendations: commentText || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
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
      const response = await fetch(`${imageUrl}?download=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al descargar la imagen');
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

  const handleAnalyze = async (reportId, imageUrl) => {
    try {
      if (!token) {
        console.error('Token no disponible en handleAnalyze');
        setError('Token no disponible. Por favor, inicia sesión de nuevo.');
        return;
      }
      const fullImageUrl = `${BASE_URL}${imageUrl}`;
      console.log('Enviando solicitud de análisis con URL:', fullImageUrl, 'y encabezados:', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
      const response = await axios.post(
        `${BASE_URL}/api/analyze_images`,
        { image_urls: [fullImageUrl] },
        {
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          },
          timeout: 10000,
        }
      );
      const { evaluation, has_crack } = response.data;
      setReports(reports.map(report =>
        report.id === reportId ? { ...report, evaluation, has_crack } : report
      ));
      await axios.put(
        `${BASE_URL}/api/reports/${reportId}`,
        { evaluation, has_crack },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Análisis completado:', { evaluation, has_crack });
    } catch (err) {
      console.error('Error al analizar imagen:', err.response?.data || err.message);
      setError(`Error al analizar la imagen: ${err.response?.data?.detail || err.message}`);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Cargando reportes...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Intentar de Nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Reportes</h2>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
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
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-3 text-left text-base font-bold border-b border-gray-300">ID</th>
                <th className="p-3 text-left text-base font-bold border-b border-gray-300">Inspector</th>
                <th className="p-3 text-left text-base font-bold border-b border-gray-300">Ubicación</th>
                <th className="p-3 text-left text-base font-bold border-b border-gray-300">Riesgo</th>
                <th className="p-3 text-left text-base font-bold border-b border-gray-300">Estado</th>
                <th className="p-3 text-left text-base font-bold border-b border-gray-300">Comentario del Inspector</th>
                <th className="p-3 text-left text-base font-bold border-b border-gray-300">Imagen 1</th>
                <th className="p-3 text-left text-base font-bold border-b border-gray-300">Imagen 2</th>
                <th className="p-3 text-left text-base font-bold border-b border-gray-300">Recomendaciones del Supervisor</th>
                <th className="p-3 text-left text-base font-bold border-b border-gray-300">Acciones</th>
                <th className="p-3 text-left text-base font-bold border-b border-gray-300">Análisis IA</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr
                  key={report.id}
                  className={`border-b border-gray-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}
                >
                  <td className="p-3 text-gray-700 text-sm">{report.id}</td>
                  <td className="p-3 text-gray-700 text-sm">{report.inspector_name}</td>
                  <td className="p-3 text-gray-700 text-sm">{report.location}</td>
                  <td className="p-3 text-gray-700 text-sm">{report.risk_level}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize
                        ${report.status === 'Pendiente' ? 'bg-blue-100 text-blue-800' : ''}
                        ${report.status === 'Aprobado' ? 'bg-green-100 text-green-800' : ''}
                        ${report.status === 'Rechazado' ? 'bg-red-100 text-red-800' : ''}`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700 text-sm">
                    {report.comments || 'Sin comentario'}
                  </td>
                  <td className="p-3 text-gray-700 text-sm">
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
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-xs"
                        >
                          Descargar Imagen 1
                        </button>
                      </div>
                    ) : (
                      'Sin imagen 1'
                    )}
                  </td>
                  <td className="p-3 text-gray-700 text-sm">
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
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-xs"
                        >
                          Descargar Imagen 2
                        </button>
                      </div>
                    ) : (
                      'Sin imagen 2'
                    )}
                  </td>
                  <td className="p-3 text-gray-700 text-sm">
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
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleAction(report.id, 'Rechazado')}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => {
                            const doc = new jsPDF();
                            doc.text(`ID: ${report.id}`, 10, 10);
                            doc.text(`Inspector: ${report.inspector_name}`, 10, 20);
                            doc.text(`Ubicación: ${report.location}`, 10, 30);
                            doc.text(`Riesgo: ${report.risk_level}`, 10, 40);
                            doc.text(`Estado: ${report.status}`, 10, 50);
                            doc.text(`Comentarios: ${report.comments || 'Sin comentario'}`, 10, 60);
                            doc.text(`Recomendaciones: ${report.recommendations || 'Sin recomendaciones'}`, 10, 70);
                            doc.text(`Análisis IA: ${report.evaluation || 'Sin análisis'}`, 10, 80);
                            doc.save(`reporte_${report.id}.pdf`);
                          }}
                          className="bg-red-400 text-white px-3 py-1 rounded hover:bg-red-500 transition"
                        >
                          Descargar PDF
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-700">Acción completada</span>
                    )}
                  </td>
                  <td className="p-3">
                    {report.evaluation ? (
                      <>
                        <p>{report.evaluation}</p>
                        <p>Riesgo: {report.has_crack ? 'Sí' : 'No'}</p>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAnalyze(report.id, report.image_path_1 || report.image_path_2)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                        disabled={!report.image_path_1 && !report.image_path_2}
                      >
                        Analizar con IA
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
              className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
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