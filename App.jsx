// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css'; 
// Import the new unified component
import AuthPage from './AuthPage'; 

// Placeholder pages for later development
const AdminDashboard = () => <h1>Admin Dashboard (Secured)</h1>;
const NotFoundPage = () => <h1>404: Page Not Found</h1>;


function App() {
  return (
    <>
      <Routes>
        
        {/* Use AuthPage for both Registration and Login at the root path */}
        <Route path="/" element={<AuthPage />} /> 
        
        {/* The AuthPage will handle the internal toggle/switch logic. 
            We no longer need a separate /login route for the form.
        */}

        {/* Route for the Admin Dashboard (where AuthPage navigates to) */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;