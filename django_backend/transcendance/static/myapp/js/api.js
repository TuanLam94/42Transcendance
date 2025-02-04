const api = {
    accessToken: null,

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? parts.pop().split(';').shift() : null;
    },

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCookie('csrftoken')
        };
        
        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        
        return headers;
    },

    // Refresh access token using HttpOnly refresh token cookie
    async refreshAccessToken() {
        try {
            const response = await fetch('/api/token/refresh/', {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include', // Important for sending cookies
            });

            if (response.ok) {
                const data = await response.json();
                this.accessToken = data.access;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    },

    async checkAndRefreshToken() {
        const refreshToken = api.getCookie('refresh_token');
        if (refreshToken) {
            const success = await api.refreshAccessToken();
            if (success) {
                console.log('Access token refreshed');
            } else {
                console.log('Token refresh failed. Redirecting to login...');
                window.location.href = '/login';  // Redirect to login page if refresh fails
            }
        }
        else {
            console.log('No Refresh Token Available');
        }
    },

    // Wrapper for authenticated requests
    async authFetch(url, options = {}) {
        // First attempt with current access token
        const response = await fetch(url, {
            ...options,
            headers: this.getHeaders(),
            credentials: 'include'
        });

        // If unauthorized, try refreshing token (maybe add 403 ?)
        if (response.status === 401) {
            const refreshSuccess = await this.refreshAccessToken();
            if (refreshSuccess) {
                // Retry original request with new access token
                return fetch(url, {
                    ...options,
                    headers: this.getHeaders(),
                    credentials: 'include'
                });
            } else {
                // Redirect to login if refresh fails
                window.location.href = '/login';
                throw new Error('Authentication failed');
            }
        }

        return response;
    },

    
    async login(username, password) {
        try {
            const response = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });
    
            const data = await response.json();
            return {
                ok: response.ok,
                message: data.message,
                ...data
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async signup(username, email, password) {
        try {
            const response = await fetch('/api/auth/signup/', {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            return {
                ok: response.ok,
                ...data
            };
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
    },

    async verify2FA(code) {
        try {
            const response = await fetch('api/token/verify-2fa/', {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({ code }),
            });
            
            const data = await response.json();
            if (response.ok) {
                // Store access token in memory after successful 2FA
                this.accessToken = data.access;
            }
            return { ok: response.ok, ...data };
        } catch (error) {
            console.error('2FA verification error:', error);
            throw error;
        }
    },

    async logout() {
        try {
            const response = await this.authFetch('/api/auth/logout/', {
                method: 'POST'
            });
            
            if (response.ok) {
                this.accessToken = null;
                window.location.href = '/login';
            }
            return response.ok;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    // Example of an authenticated request
    async getUserProfile() {
        try {
            const response = await this.authFetch('/profile/', { method: 'GET' });
            if (!response.ok) {
                throw new Error('Failed to fetch profile')
            }
            return await response.json();

        } catch (error) {
            console.error('Profile fetch error:', error);
            throw error;
        }
    },

    // async updateUserProfile(profileData) {
    //     try {
    //         const response = await this.authFetch('/profile/', { 
    //             method: 'PUT',
    //             body:JSON.stringify(profileData)
    //     });
    //         if (!response.ok) {
    //             throw new Error('Failed to update profile')
    //         }
    //         return await response.json();

    //     } catch (error) {
    //         console.error('Profile update error:', error);
    //         throw error;
    //     }
    // }
};

export default api;