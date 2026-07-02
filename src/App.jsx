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
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/course/:id" element={<SingleCourse />} />
                    <Route path="/cloud-linux" element={<CloudLinux />} />
                    <Route path="/compiler" element={<Compiler />} />
                    <Route path="/profile" element={<MyProfile />} />
                    
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