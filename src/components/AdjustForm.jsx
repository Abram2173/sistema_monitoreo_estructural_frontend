import React from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';

const AdjustForm = ({ report, onSave, onCancel, status, setStatus, recommendations, setRecommendations }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(report.id);
  };

  return (
    <div className="bg-blanco p-6 rounded-lg shadow-md mt-4 border border-gris-borde">
      <h2 className="text-xl font-bold text-gris-oscuro mb-4">Ajustar Reporte</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gris-oscuro mb-2 text-base font-medium" htmlFor="status">
            Estado
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2.5 border border-gris-borde rounded focus:outline-none focus:ring-2 focus:ring-azul-secondary text-gris-oscuro text-sm appearance-none bg-[url('data:image/svg+xml;utf8,<svg fill=%27%23374151%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/><path d=%27M0 0h24v24H0z%27 fill=%27none%27/></svg>')] bg-no-repeat bg-[right_8px_center]"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gris-oscuro mb-2 text-base font-medium" htmlFor="recommendations">
            Recomendaciones
          </label>
          <textarea
            id="recommendations"
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            className="w-full p-2.5 border border-gris-borde rounded focus:outline-none focus:ring-2 focus:ring-azul-secondary text-gris-oscuro text-sm min-h-[120px] resize-y"
            placeholder="Recomendaciones o notas adicionales"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex items-center bg-azul-secondary text-blanco px-4 py-2 rounded hover:bg-azul-secondary/80 transition text-base font-medium"
          >
            <FaSave className="mr-2" />
            Guardar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center bg-gris-oscuro text-blanco px-4 py-2 rounded hover:bg-gris-oscuro/80 transition text-base font-medium"
          >
            <FaTimes className="mr-2" />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdjustForm;