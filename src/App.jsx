import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { AdminProtectedRoute, EmailVerificationProtectedRoute } from './components/ProtectedRoutes';
import { fetchCsrfToken } from './api/client';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import News from './pages/News';
import CloudLinux from './pages/CloudLinux';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import Compiler from './pages/Compiler';
import DvsStore from './pages/Store';
import MyProfile from './pages/MyProfile';
import SingleCourse from './pages/SingleCourse';
import Dashboard from './pages/dashboard';


function App() {
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(link);

        fetchCsrfToken().catch(() => {});

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <ScrollToTop />
                    <Header />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/news" element={<News />} />
                        <Route path="/store" element={<DvsStore />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/courses" element={<EmailVerificationProtectedRoute><Courses /></EmailVerificationProtectedRoute>} />
                        <Route path="/course/:id" element={<EmailVerificationProtectedRoute><SingleCourse /></EmailVerificationProtectedRoute>} />
                        <Route path="/cloud-linux" element={<EmailVerificationProtectedRoute><CloudLinux /></EmailVerificationProtectedRoute>} />
                        <Route path="/compiler" element={<EmailVerificationProtectedRoute><Compiler /></EmailVerificationProtectedRoute>} />
                        <Route path="/profile" element={<EmailVerificationProtectedRoute><MyProfile /></EmailVerificationProtectedRoute>} />
                        <Route path="/dashboard" element={<AdminProtectedRoute><Dashboard /></AdminProtectedRoute>} />
                        {/* Redirect old /course route to courses page */}
                        <Route path="/course" element={<Navigate to="/courses" />} />
                        
                        {/* 404 Page */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;