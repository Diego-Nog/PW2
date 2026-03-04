import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Library = () => {
  return (
    <div className="min-vh-100">
      <Navbar />

      <main className="container mt-5">
        <h3 className="section-title text-white">Colección de Juegos</h3>
        <div className="row row-cols-1 row-cols-md-2 g-4">
          <div className="col">
            <div className="game-card p-3 d-flex align-items-center">
              <img 
                src="https://cdn1.epicgames.com/spt-assets/ea0a24395cd641d7bbde3e5d78ad462c/hades-ii-logo-zn2ks.png?resize=1&w=480&h=270&quality=medium" 
                className="rounded me-3" 
                alt="Hades II" 
                style={{ width: '120px', height: 'auto', objectFit: 'contain' }} 
              />
              <div className="flex-grow-1">
                <h5 className="mb-1 text-white">Hades II</h5>
                <p className="small text-secondary mb-0">Estado: Jugando</p>
              </div>
              <Link to="/game-detail" className="btn btn-outline-neon btn-sm">
                Ver info
              </Link>
            </div>
          </div>
          {/* Aquí podrías mapear más juegos de tu base de datos después */}
        </div>
      </main>
    </div>
  );
};

export default Library;