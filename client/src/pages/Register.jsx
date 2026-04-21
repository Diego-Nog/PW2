import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password_hash: '' });
  const [profilePic, setProfilePic] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password_hash', formData.password_hash);
      if (profilePic) {
        data.append('profile_pic', profilePic);
      }

      const response = await axios.post('http://localhost:5000/api/users/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Error');
    }
  };

  return (
    <div>
      <Navbar />
      <main className="container d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
        <div className="game-card p-5 text-center" style={{ maxWidth: '450px', width: '100%' }}>
          <h2 className="fw-bold mb-4 neon-text">NUEVO JUGADOR</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Usuario" name="username" value={formData.username} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <input type="email" className="form-control" placeholder="Correo electrónico" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <input type="password" className="form-control" placeholder="Contraseña" name="password_hash" value={formData.password_hash} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label text-white">Foto de Perfil (opcional)</label>
              <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
            </div>
            <button type="submit" className="btn btn-neon w-100 mb-3">CREAR CUENTA</button>
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
