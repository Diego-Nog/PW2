import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow-lg">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <span className="neon-text">GAME</span>SENSE
        </Link>
        <form className="d-flex flex-grow-1 mx-lg-5 search-container">
          <div className="input-group">
            <button className="btn btn-dark dropdown-toggle border-secondary" type="button">Todo</button>
            <input type="text" className="form-control" placeholder="Buscar videojuegos..." />
            <button className="btn btn-warning"><i className="bi bi-search"></i></button>
          </div>
        </form>
        <div className="navbar-nav align-items-center">
          <Link className="nav-link fw-bold d-none d-md-block" to="/library">
            <i className="bi bi-controller me-1"></i>Mi Biblioteca
          </Link>
          <Link className="btn btn-neon ms-lg-3" to="/login">Identifícate</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;