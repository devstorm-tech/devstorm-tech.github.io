import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CTA.css';

const CTA = () => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const handleGetStarted = () => {
        setIsClicked(true);
        
        // Button animation before navigation
        setTimeout(() => {
            navigate('/signup');
        }, 300);
    };

    return (
        <section className="cta-section">
            <div className="container">
                <h2>Start Your Coding Journey Today</h2>
                <p>Join over 500,000 developers who have transformed their careers with DevStorm. No prior experience needed.</p>
                
                <button 
                    className={`btn btn-primary cta-btn ${isClicked ? 'clicked' : ''}`}
                    onClick={handleGetStarted}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    Get Started For Free
                </button>
                
                <p className="cta-note">
                    No credit card required<span className="cursor"></span>
                </p>
            </div>
        </section>
    );
};

export default CTA;