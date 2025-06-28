// Authentication configuration
const AUTH_CONFIG = {
    USERNAME: 'JWAdmin',
    PASSWORD: 'ajaya@1964',
    SESSION_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
    SESSION_KEY: 'jwb_auth_session',
    IDLE_TIMEOUT: 30 * 60 * 1000 // 30 minutes in milliseconds
};

// Check if user is authenticated
function isAuthenticated() {
    const session = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
    if (!session) return false;
    
    const { username, expiry } = JSON.parse(session);
    return username === AUTH_CONFIG.USERNAME && Date.now() < expiry;
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isAuthenticated() && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// Handle login form submission
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('error-message');
        
        if (username === AUTH_CONFIG.USERNAME && password === AUTH_CONFIG.PASSWORD) {
            // Set session
            const session = {
                username,
                expiry: Date.now() + AUTH_CONFIG.SESSION_DURATION
            };
            localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session));
            
            // Redirect to main page
            window.location.href = 'index.html';
        } else {
            errorElement.textContent = 'Invalid username or password';
        }
    });
}

// Initialize idle timeout
let idleTimer;
function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(logout, AUTH_CONFIG.IDLE_TIMEOUT);
}

// Logout function
function logout() {
    localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    window.location.href = 'login.html';
}

// Setup event listeners for user activity
function setupActivityListeners() {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => {
        window.addEventListener(event, resetIdleTimer);
    });
}

// Initialize authentication
function initAuth() {
    if (window.location.pathname.endsWith('login.html')) {
        // If already logged in, redirect to index
        if (isAuthenticated()) {
            window.location.href = 'index.html';
        }
        setupLoginForm();
    } else {
        requireAuth();
        setupActivityListeners();
        resetIdleTimer();
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

// Logout button (add this to your app.js)
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}
