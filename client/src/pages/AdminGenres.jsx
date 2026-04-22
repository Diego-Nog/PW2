import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const AdminGenres = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
      return;
    }

    const fetchGenres = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/genres');
        setGenres(res.data.genres || []);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudieron cargar los géneros.');
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, [user, navigate]);

  if (!user || !user.is_admin) return null;

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5 pb-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 className="section-title mb-2 text-white">
              Gestionar <span className="cyan-text">Géneros</span>
            </h2>
            <p className="text-secondary mb-0">Puedes editar géneros existentes. No se permite eliminar.</p>
          </div>

          <button
            className="btn btn-neon px-4"
            onClick={() => navigate('/admin/create-genre/new')}
          >
            Create
          </button>
        </div>

        {loading && <p className="text-secondary">Cargando géneros...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && genres.length === 0 && (
          <div className="game-card p-4 text-center text-secondary">
            No hay géneros registrados todavía.
          </div>
        )}

        <div className="row g-4">
          {genres.map((genre) => (
            <div className="col-12 col-md-6" key={genre._id}>
              <div className="admin-genre-card h-100 p-4">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <h5 className="text-white mb-2">{genre.name}</h5>
                    <p className="text-secondary mb-3">
                      {genre.description || 'Sin descripción.'}
                    </p>
                  </div>

                  <button
                    className="btn btn-sm btn-outline-light"
                    onClick={() => navigate(`/admin/create-genre/new?edit=${genre._id}`)}
                  >
                    Editar
                  </button>
                </div>

                {genre.tags?.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {genre.tags.map((tag, index) => (
                      <span key={`${genre._id}-${index}`} className="genre-tag-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button className="btn btn-outline-secondary" onClick={() => navigate('/admin')}>
            Volver al panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminGenres;
