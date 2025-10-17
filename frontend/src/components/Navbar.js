// ========================================
// Import Dependencies
// ========================================
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import './Navbar.css';

// ========================================
// Navbar Component
// ========================================
const Navbar = () => {
  // Get auth state and functions
  const { user, isAuthenticated, logoutUser } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          🎨 AI Gallery
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Gallery
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/generate" className="nav-link">
                Generate
              </Link>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <div className="user-info">
                <span className="username">{user?.username}</span>
                <button onClick={handleLogout} className="btn btn-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register">
                <button className="btn btn-primary">Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;