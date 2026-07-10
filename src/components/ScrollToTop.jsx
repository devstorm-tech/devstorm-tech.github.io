import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top when route changes
        window.scrollTo(0, 0);
        
        // Also handle hash navigation (for homepage sections)
        if (window.location.hash) {
            const hash = window.location.hash.substring(1); // Remove the #
            const element = document.getElementById(hash);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [pathname]);

    return null;
};

export default ScrollToTop;