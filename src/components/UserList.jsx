// src/components/UserList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserList = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: 'inspector',
    name: '',
    password: ''
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users with token:', token ? token.substring(0, 20) + '...' : 'No token'); // Depuración parcial
        const response = await axios.get('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        console.log('Users fetched:', response.data); // Depuración
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err.response?.data || err.message, 'Status:', err.response?.status); // Depuración
        setError(err.response?.data?.detail || 'Error al cargar los usuarios. Verifica tu token o permisos como administrador.');
      }
    };
    if (token) fetchUsers(); // Asegurar que el token exista
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const validateUser = async () => {
    try {
      const checkUsername = await axios.get(
        `https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/admin/users/check?username=${newUser.username}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const checkEmail = await axios.get(
        `https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/admin/users/check?email=${newUser.email}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (checkUsername.data.exists || checkEmail.data.exists) {
        setError('El username o email ya están en uso');
        return false;
      }
      return true;
    } catch (err) {
      setError('Error al validar los datos del usuario');
      return false;
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (await validateUser()) {
      try {
        const response = await axios.post('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/admin/users', newUser, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers([...users, response.data.user]);
        setNewUser({ username: '', email: '', role: 'inspector', name: '', password: '' });
        setShowForm(false);
        alert('Usuario creado exitosamente');
      } catch (err) {
        console.error('Error creating user:', err.response?.data || err.message, 'Status:', err.response?.status); // Depuración
        setError(err.response?.data?.detail || 'Error al crear el usuario');
      }
    }
  };

  const handleCancel = () => {
    setNewUser({ username: '', email: '', role: 'inspector', name: '', password: '' });
    setShowForm(false);
  };

  const handleDelete = async (username) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${username}?`)) {
      try {
        await axios.delete(`https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/admin/users/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter(user => user.username !== username));
        alert(`Usuario ${username} eliminado exitosamente`);
      } catch (err) {
        console.error('Error deleting user:', err.response?.data || err.message, 'Status:', err.response?.status); // Depuración
        setError(err.response?.data?.detail || 'Error al eliminar el usuario');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Lista de Usuarios</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {/* Botón para mostrar/ocultar el formulario */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition mb-4"
      >
        {showForm ? 'Ocultar Formulario' : 'Crear Nuevo Usuario'}
      </button>

      {/* Formulario para crear usuarios */}
      {showForm && (
        <form onSubmit={handleCreateUser} className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Rol</label>
            <select
              name="role"
              value={newUser.role}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="inspector">Inspector</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Aceptar
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de usuarios */}
      {!error && users.length === 0 ? (
        <p className="text-gray-500">No hay usuarios disponibles.</p>
      ) : (
        !error && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="p-3 text-left text-base font-bold border-b border-gray-300">Username</th>
                  <th className="p-3 text-left text-base font-bold border-b border-gray-300">Nombre</th>
                  <th className="p-3 text-left text-base font-bold border-b border-gray-300">Email</th>
                  <th className="p-3 text-left text-base font-bold border-b border-gray-300">Rol</th>
                  <th className="p-3 text-left text-base font-bold border-b border-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.username}
                    className={`border-b border-gray-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}
                  >
                    <td className="p-3 text-gray-700 text-sm">{user.username}</td>
                    <td className="p-3 text-gray-700 text-sm">{user.name}</td>
                    <td className="p-3 text-gray-700 text-sm">{user.email}</td>
                    <td className="p-3 text-gray-700 text-sm">{user.role}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(user.username)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex items-center"
                      >
                        <svg
                          stroke="currentColor"
                          viewBox="0 0 24 19"
                          fill="none"
                          className="h-5 w-5 mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          ></path>
                        </svg>
                        Eliminar cuenta
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default UserList;