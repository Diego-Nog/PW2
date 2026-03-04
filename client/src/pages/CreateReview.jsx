import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CreateReview = () => {
  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5" style={{ maxWidth: '800px' }}>
        <div className="game-card p-5">
          <h2 className="section-title mb-4 text-white">
            Escribir Reseña para <span className="cyan-text">Hades II</span>
          </h2>
          <form>
            <div className="mb-3">
              <label className="form-label text-white">Calificación (1-10)</label>
              <select className="form-select bg-dark text-white border-secondary">
                <option value="10">10 - Obra Maestra</option>
                <option value="9">9 - Excelente</option>
                <option value="8">8 - Muy Bueno</option>
                <option value="7">7 - Bueno</option>
                <option value="6">6 - Aceptable</option>
                <option value="5">5 - Mediocre</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="form-label text-white">Tu Opinión</label>
              <textarea 
                className="form-control bg-dark text-white border-secondary" 
                rows="6" 
                placeholder="¿Qué te pareció el juego?"
              ></textarea>
            </div>
            <div className="d-flex justify-content-between">
              <Link to="/game-detail" className="btn btn-outline-secondary">
                Cancelar
              </Link>
              <button type="button" className="btn btn-neon px-5">
                Publicar Reseña
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReview;