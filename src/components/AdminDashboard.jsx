import React, { useState, useEffect, useCallback, Suspense } from 'react';
import axios from 'axios';
import { FaSignOutAlt, FaChevronDown, FaChevronUp, FaSyncAlt, FaTrash } from 'react-icons/fa';
import logo from '../assets/logo.png';

const UserList = React.lazy(() => import('./UserList'));

const AdminDashboard = ({ token, onLogout, role }) => {
    const [reports, setReports] = useState(JSON.parse(sessionStorage.getItem('admin_reports')) || []);
    const [supervisors, setSupervisors] = useState(JSON.parse(sessionStorage.getItem('admin_supervisors')) || []);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedSupervisor, setSelectedSupervisor] = useState('');
    const [expandedReport, setExpandedReport] = useState(null);
    const [isDataFetched, setIsDataFetched] = useState(false);

    const fetchReports = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh && reports.length > 0) {
            return;
        }
        try {
            const response = await axios.get('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/reports', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReports(response.data);
            sessionStorage.setItem('admin_reports', JSON.stringify(response.data));
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al cargar los reportes');
        }
    }, [token, reports.length]);

    const fetchSupervisors = useCallback(async (forceRefresh = false) => {
        try {
            const response = await axios.get('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/admin/supervisors', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSupervisors(response.data);
            sessionStorage.setItem('admin_supervisors', JSON.stringify(response.data));
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al cargar los supervisores');
        }
    }, [token]);

    useEffect(() => {
        if (role === 'admin' && !isDataFetched) {
            Promise.all([fetchReports(), fetchSupervisors()])
                .then(() => {
                    setLoading(false);
                    setIsDataFetched(true);
                })
                .catch(() => setLoading(false));
        }
    }, [role, fetchReports, fetchSupervisors, isDataFetched]);

    const handleAssignReport = async (reportId) => {
        if (!selectedSupervisor) {
            setError('Por favor selecciona un supervisor');
            return;
        }
        try {
            const response = await axios.post(
                'https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/admin/assign-report',
                { report_id: reportId, supervisor_username: selectedSupervisor },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedReports = reports.map(report =>
                report.id === reportId ? { ...report, assigned_supervisor: selectedSupervisor } : report
            );
            setReports(updatedReports);
            sessionStorage.setItem('admin_reports', JSON.stringify(updatedReports));
            setSelectedReport(null);
            setSelectedSupervisor('');
            alert(response.data.message);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al asignar el reporte');
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar el reporte ${reportId}?`)) {
            return;
        }
        try {
            const response = await axios.delete(
                `https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/reports/${reportId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedReports = reports.filter(report => report.id !== reportId);
            setReports(updatedReports);
            sessionStorage.setItem('admin_reports', JSON.stringify(updatedReports));
            alert(response.data.message);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al eliminar el reporte');
        }
    };

    const handleRefreshSupervisors = async () => {
        setLoading(true);
        setError('');
        await fetchSupervisors(true); // Forzar actualización de supervisores
        setLoading(false);
    };

    const toggleReportDetails = (reportId) => {
        setExpandedReport(expandedReport === reportId ? null : reportId);
    };

    if (role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gris-claro">
                <div className="bg-blanco p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gris-oscuro mb-4">Acceso Denegado</h2>
                    <p className="text-rojo">No tienes permiso para acceder a este panel.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gris-claro min-h-screen">
            {loading ? (
                <div className="min-h-screen flex items-center justify-center">Cargando datos...</div>
            ) : (
                <>
                    <nav className="bg-black text-blanco p-4 shadow-md flex justify-between items-center">
                        <div className="flex items-center">
                            <img src={logo} alt="Logo Sistema de Monitoreo Estructural" className="h-40 mr-10" />
                            <h1 className="text-xl font-bold">Panel de Administrador</h1>
                        </div>
                        <button
                            onClick={onLogout}
                            className="flex items-center bg-rojo text-blanco px-4 py-2 rounded hover:bg-rojo/80 transition"
                        >
                            <FaSignOutAlt className="mr-2" />
                            Cerrar Sesión
                        </button>
                    </nav>

                    <div className="p-6">
                        <div className="space-y-6">
                            <div className="bg-blanco p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-bold text-gris-oscuro mb-4 flex items-center">
                                    Gestión de Usuarios
                                </h2>
                                <Suspense fallback={<div>Cargando usuarios...</div>}>
                                    <UserList token={token} />
                                </Suspense>
                            </div>

                            <div className="bg-blanco p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gris-oscuro flex items-center">
                                        Visualizar Reportes
                                    </h2>
                                    <button
                                        onClick={() => fetchReports(true)}
                                        className="flex items-center bg-azul-secondary text-blanco px-4 py-2 rounded hover:bg-azul-secondary/80 transition"
                                    >
                                        <FaSyncAlt className="mr-2" />
                                        Cargar
                                    </button>
                                </div>
                                {error && <p className="text-rojo mb-4">{error}</p>}
                                {!error && reports.length === 0 ? (
                                    <p className="text-gray-500">No hay reportes disponibles.</p>
                                ) : (
                                    !error && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                                                <thead>
                                                    <tr className="bg-gris-muyClaro text-gris-oscuro">
                                                        <th className="p-3 text-left text-base font-bold border-b border-gris-borde">ID</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Inspector</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Ubicación</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Riesgo</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Estado</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Supervisor Asignado</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reports.map((report, index) => (
                                                        <React.Fragment key={report.id}>
                                                            <tr
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
                                                                    {report.assigned_supervisor || 'No asignado'}
                                                                </td>
                                                                <td className="p-3">
                                                                    <button
                                                                        onClick={() => toggleReportDetails(report.id)}
                                                                        className="bg-azul text-blanco px-2 py-1 rounded hover:bg-azul/80 text-sm font-medium transition mr-2"
                                                                    >
                                                                        {expandedReport === report.id ? <FaChevronUp /> : <FaChevronDown />}
                                                                        {expandedReport === report.id ? 'Ocultar Detalles' : 'Ver Detalles'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteReport(report.id)}
                                                                        className="bg-rojo text-blanco px-2 py-1 rounded hover:bg-rojo/80 text-sm font-medium transition"
                                                                    >
                                                                        <FaTrash className="inline mr-1" />
                                                                        Eliminar
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                            {expandedReport === report.id && (
                                                                <tr className="bg-gris-claro">
                                                                    <td colSpan="7" className="p-4">
                                                                        <div className="border rounded-lg p-4 bg-blanco">
                                                                            <h3 className="text-lg font-bold mb-2">Detalles del Reporte</h3>
                                                                            <p><strong>Descripción:</strong> {report.description}</p>
                                                                            <p><strong>Medidas:</strong></p>
                                                                            <ul className="list-disc pl-5">
                                                                                <li>Deformación: {report.measurements.deformacion} mm</li>
                                                                                <li>Temperatura: {report.measurements.temperatura} °C</li>
                                                                                <li>Vibración: {report.measurements.vibracion} mm/s</li>
                                                                            </ul>
                                                                            <p><strong>Comentarios:</strong> {report.comments || 'Sin comentarios'}</p>
                                                                            <p><strong>Recomendaciones:</strong> {report.recommendations || 'Sin recomendaciones'}</p>
                                                                            <p><strong>Fecha de Creación:</strong> {new Date(report.created_at).toLocaleString()}</p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="bg-blanco p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gris-oscuro flex items-center">
                                        Asignar Reportes a Supervisores
                                    </h2>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => fetchReports(true)}
                                            className="flex items-center bg-azul-secondary text-blanco px-4 py-2 rounded hover:bg-azul-secondary/80 transition"
                                        >
                                            <FaSyncAlt className="mr-2" />
                                            Cargar Reportes
                                        </button>
                                        <button
                                            onClick={handleRefreshSupervisors}
                                            className="flex items-center bg-azul-secondary text-blanco px-4 py-2 rounded hover:bg-azul-secondary/80 transition"
                                        >
                                            <FaSyncAlt className="mr-2" />
                                            Actualizar Supervisores
                                        </button>
                                    </div>
                                </div>
                                {error && <p className="text-rojo mb-4">{error}</p>}
                                {!error && reports.length === 0 ? (
                                    <p className="text-gray-500">No hay reportes disponibles.</p>
                                ) : (
                                    !error && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                                                <thead>
                                                    <tr className="bg-gris-muyClaro text-gris-oscuro">
                                                        <th className="p-3 text-left text-base font-bold border-b border-gris-borde">ID</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Inspector</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Ubicación</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Riesgo</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Estado</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Supervisor Asignado</th>
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
                                                                {report.assigned_supervisor || 'No asignado'}
                                                            </td>
                                                            <td className="p-3">
                                                                <button
                                                                    onClick={() => setSelectedReport(report.id)}
                                                                    className="bg-azul text-blanco px-2 py-1 rounded hover:bg-azul/80 text-sm font-medium transition mr-2"
                                                                >
                                                                    Asignar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteReport(report.id)}
                                                                    className="bg-rojo text-blanco px-2 py-1 rounded hover:bg-rojo/80 text-sm font-medium transition"
                                                                >
                                                                    <FaTrash className="inline mr-1" />
                                                                    Eliminar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {selectedReport && (
                                                <div className="mt-4 p-4 border rounded-lg bg-gris-muyClaro">
                                                    <h3 className="text-lg font-bold mb-2">Asignar Reporte {selectedReport}</h3>
                                                    <div className="mb-4">
                                                        <label className="block text-gris-oscuro mb-1">Supervisor</label>
                                                        <select
                                                            value={selectedSupervisor}
                                                            onChange={(e) => setSelectedSupervisor(e.target.value)}
                                                            className="w-full border rounded px-3 py-2"
                                                        >
                                                            <option value="">Selecciona un supervisor</option>
                                                            {supervisors.map(supervisor => (
                                                                <option key={supervisor.username} value={supervisor.username}>
                                                                    {supervisor.name} ({supervisor.username})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAssignReport(selectedReport)}
                                                        className="bg-verde text-blanco px-4 py-2 rounded hover:bg-verde/80 transition"
                                                    >
                                                        Asignar Reporte
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedReport(null); setSelectedSupervisor(''); }}
                                                        className="ml-2 bg-rojo text-blanco px-4 py-2 rounded hover:bg-rojo/80 transition"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;