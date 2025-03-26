import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import BlogManagement from './components/BlogManagement.jsx';
import BlogManagement from './components/blog/BlogManagement.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './components/Home.jsx';
import About from './components/About.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogManagement />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 