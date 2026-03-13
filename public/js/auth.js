// Authentication functions for Bid2Code

class Auth {
    constructor() {
        this.apiBaseUrl = '/api/auth';
        this.currentUser = null;
        
        // Log when auth class is initialized
        console.log('[Auth] Initialized, API Base URL:', this.apiBaseUrl);
    }

    // Team signup (requires admin password)
    async signup(teamName, password, adminPassword) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ teamName, password, adminPassword })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.team;
                Utils.setSessionStorage('currentUser', this.currentUser);
                Utils.showAlert('Registration successful! Welcome to Bid2Code.', 'success');
                return { success: true, data };
            } else {
                Utils.showAlert(data.error || 'Registration failed', 'error');
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Signup error:', error);
            Utils.showAlert('Network error during registration', 'error');
            return { success: false, error: 'Network error' };
        }
    }

    // Team login
    async login(teamName, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ teamName, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.team;
                Utils.setSessionStorage('currentUser', this.currentUser);
                Utils.showAlert(`Welcome back, ${teamName}!`, 'success');
                return { success: true, data };
            } else {
                Utils.showAlert(data.error || 'Login failed', 'error');
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            Utils.showAlert('Network error during login', 'error');
            return { success: false, error: 'Network error' };
        }
    }

    // Admin login
    async adminLogin(username, password) {
        try {
            console.log('Attempting admin login with username:', username);
            const response = await fetch(`${this.apiBaseUrl}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            console.log('Admin login response status:', response.status);
            const data = await response.json();
            console.log('Admin login response data:', data);

            if (response.ok) {
                console.log('Admin login successful, storing session data');
                Utils.setSessionStorage('isAdmin', true);
                Utils.setSessionStorage('adminUser', data.admin);
                Utils.showAlert('Admin login successful', 'success');
                return { success: true, data };
            } else {
                console.error('Admin login failed:', data.error);
                Utils.showAlert(data.error || 'Admin login failed', 'error');
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Admin login error:', error);
            Utils.showAlert('Network error during admin login', 'error');
            return { success: false, error: 'Network error' };
        }
    }

    // Logout
    async logout() {
        try {
            console.log('[Auth] Logging out...');
            const response = await fetch(`${this.apiBaseUrl}/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                this.currentUser = null;
                Utils.removeSessionStorage('currentUser');
                Utils.removeSessionStorage('isAdmin');
                Utils.removeSessionStorage('adminUser');
                Utils.showAlert('Logged out successfully', 'success');
                console.log('[Auth] Logout successful');
                return { success: true };
            } else {
                const data = await response.json();
                Utils.showAlert(data.error || 'Logout failed', 'error');
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('[Auth] Logout error:', error);
            Utils.showAlert('Network error during logout', 'error');
            return { success: false, error: 'Network error' };
        }
    }

    // Check current authentication status
    async checkAuth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/me`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.userType === 'team') {
                    this.currentUser = data.team;
                    Utils.setSessionStorage('currentUser', this.currentUser);
                    return { authenticated: true, userType: 'team', user: data.team };
                } else if (data.userType === 'admin') {
                    Utils.setSessionStorage('isAdmin', true);
                    Utils.setSessionStorage('adminUser', data.admin);
                    return { authenticated: true, userType: 'admin', user: data.admin };
                }
            }
            
            // Not authenticated
            this.currentUser = null;
            Utils.removeSessionStorage('currentUser');
            Utils.removeSessionStorage('isAdmin');
            Utils.removeSessionStorage('adminUser');
            return { authenticated: false };
        } catch (error) {
            console.error('Auth check error:', error);
            return { authenticated: false, error: 'Network error' };
        }
    }

    // Get current user from session storage
    getCurrentUser() {
        if (!this.currentUser) {
            this.currentUser = Utils.getSessionStorage('currentUser');
        }
        return this.currentUser;
    }

    // Check if user is admin
    isAdmin() {
        return Utils.getSessionStorage('isAdmin') === true;
    }

    // Check if user is logged in as team
    isTeamLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // Require authentication middleware
    requireAuth(redirectUrl = '/team/login') {
        if (!this.isTeamLoggedIn() && !this.isAdmin()) {
            Utils.showAlert('Please log in to continue', 'error');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Require admin authentication
    requireAdminAuth(redirectUrl = '/admin/login') {
        if (!this.isAdmin()) {
            Utils.showAlert('Admin access required', 'error');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Redirect based on user type
    redirectToDashboard() {
        if (this.isAdmin()) {
            window.location.href = '/admin/dashboard';
        } else if (this.isTeamLoggedIn()) {
            window.location.href = '/team/dashboard';
        } else {
            window.location.href = '/team/login';
        }
    }

    // Setup form event listeners
    setupFormListeners() {
        // Team signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const teamName = document.getElementById('teamName').value.trim();
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const adminPassword = document.getElementById('adminPassword').value;

                // Validation
                if (!Utils.validateTeamName(teamName)) {
                    Utils.showAlert('Team name must be 3-50 characters long', 'error');
                    return;
                }

                if (!Utils.validatePassword(password)) {
                    Utils.showAlert('Password must be at least 6 characters', 'error');
                    return;
                }

                if (password !== confirmPassword) {
                    Utils.showAlert('Passwords do not match', 'error');
                    return;
                }

                if (!adminPassword) {
                    Utils.showAlert('Admin password is required for registration', 'error');
                    return;
                }

                // Submit signup
                const button = signupForm.querySelector('button[type="submit"]');
                const originalText = button.textContent;
                button.disabled = true;
                button.textContent = 'Signing up...';

                const result = await this.signup(teamName, password, adminPassword);

                button.disabled = false;
                button.textContent = originalText;

                if (result.success) {
                    setTimeout(() => {
                        window.location.href = '/team/dashboard';
                    }, 1500);
                }
            });
        }

        // Team login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const teamName = document.getElementById('teamName').value.trim();
                const password = document.getElementById('password').value;

                // Validation
                if (!teamName || !password) {
                    Utils.showAlert('Please enter both team name and password', 'error');
                    return;
                }

                // Submit login
                const button = loginForm.querySelector('button[type="submit"]');
                const originalText = button.textContent;
                button.disabled = true;
                button.textContent = 'Logging in...';

                const result = await this.login(teamName, password);

                button.disabled = false;
                button.textContent = originalText;

                if (result.success) {
                    setTimeout(() => {
                        window.location.href = '/team/dashboard';
                    }, 1500);
                }
            });
        }

        // Admin login form
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value;

                // Validation
                if (!username || !password) {
                    Utils.showAlert('Please enter both username and password', 'error');
                    return;
                }

                // Submit admin login
                const button = adminLoginForm.querySelector('button[type="submit"]');
                const originalText = button.textContent;
                button.disabled = true;
                button.textContent = 'Logging in...';

                const result = await this.adminLogin(username, password);

                button.disabled = false;
                button.textContent = originalText;

                if (result.success) {
                    setTimeout(() => {
                        window.location.href = '/admin/dashboard';
                    }, 1500);
                }
            });
        }

        // Logout buttons
        const logoutButtons = document.querySelectorAll('[data-logout]');
        logoutButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.logout();
                window.location.href = '/';
            });
        });
    }

    // Initialize authentication
    init() {
        this.setupFormListeners();
        
        // Check auth status on page load for protected pages
        const protectedPages = ['/team/dashboard', '/team/questions'];
        const adminPages = ['/admin/dashboard', '/admin/create-question', '/admin/live-bidding'];
        
        const currentPath = window.location.pathname;
        
        if (protectedPages.includes(currentPath)) {
            this.requireAuth();
        }
        
        if (adminPages.includes(currentPath)) {
            this.requireAdminAuth();
        }
    }
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const auth = new Auth();
    auth.init();
    
    // Make auth globally available
    window.auth = auth;
});