import React, { useState } from 'react';
import ReportList from './ReportList';
import logo from '../assets/logo.png';
import { FaSignOutAlt, FaSyncAlt } from 'react-icons/fa';

const SupervisorDashboard = ({ token, onLogout }) => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <div className="bg-gris-claro min-h-screen">
            <nav className="bg-black text-blanco p-4 shadow-md flex justify-between items-center">
                <div className="flex items-center">
                    <img src={logo} alt="Logo Sistema de Monitoreo Estructural" className="h-40 mr-10" />
                    <h1 className="text-xl font-bold">Panel de Supervisor</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center bg-azul-secundario text-blanco px-4 py-2 rounded hover:bg-azul-secundario/80 transition"
                    >
                        <FaSyncAlt className="mr-2" />
                        Actualizar
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center bg-rojo text-blanco px-4 py-2 rounded hover:bg-rojo/80 transition"
                    >
                        <FaSignOutAlt className="mr-2" />
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <div className="p-6">
                <ReportList token={token} key={refreshKey} />
            </div>
        </div>
    );
};

export default SupervisorDashboard;