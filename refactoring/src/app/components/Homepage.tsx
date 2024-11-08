// src/app/components/HomePage.tsx
import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4" id="student-body">
      <h1 className="text-4xl font-bold">Página de Estudiantes</h1>
      <div id="login-form">
        <div className="session-container">
          <h2>Secciones Disponibles: Mapas</h2>
          <p>Seleccione el grupo asignado:</p>
          <label htmlFor="room-select">Sala de grupo:</label>
          <select id="room-select">
            <option selected disabled>Seleccione una sala...</option>
            <option>L1-1</option>
            <option>L1-2</option>
            <option>L2-1</option>
            <option>L2-2</option>
            <option>L2-3</option>
          </select>
          <br /><br />
          <button id="login-button" className="login-button">¡Ingresar!</button>
        </div>
        <div className="session-container">
          <h2>Repaso de Temas del Curso</h2>
          <p>Seleccione un tema para repasar:</p>
          <select id="lesson-picker">
            <option value="Lists">Listas</option>
            <option value="ForLoops">Ciclos For</option>
            <option value="Functions">Funciones</option>
            <option value="UnitTests">Pruebas Unitarias</option>
            <option value="AdvUnitTests">Pruebas Unitarias - Parte 2</option>
          </select>
          <br /><br />
          <button id="review-login-button" className="login-button">¡Repasar!</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
