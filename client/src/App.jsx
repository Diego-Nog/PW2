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
import CreateGenre from './pages/CreateGenre';
import CreateUser from './pages/CreateUser';
import UserRequests from './pages/UserRequests';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game-detail" element={<GameDetail />} />
          <Route path="/create-review" element={<CreateReview />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/create-game" element={<AdminGames />} />
          <Route path="/admin/create-game/new" element={<AdminPanel />} />
          <Route path="/admin/create-genre" element={<CreateGenre />} />
          <Route path="/admin/create-user" element={<CreateUser />} />
          <Route path="/admin/user-requests" element={<UserRequests />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;