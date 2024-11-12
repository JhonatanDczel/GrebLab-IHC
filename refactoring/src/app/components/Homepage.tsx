import React, { useState } from 'react';
import CodeEditor from './CodeEditor';
import { Titles, type TitleValues } from '../constants/activities';
import '../globals.css'

const HomePage: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<TitleValues>(Titles.MAPS);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [score, setScore] = useState(0);

  const rooms = ['L1-1', 'L1-2', 'L2-1', 'L2-2', 'L2-3'];
  const topics = [
    { value: Titles.ARRAYS, label: 'Listas' },
    { value: Titles.FOR_LOOP, label: 'Ciclos For' },
    { value: Titles.FUNCTIONS, label: 'Funciones' },
    { value: Titles.UNIT_TESTING, label: 'Pruebas Unitarias' },
    { value: Titles.ADVANCED_UNIT_TESTING, label: 'Pruebas Unitarias - Parte 2' },
    { value: Titles.MAPS, label: 'Mapas' }
  ] as const;

  const handleLogin = () => {
    if (selectedRoom) {
      setIsLoggedIn(true);
    }
  };

  const handleTopicChange = (newTopic: TitleValues) => {
    setSelectedTopic(newTopic);
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Página de Estudiantes</h1>
      
      {!isLoggedIn ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg shadow-md">
            <h2 className="text-2xl mb-4">Secciones Disponibles: Mapas</h2>
            <p className="mb-4">Seleccione el grupo asignado:</p>
            <label htmlFor="room-select" className="block mb-2">Sala de grupo:</label>
            <select 
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="" disabled>Seleccione una sala...</option>
              {rooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
            <button 
              onClick={handleLogin}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              ¡Ingresar!
            </button>
          </div>

          <div className="p-6 border rounded-lg shadow-md">
            <h2 className="text-2xl mb-4">Repaso de Temas del Curso</h2>
            <p className="mb-4">Seleccione un tema para repasar:</p>
            <select 
              value={selectedTopic}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                setSelectedTopic(e.target.value as TitleValues)}
              className="w-full p-2 mb-4 border rounded"
            >
              {topics.map(topic => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
            <button 
              onClick={handleLogin}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              ¡Repasar!
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl">
              Tema: {topics.find(t => t.value === selectedTopic)?.label}
            </h2>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cerrar Sesión
            </button>
          </div>
          <div className="border rounded-lg p-6 shadow-md">
            <CodeEditor 
              selectedTopic={selectedTopic} 
              onTopicChange={handleTopicChange}
              onScoreUpdate={handleScoreUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default HomePage;
