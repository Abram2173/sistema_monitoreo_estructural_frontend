import React, { useState, useEffect, useCallback } from 'react'; // Eliminamos Suspense
import axios from 'axios';
import { FaSignOutAlt, FaChevronDown, FaChevronUp, FaSyncAlt, FaTrash } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import logo from '../assets/logo.png';
import UserList from './UserList'; // Importación estática

const useReports = (token) => {
    const [reports, setReports] = useState(JSON.parse(sessionStorage.getItem('admin_reports')) || []);
    const [error, setError] = useState('');

    const fetchReports = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh && reports.length > 0) return;
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

    const handleDeleteReport = async (reportId) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar el reporte ${reportId}?`)) return;
        try {
            await axios.delete(
                `https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/reports/${reportId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedReports = reports.filter(report => report.id !== reportId);
            setReports(updatedReports);
            sessionStorage.setItem('admin_reports', JSON.stringify(updatedReports));
            alert('Reporte eliminado exitosamente');
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al eliminar el reporte');
        }
    };

    return { reports, setReports, fetchReports, handleDeleteReport, error };
};

const useSupervisors = (token) => {
    const [supervisors, setSupervisors] = useState(JSON.parse(sessionStorage.getItem('admin_supervisors')) || []);
    const [error, setError] = useState('');

    const fetchSupervisors = useCallback(async () => {
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

    return { supervisors, fetchSupervisors, error };
};

const useAssignReport = (token, reports, setReports) => {
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedSupervisor, setSelectedSupervisor] = useState('');
    const [error, setError] = useState('');

    const handleAssignReport = async (reportId) => {
        if (!selectedSupervisor) {
            setError('Por favor selecciona un supervisor');
            return;
        }
        try {
            await axios.post(
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
            alert('Reporte asignado exitosamente');
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al asignar el reporte');
        }
    };

    return { selectedReport, setSelectedReport, selectedSupervisor, setSelectedSupervisor, handleAssignReport, error };
};

const useUsersStatus = (token) => {
    const [usersStatus, setUsersStatus] = useState([]);
    const [error, setError] = useState('');

    const fetchUsersStatus = useCallback(async () => {
        try {
            const response = await axios.get('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/users/status', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsersStatus(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cargar el estado de los usuarios');
        }
    }, [token]);

    return { usersStatus, fetchUsersStatus, error };
};

const AdminDashboard = ({ token, onLogout, role }) => {
    const { reports, setReports, fetchReports, handleDeleteReport, error: reportsError } = useReports(token);
    const { supervisors, fetchSupervisors, error: supervisorsError } = useSupervisors(token);
    const { selectedReport, setSelectedReport, selectedSupervisor, setSelectedSupervisor, handleAssignReport, error: assignError } = useAssignReport(token, reports, setReports);
    const { usersStatus, fetchUsersStatus, error: usersStatusError } = useUsersStatus(token);
    const [loading, setLoading] = useState(true);
    const [expandedReport, setExpandedReport] = useState(null);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [currentView, setCurrentView] = useState('gestion');

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

    useEffect(() => {
        if (currentView === 'usuarios') {
            fetchUsersStatus();
        }
    }, [currentView, fetchUsersStatus]);

    const handleRefreshSupervisors = async () => {
        setLoading(true);
        await fetchSupervisors();
        setLoading(false);
    };

    const toggleReportDetails = (reportId) => {
        setExpandedReport(expandedReport === reportId ? null : reportId);
    };

    if (role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
                    <p className="text-red-500">No tienes permiso para acceder a este panel.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            {loading ? (
                <div className="min-h-screen flex items-center justify-center">Cargando datos...</div>
            ) : (
                <>
                    <nav className="bg-black text-white p-4 shadow-md flex justify-between items-center">
                        <div className="flex items-center">
                            <img src={logo} alt="Logo Sistema de Monitoreo Estructural" className="h-40 mr-10" />
                            <h1 className="text-xl font-bold">Panel de Administrador</h1>
                        </div>
                        <button
                            onClick={onLogout}
                            className="flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition md:mt-0 mt-4"
                            aria-label="Cerrar Sesión"
                        >
                            <FaSignOutAlt className="mr-2" />
                            Cerrar Sesión
                        </button>
                    </nav>

                    <div className="p-6">
                        <div className="flex justify-center space-x-4 mb-6">
                            <button
                                onClick={() => setCurrentView('gestion')}
                                className={`px-4 py-2 rounded font-medium transition ${
                                    currentView === 'gestion' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Gestión de Usuarios
                            </button>
                            <button
                                onClick={() => setCurrentView('reportes')}
                                className={`px-4 py-2 rounded font-medium transition ${
                                    currentView === 'reportes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Visualizar Reportes
                            </button>
                            <button
                                onClick={() => setCurrentView('asignacion')}
                                className={`px-4 py-2 rounded font-medium transition ${
                                    currentView === 'asignacion' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Asignar Reportes
                            </button>
                            <button
                                onClick={() => setCurrentView('usuarios')}
                                className={`px-4 py-2 rounded font-medium transition ${
                                    currentView === 'usuarios' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Estado de Usuarios
                            </button>
                        </div>

                        {currentView === 'gestion' && (
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    Gestión de Usuarios
                                </h2>
                                <UserList token={token} />
                            </div>
                        )}

                        {currentView === 'reportes' && (
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                        Visualizar Reportes
                                    </h2>
                                    <button
                                        onClick={() => fetchReports(true)}
                                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                        aria-label="Cargar Reportes"
                                    >
                                        <FaSyncAlt className="mr-2" />
                                        Cargar
                                    </button>
                                </div>
                                {reportsError && <p className="text-red-500 mb-4">{reportsError}</p>}
                                {!reportsError && reports.length === 0 ? (
                                    <p className="text-gray-500">No hay reportes disponibles.</p>
                                ) : (
                                    !reportsError && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                                                <thead>
                                                    <tr className="bg-gray-200 text-gray-700">
                                                        <th className="p-3 text-left text-base font-bold border-b border-gray-300">ID</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gray-300">Inspector</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gray-300">Ubicación</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gray-300">Riesgo</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gray-300">Estado</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gray-300">Supervisor Asignado</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gray-300">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reports.map((report, index) => (
                                                        <React.Fragment key={report.id}>
                                                            <tr
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
                                                                    {report.assigned_supervisor || 'No asignado'}
                                                                </td>
                                                                <td className="p-3">
                                                                    <button
                                                                        onClick={() => toggleReportDetails(report.id)}
                                                                        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm font-medium transition mr-2"
                                                                        aria-label={expandedReport === report.id ? 'Ocultar Detalles' : 'Ver Detalles'}
                                                                    >
                                                                        {expandedReport === report.id ? <FaChevronUp /> : <FaChevronDown />}
                                                                        {expandedReport === report.id ? 'Ocultar Detalles' : 'Ver Detalles'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteReport(report.id)}
                                                                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm font-medium transition mr-2"
                                                                        aria-label="Eliminar Reporte"
                                                                    >
                                                                        <FaTrash className="inline mr-1" />
                                                                        Eliminar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            const doc = new jsPDF();
                                                                            const img = new Image();
                                                                            img.src = logo;
                                                                            doc.addImage(img, 'PNG', 10, 10, 50, 20);
                                                                            doc.text(`ID: ${report.id}`, 10, 40);
                                                                            doc.text(`Inspector: ${report.inspector_name}`, 10, 50);
                                                                            doc.text(`Ubicación: ${report.location}`, 10, 60);
                                                                            doc.text(`Riesgo: ${report.risk_level}`, 10, 70);
                                                                            doc.text(`Estado: ${report.status}`, 10, 80);
                                                                            doc.text(`Supervisor: ${report.assigned_supervisor || 'No asignado'}`, 10, 90);
                                                                            doc.text("Detalles:", 10, 100);
                                                                            doc.text(`Descripción: ${report.description}`, 10, 110);
                                                                            doc.text("Medidas:", 10, 120);
                                                                            doc.text(`- Deformación: ${report.measurements.deformacion} mm`, 10, 130);
                                                                            doc.text(`- Temperatura: ${report.measurements.temperatura} °C`, 10, 140);
                                                                            doc.text(`- Vibración: ${report.measurements.vibracion} mm/s`, 10, 150);
                                                                            doc.text(`Comentarios: ${report.comments || 'Sin comentarios'}`, 10, 160);
                                                                            doc.text(`Recomendaciones: ${report.recommendations || 'Sin recomendaciones'}`, 10, 170);
                                                                            doc.text(`Fecha: ${new Date(report.created_at).toLocaleString()}`, 10, 180);
                                                                            doc.save(`reporte_${report.id}.pdf`);
                                                                        }}
                                                                        className="bg-red-400 text-white px-2 py-1 rounded hover:bg-red-500 text-sm font-medium transition"
                                                                        aria-label="Descargar PDF"
                                                                    >
                                                                        Descargar PDF
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                            {expandedReport === report.id && (
                                                                <tr className="bg-gray-100">
                                                                    <td colSpan="7" className="p-4">
                                                                        <div className="border rounded-lg p-4 bg-white">
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
                        )}

                        {currentView === 'asignacion' && (
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                        Asignar Reportes a Supervisores
                                    </h2>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => fetchReports(true)}
                                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                            aria-label="Cargar Reportes"
                                        >
                                            <FaSyncAlt className="mr-2" />
                                            Cargar Reportes
                                        </button>
                                        <button
                                            onClick={handleRefreshSupervisors}
                                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                            aria-label="Actualizar Supervisores"
                                        >
                                            <FaSyncAlt className="mr-2" />
                                            Actualizar Supervisores
                                        </button>
                                    </div>
                                </div>
                                {supervisorsError && <p className="text-red-500 mb-4">{supervisorsError}</p>}
                                {assignError && <p className="text-red-500 mb-4">{assignError}</p>}
                                {!reportsError && reports.length === 0 ? (
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
                                                    <th className="p-3 text-left text-base font-bold border-b border-gray-300">Supervisor Asignado</th>
                                                    <th className="p-3 text-left text-base font-bold border-b border-gray-300">Acciones</th>
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
                                                            {report.assigned_supervisor || 'No asignado'}
                                                        </td>
                                                        <td className="p-3">
                                                            <button
                                                                onClick={() => setSelectedReport(report.id)}
                                                                className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm font-medium transition mr-2"
                                                                aria-label="Asignar Reporte"
                                                            >
                                                                Asignar
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteReport(report.id)}
                                                                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm font-medium transition"
                                                                aria-label="Eliminar Reporte"
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
                                            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                                                <h3 className="text-lg font-bold mb-2">Asignar Reporte {selectedReport}</h3>
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 mb-1">Supervisor</label>
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
                                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                                                    aria-label="Asignar Reporte"
                                                >
                                                    Asignar Reporte
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedReport(null); setSelectedSupervisor(''); }}
                                                    className="ml-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                                                    aria-label="Cancelar Asignación"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {currentView === 'usuarios' && (
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                        Estado de Usuarios
                                    </h2>
                                    <button
                                        onClick={fetchUsersStatus}
                                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                        aria-label="Actualizar Estado de Usuarios"
                                    >
                                        <FaSyncAlt className="mr-2" />
                                        Actualizar
                                    </button>
                                </div>
                                {usersStatusError && <p className="text-red-500 mb-4">{usersStatusError}</p>}
                                {!usersStatusError && usersStatus.length === 0 ? (
                                    <p className="text-gray-500">No hay usuarios disponibles.</p>
                                ) : (
                                    !usersStatusError && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                                                <thead>
                                                    <tr className="bg-gray-200 text-gray-700">
                                                        <th className="p-3 text-left text-base font-bold border-b border-gray-300">Usuario</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gray-300">Rol</th>
                                                        <th className="p-3 text-left text-base font-bold border-b border-gray-300">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {usersStatus.map((user, index) => (
                                                        <tr
                                                            key={user.username}
                                                            className={`border-b border-gray-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}
                                                        >
                                                            <td className="p-3 text-gray-700 text-sm">{user.username}</td>
                                                            <td className="p-3 text-gray-700 text-sm">{user.role}</td>
                                                            <td className="p-3">
                                                                <span
                                                                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize
                                                                        ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                                >
                                                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;