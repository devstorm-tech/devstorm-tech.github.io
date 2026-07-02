import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="container hero-content">
                 <h1>Learn to Code with <span>DevStorm</span></h1>
                <p>Master programming through interactive courses, real-world projects, and a community of developers. From beginner to advanced, we have the perfect learning path for you.</p>
                
                <div className="code-snippet">
                    <div className="code-line"><span className="line-number">1</span> <span className="code-keyword">import</span> <span className="code-function">DevStorm</span> from <span className="code-string">'learning-platform'</span>;</div>
                    <div className="code-line"><span className="line-number">2</span></div>
                    <div className="code-line"><span className="line-number">3</span> <span className="code-keyword">const</span> learner = <span className="code-keyword">new</span> <span className="code-function">Developer</span>({'{'}</div>
                    <div className="code-line"><span className="line-number">4</span> &nbsp;&nbsp;skillLevel: <span className="code-string">'beginner'</span>,</div>
                    <div className="code-line"><span className="line-number">5</span> &nbsp;&nbsp;goal: <span className="code-string">'master programming'</span></div>
                    <div className="code-line"><span className="line-number">6</span> {'}'});</div>
                    <div className="code-line"><span className="line-number">7</span></div>
                    <div className="code-line"><span className="line-number">8</span> <span className="code-function">DevStorm</span>.<span className="code-function">transform</span>(learner);</div>
                    <div className="code-line"><span className="line-number">9</span> <span className="code-comment">// Result: Professional Developer</span></div>
                </div>
                
                <div className="hero-actions">
                    {/* Updated button - goes to courses page */}
                    <Link to="/courses" className="btn btn-primary hero-btn">
                        Start Learning Now
                    </Link>
                    
                    {/* Updated video link - could link to a video page or modal */}
                    <Link to="/intro-video" className="video-link">
                        <i className="fas fa-play-circle"></i> Watch our intro video
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;