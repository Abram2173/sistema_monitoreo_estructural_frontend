import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaShieldAlt, FaShieldVirus, FaUserShield } from 'react-icons/fa'; // Agregar FaShieldVirus y FaUserShield

const UserForm = ({ token }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('inspector');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post(
        'http://127.0.0.1:8000/api/admin/users', // Cambia esto a la URL de Heroku en producción
        { username, name, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Usuario registrado exitosamente');
      setUsername('');
      setName('');
      setEmail('');
      setPassword('');
      setRole('inspector');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar usuario');
      setSuccess('');
    }
  };

  return (
    <div>
      {error && <p className="text-rojo mb-4 flex items-center"><FaShieldVirus className="mr-2" /> {error}</p>}
      {success && <p className="text-verde mb-4 flex items-center"><FaShieldAlt className="mr-2" /> {success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex items-center">
          <FaUser className="text-azul-secondary mr-3" />
          <div className="flex-1">
            <label className="block text-gris-oscuro mb-2 text-base font-medium" htmlFor="username">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2.5 border border-gris-borde rounded focus:outline-none focus:ring-2 focus:ring-azul-secondary text-gris-oscuro text-sm"
              required
            />
          </div>
        </div>
        <div className="mb-4 flex items-center">
          <FaUser className="text-azul-secondary mr-3" />
          <div className="flex-1">
            <label className="block text-gris-oscuro mb-2 text-base font-medium" htmlFor="name">
              Nombre Completo
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border border-gris-borde rounded focus:outline-none focus:ring-2 focus:ring-azul-secondary text-gris-oscuro text-sm"
              required
            />
          </div>
        </div>
        <div className="mb-4 flex items-center">
          <FaEnvelope className="text-azul-secondary mr-3" />
          <div className="flex-1">
            <label className="block text-gris-oscuro mb-2 text-base font-medium" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-gris-borde rounded focus:outline-none focus:ring-2 focus:ring-azul-secondary text-gris-oscuro text-sm"
              required
            />
          </div>
        </div>
        <div className="mb-4 flex items-center">
          <FaLock className="text-azul-secondary mr-3" />
          <div className="flex-1">
            <label className="block text-gris-oscuro mb-2 text-base font-medium" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 border border-gris-borde rounded focus:outline-none focus:ring-2 focus:ring-azul-secondary text-gris-oscuro text-sm"
              required
            />
          </div>
        </div>
        <div className="mb-4 flex items-center">
          <FaShieldAlt className="text-azul-secondary mr-3" />
          <div className="flex-1">
            <label className="block text-gris-oscuro mb-2 text-base font-medium" htmlFor="role">
              Rol
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 border border-gris-borde rounded focus:outline-none focus:ring-2 focus:ring-azul-secondary text-gris-oscuro text-sm appearance-none bg-[url('data:image/svg+xml;utf8,<svg fill=%27%23374151%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/><path d=%27M0 0h24v24H0z%27 fill=%27none%27/></svg>')] bg-no-repeat bg-[right_8px_center]"
            >
              <option value="inspector">Inspector</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-azul-secondary text-blanco p-3 rounded hover:bg-azul-secondary/80 transition text-base font-medium flex items-center justify-center"
        >
          <FaUserShield className="mr-2" />
          Registrar
        </button>
      </form>
    </div>
  );
};

export default UserForm;