// utils/csrfUtils.js
export const getCsrfToken = async (API_BASE_URL) => {
    try {
        console.log('🛡️ Fetching CSRF cookie...');
        
        // Use fetch instead of axios for better control
        const csrfResponse = await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
            method: 'GET',
            credentials: 'include', // Must include credentials
            headers: {
                'Accept': 'application/json',
            }
        });
        
        console.log('🛡️ CSRF response status:', csrfResponse.status);
        
        if (!csrfResponse.ok) {
            console.error('❌ CSRF request failed');
            return null;
        }
        
        // Check cookies
        const cookies = document.cookie.split(';');
        console.log('🍪 All cookies:', cookies);
        
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            console.log(`Checking cookie: ${name}`);
            
            if (name === 'XSRF-TOKEN' || name === 'xsrf-token') {
                const token = decodeURIComponent(value);
                console.log('✅ Found CSRF token:', token.substring(0, 20) + '...');
                return token;
            }
        }
        
        console.warn('⚠️ No CSRF token found in cookies');
        return null;
        
    } catch (error) {
        console.error('❌ Error getting CSRF token:', error);
        return null;
    }
};