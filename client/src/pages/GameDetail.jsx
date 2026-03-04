import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const GameDetail = () => {
  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5">
        <div className="row">
          {/* Columna Izquierda: Información del Juego */}
          <div className="col-lg-4 mb-4">
            <div className="game-card p-3">
              <img 
                src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/91ac334a2c137d08968ccc0bc474a02579602100/header.jpg?t=1765831644" 
                className="img-fluid rounded mb-3" 
                alt="Elden Ring" 
              />
              <h2 className="cyan-text">Hades II</h2>
              <p className="text-secondary">
                Desarrollador: Supergiant Games<br />
                Lanzamiento: 2025
              </p>
              <div className="d-grid gap-2">
                <Link to="/create-review" className="btn btn-neon">
                  <i className="bi bi-pencil-square"></i> Escribir Reseña
                </Link>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Reseñas */}
          <div className="col-lg-8">
            <h3 className="section-title mb-4 text-white">Reseñas de la Comunidad</h3>
            
            {/* Ejemplo de una reseña */}
            <div className="game-card p-4 mb-3">
              <div className="d-flex justify-content-between border-bottom border-secondary pb-2 mb-3">
                <span className="fw-bold cyan-text">@Alex_UANL</span>
                <span className="text-warning">
                  <i className="bi bi-star-fill"></i> 10/10
                </span>
              </div>
              <p className="text-white">
                "Una experiencia inigualable. El diseño de niveles y la dificultad son perfectos para los amantes del género."
              </p>
              <small className="text-secondary">Publicado el 15 de Octubre, 2025</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;