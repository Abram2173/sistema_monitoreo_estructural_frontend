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
        const response = await axios.get('https://sistema-monitoreo-backend.herokuapp.com/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Error al cargar los usuarios');
      }
    };
    fetchUsers();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://sistema-monitoreo-backend.herokuapp.com/api/admin/users', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers([...users, response.data]);
      setNewUser({ username: '', email: '', role: 'inspector', name: '', password: '' });
      setShowForm(false);
      alert('Usuario creado exitosamente');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear el usuario');
    }
  };

  const handleCancel = () => {
    setNewUser({ username: '', email: '', role: 'inspector', name: '', password: '' });
    setShowForm(false);
  };

  const handleDelete = async (username) => {
    if (!username || username.toLowerCase() === "null") {
      setError("ID de usuario no válido");
      return;
    }
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${username}?`)) {
      try {
        await axios.delete(`https://sistema-monitoreo-backend.herokuapp.com/api/admin/users/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter(user => user.username !== username));
        alert(`Usuario ${username} eliminado exitosamente`);
      } catch (err) {
        setError(err.response?.data?.detail || 'Error al eliminar el usuario');
      }
    }
  };

  return (
    <div className="bg-blanco p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Lista de Usuarios</h2>
      {error && <p className="text-rojo mb-4">{error}</p>}
      
      {/* Botón para mostrar/ocultar el formulario */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-verde text-blanco px-4 py-2 rounded hover:bg-verde/80 transition mb-4"
      >
        {showForm ? 'Ocultar Formulario' : 'Crear Nuevo Usuario'}
      </button>

      {/* Formulario para crear usuarios */}
      {showForm && (
        <form onSubmit={handleCreateUser} className="mb-6 p-4 border rounded-lg bg-gris-muyClaro">
          <div className="mb-4">
            <label className="block text-gris-oscuro mb-1">Username</label>
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
            <label className="block text-gris-oscuro mb-1">Email</label>
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
            <label className="block text-gris-oscuro mb-1">Nombre</label>
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
            <label className="block text-gris-oscuro mb-1">Rol</label>
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
            <label className="block text-gris-oscuro mb-1">Contraseña</label>
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
              className="bg-verde text-blanco px-4 py-2 rounded hover:bg-azul/80 transition"
            >
              Aceptar
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-rojo text-blanco px-4 py-2 rounded hover:bg-rojo/80 transition"
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
                <tr className="bg-gris-muyClaro text-gris-oscuro">
                  <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Username</th>
                  <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Nombre</th>
                  <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Email</th>
                  <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Rol</th>
                  <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.username}
                    className={`border-b border-gris-borde ${index % 2 === 0 ? 'bg-blanco' : 'bg-gris-muyClaro'} hover:bg-gris-medio transition`}
                  >
                    <td className="p-3 text-gris-oscuro text-sm">{user.username}</td>
                    <td className="p-3 text-gris-oscuro text-sm">{user.name}</td>
                    <td className="p-3 text-gris-oscuro text-sm">{user.email}</td>
                    <td className="p-3 text-gris-oscuro text-sm">{user.role}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(user.username)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 transition ease-in-out delay-75 hover:bg-red-700 text-white text-sm font-medium rounded-md hover:-translate-y-1 hover:scale-110"
                      >
                        <svg
                          stroke="currentColor"
                          viewBox="0 0 24 24"
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