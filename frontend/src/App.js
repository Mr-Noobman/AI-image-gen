// ========================================
// Import Dependencies
// ========================================
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Components
import Navbar from './components/Navbar';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Generate from './pages/Generate';           // ✅ NOW IMPORTED
import ImageDetail from './pages/ImageDetail';     // ✅ NOW IMPORTED
import Profile from './pages/Profile';             // ✅ NOW IMPORTED

import './App.css';

// ========================================
// Protected Route Component
// ========================================
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ========================================
// Main App Component
// ========================================
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />

          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/image/:id" element={<ImageDetail />} />

              {/* Protected Routes */}
              <Route 
                path="/generate" 
                element={
                  <ProtectedRoute>
                    <Generate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

// ========================================
// 404 Not Found Component
// ========================================
const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Page not found 😔</p>
      <a href="/" className="btn btn-primary">
        Go Home
      </a>
    </div>
  );
};

export default App;