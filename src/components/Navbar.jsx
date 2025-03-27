import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
    const { currentUser, userRole, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const menuItems = [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        ...(currentUser && userRole === 'admin' ? [
            { path: '/blog', label: 'Blog' },
            { path: '/events', label: 'Events' }
        ] : []),
    ];

    return (
        <div className="navbar bg-base-100 shadow-lg">
            <div className="navbar-start">
                <div className="dropdown lg:hidden">
                    <label tabIndex={0} className="btn btn-ghost btn-circle" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </label>
                    <ul tabIndex={0} className={`menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 ${isOpen ? 'block' : 'hidden'}`}>
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={isActive(item.path) ? 'active' : ''}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                        {currentUser && (
                            <li>
                                <button onClick={handleLogout}>Logout</button>
                            </li>
                        )}
                    </ul>
                </div>
                <Link to="/" className="btn btn-ghost normal-case text-xl">EventApp</Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={isActive(item.path) ? 'active' : ''}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="navbar-end">
                {currentUser ? (
                    <div className="hidden lg:flex items-center gap-4">
                        <span className="text-sm">
                            {userRole === 'admin' ? 'Admin' : 'User'}
                        </span>
                        <button onClick={handleLogout} className="btn btn-ghost">
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="hidden lg:flex gap-2">
                        <Link to="/login" className="btn btn-ghost">Login</Link>
                        <Link to="/register" className="btn btn-primary">Register</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Navbar;