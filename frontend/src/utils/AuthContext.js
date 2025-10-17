// ========================================
// Import React Hooks
// ========================================
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser } from '../services/api';

// ========================================
// Create Auth Context
// ========================================
const AuthContext = createContext();

// ========================================
// Auth Provider Component
// ========================================
export const AuthProvider = ({ children }) => {
  // State to store user data
  const [user, setUser] = useState(null);
  
  // State to track if we're checking authentication
  const [loading, setLoading] = useState(true);
  
  // State to track if user is logged in
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ========================================
  // Check if user is logged in on mount
  // ========================================
  useEffect(() => {
    checkAuth();
  }, []);

  // Function to check authentication status
  const checkAuth = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (token) {
        // If token exists, fetch user data
        const response = await getCurrentUser();
        setUser(response.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // If error, user is not authenticated
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      // Stop loading
      setLoading(false);
    }
  };

  // ========================================
  // Login Function
  // ========================================
  const loginUser = (token, userData) => {
    // Save to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Update state
    setUser(userData);
    setIsAuthenticated(true);
  };

  // ========================================
  // Logout Function
  // ========================================
  const logoutUser = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
  };

  // ========================================
  // Context Value
  // ========================================
  const value = {
    user,
    isAuthenticated,
    loading,
    loginUser,
    logoutUser,
    checkAuth
  };

  // ========================================
  // Provide Context to Children
  // ========================================
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ========================================
// Custom Hook to Use Auth Context
// ========================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

export default AuthContext;