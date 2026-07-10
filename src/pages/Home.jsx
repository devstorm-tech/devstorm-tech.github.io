import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import Courses from '../components/Courses';
import Features from '../components/Features';
import CTA from '../components/CTA';

function Home() {
    // Handle hash navigation when page loads
    useEffect(() => {
        // Check if there's a hash in the URL
        if (window.location.hash) {
            const hash = window.location.hash.substring(1); // Remove the #
            const element = document.getElementById(hash);
            if (element) {
                // Wait a bit for everything to load, then scroll
                setTimeout(() => {
                    element.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 300);
            }
        } else {
            // If no hash, scroll to top when page loads
            window.scrollTo(0, 0);
        }
    }, []);

    return (
        <div className="home-page">
            <main>
                <Hero />
                <Courses />
                <Features />
            </main>
        </div>
    );
}

export default Home;