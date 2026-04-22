  import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GameDetail from './pages/GameDetail';
import CreateReview from './pages/CreateReview';
import Library from './pages/Library';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminPanel from './pages/AdminPanel';
import AdminGames from './pages/AdminGames';
import AdminGenres from './pages/AdminGenres';
import CreateGenre from './pages/CreateGenre';
import CreateUser from './pages/CreateUser';
import UserRequests from './pages/UserRequests';
import UserGames from './pages/UserGames';
import UserGamePanel from './pages/UserGamePanel';
import PendingGameRequests from './pages/PendingGameRequests';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/games/:gameId" element={<GameDetail />} />
          <Route path="/games/:gameId/review" element={<CreateReview />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/create-game" element={<AdminGames />} />
          <Route path="/admin/create-game/new" element={<AdminPanel />} />
          <Route path="/admin/create-genre" element={<AdminGenres />} />
          <Route path="/admin/create-genre/new" element={<CreateGenre />} />
          <Route path="/admin/create-user" element={<UserRequests />} />
          <Route path="/admin/create-user/new" element={<CreateUser />} />
          <Route path="/admin/user-requests" element={<PendingGameRequests />} />
          <Route path="/my-games" element={<UserGames />} />
          <Route path="/my-games/new" element={<UserGamePanel />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;