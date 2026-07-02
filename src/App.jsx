import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './Pages/About';
import Courses from './pages/Courses';
import News from './pages/News';
import CloudLinux from './pages/CloudLinux';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import NotFound from './Pages/NotFound';
import Compiler from './Pages/Compiler';
import DvsStore from './Pages/Store';
import MyProfile from './Pages/MyProfile';
import SingleCourse from './Pages/SingleCourse';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    // Function to check if user is authenticated
    const isAuthenticated = () => {
        // Check cookies
        const cookies = document.cookie.split('; ');
        const authTokenCookie = cookies.find(row => row.startsWith('auth_token='));
        const userDataCookie = cookies.find(row => row.startsWith('user_data='));
        
        // Check session storage
        const sessionAuth = sessionStorage.getItem('auth_status');
        const sessionUser = sessionStorage.getItem('user');
        const sessionToken = sessionStorage.getItem('auth_token');
        
        // Check localStorage
        const localStorageAuth = localStorage.getItem('auth_status');
        const localStorageUser = localStorage.getItem('user');
        
        // Return true if authenticated in any storage
        return (
            (authTokenCookie && userDataCookie) ||
            (sessionAuth === 'authenticated' && sessionUser && sessionToken) ||
            (localStorageAuth === 'authenticated' && localStorageUser)
        );
    };

    return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    return (
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
                    
                    {/* Course Routes */}
                    <Route path="/courses" element={
                        <ProtectedRoute>
                            <Courses />
                        </ProtectedRoute>
                    } />
                    <Route path="/course/:id" element={
                        <ProtectedRoute>
                            <SingleCourse />
                        </ProtectedRoute>
                    } />
                    
                    {/* Other Protected Routes */}
                    <Route path="/cloud-linux" element={
                        <ProtectedRoute>
                            <CloudLinux />
                        </ProtectedRoute>
                    } />
                    <Route path="/compiler" element={
                        <ProtectedRoute>
                            <Compiler />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <MyProfile />
                        </ProtectedRoute>
                    } />
                    
                    {/* Redirect old /course route to courses page */}
                    <Route path="/course" element={<Navigate to="/courses" />} />
                    
                    {/* 404 Page */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;