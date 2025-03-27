import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import { AuthProvider } from './context/AuthContext';
import EventManagement from './components/event/EventManagement';
import EventDetail from './components/event/EventDetail';
import EventRegistration from './components/usersEvent/EventRegistration';
import BlogManagement from './components/blog/BlogManagement';
import BlogDetail from './components/blog/BlogDetail';

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
              <Route path="/about" element={<About />} />
              <Route path="/auth">
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
              </Route>

              {/* Event Routes */}
              <Route path="/events">
                <Route index element={
                  <AdminRoute>
                    <EventManagement />
                  </AdminRoute>
                } />
                <Route path=":id">
                  <Route index element={<EventDetail />} />
                  <Route path="register" element={
                    <ProtectedRoute>
                      <EventRegistration />
                    </ProtectedRoute>
                  } />
                </Route>
              </Route>

              {/* Blog Routes */}
              <Route path="/blog">
                <Route index element={
                  <AdminRoute>
                    <BlogManagement />
                  </AdminRoute>
                } />
                <Route path=":id" element={<BlogDetail />} />
              </Route>
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;