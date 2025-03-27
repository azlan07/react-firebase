import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import BlogManagement from './components/blog/BlogManagement';
import BlogDetail from './components/blog/BlogDetail';
import About from './components/About';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import { AuthProvider } from './context/AuthContext';
import EventManagement from './components/event/EventManagement';
import EventDetail from './components/event/EventDetail';
import EventRegistration from './components/event/EventRegistration';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-base-200">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/events/:id/register" element={<EventRegistration />} />

              {/* Admin Routes */}
              <Route 
                path="/blog" 
                element={
                  <AdminRoute>
                    <BlogManagement />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/events" 
                element={
                  <AdminRoute>
                    <EventManagement />
                  </AdminRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App; 