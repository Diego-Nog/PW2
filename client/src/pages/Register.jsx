import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Register = () => {
  return (
    <div>
      <Navbar />
      <main className="container d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
        <div className="game-card p-5 text-center" style={{ maxWidth: '450px', width: '100%' }}>
          <h2 className="fw-bold mb-4 neon-text">NUEVO JUGADOR</h2>
          <form>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Usuario" />
            </div>
            <div className="mb-3">
              <input type="email" className="form-control" placeholder="Correo electrónico" />
            </div>
            <div className="mb-4">
              <input type="password" className="form-control" placeholder="Contraseña" />
            </div>
            <button type="button" className="btn btn-neon w-100 mb-3">CREAR CUENTA</button>
          </form>
          <p className="small mb-0 text-secondary">
            ¿YA TIENES CUENTA? <Link to="/login" className="cyan-text fw-bold">LOG IN</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;