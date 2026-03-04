import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="min-vh-100">

      <Navbar />

      <header className="hero-section mb-5">
        <div className="container h-100">
          <div className="row align-items-end h-100 pb-5">
            <div className="col-md-8">
              <span className="badge bg-info text-dark mb-2 fw-bold">DESTACADO</span>
              <h1 className="display-3 fw-bold text-white">Hades II</h1>
              <p className="lead cyan-text">La comunidad ha hablado. Lee las últimas reseñas.</p>
            </div>
          </div>
        </div>
      </header>


      <main className="container">
        <h3 className="section-title mb-4 text-white">Populares</h3>
        <div className="row row-cols-2 row-cols-md-5 g-4">
          <div className="col">
            <div className="game-card h-100">
              <Link to="/game-detail">
                <img src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/91ac334a2c137d08968ccc0bc474a02579602100/header.jpg?t=1765831644" className="img-fluid" alt="Game" />
              </Link>
              <div className="p-2 text-center">
                <span className="rating-val text-warning"><i className="bi bi-star-fill"></i> 9.8</span>
                <h6 className="text-truncate text-white">Hades II</h6>
                <Link to="/create-review" className="btn btn-outline-neon btn-sm w-100 mt-2">Reseñar</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;