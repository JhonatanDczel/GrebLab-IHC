// src/app/components/LoginForm.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image'; // Importa el componente Image de Next.js

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push('/homepage'); // Redirigir a la página principal después del inicio de sesión
  };

  return (
    <div className="login-container">
      <h1>Inicio de Sesión</h1>
      <div className="role-selection">
        <div className="role-option">
          <div className="role-icon">
            <Image src="/images/alumno.png" alt="Alumno" width={100} height={100} />
          </div>
          <p>Alumno</p>
        </div>
        <div className="role-option">
          <div className="role-icon">
            <Image src="/images/maestro.png" alt="Maestro" width={100} height={100} />
          </div>
          <p>Maestro</p>
        </div>
      </div>
      <form id="loginForm" className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          id="email"
          placeholder="Correo electrónico"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          id="password"
          placeholder="Contraseña"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="login-button">Iniciar sesión</button>
        <button type="button" className="login-button">Cancelar</button>
      </form>
      <a href="#" className="link">Registrar / Recuperar contraseña</a>
    </div>
  );
};

export default LoginForm;
