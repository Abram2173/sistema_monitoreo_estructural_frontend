/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
theme: {
    extend: {
      colors: {
        azul: {
          primary: '#1E3A8A',   // Azul primario
          secondary: '#3B82F6', // Azul secundario
        },
        gris: {
          claro: '#F3F4F6',    // Gris claro
          oscuro: '#374151',   // Gris oscuro
          muyClaro: '#F9FAFB', // Gris muy claro (filas alternas)
          medio: '#E5E7EB',    // Gris medio (hover)
          borde: '#D1D5DB',    // Gris para bordes
        },
        verde: '#10B981',      // Verde
        rojo: '#EF4444',       // Rojo
        blanco: '#FFFFFF',     // Blanco
        negro: '#111827',      // Negro
        azulPendiente: '#DBEAFE', // Fondo badge pendiente
        verdeAprobado: '#D1FAE5', // Fondo badge aprobado
        rojoRechazado: '#FEE2E2', // Fondo badge rechazado
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}