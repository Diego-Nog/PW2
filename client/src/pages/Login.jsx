import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; 

const Login = () => {
  return (
    <div>
      <Navbar />

      <main className="container d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
        <div className="game-card p-5 text-center" style={{ maxWidth: '400px', width: '100%' }}>
          <h2 className="fw-bold mb-4 neon-text">IDENTIFÍCATE</h2>
          <form>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Usuario" />
            </div>
            <div className="mb-4">
              <input type="password" className="form-control" placeholder="Contraseña" />
            </div>
            <button type="button" className="btn btn-neon w-100 mb-3">ENTRAR</button>
          </form>
          <p className="small mb-0 text-secondary">
            ¿ERES NUEVO? <Link to="/register" className="cyan-text fw-bold">REGÍSTRATE AQUÍ</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;