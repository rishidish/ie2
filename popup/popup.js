
document.addEventListener('DOMContentLoaded', () => {
    let isSignUp = false;

    const container = document.querySelector('.container');
    const authForm = document.getElementById('auth-form');
    const switchLink = document.getElementById('auth-switch-link');
    const logoutBtn = document.getElementById('logout-btn');
    const openWebsiteBtn = document.getElementById('open-website-btn');

    // --- UI Update Functions ---

    function toggleAuthMode() {
        isSignUp = !isSignUp;
        const nameGroup = document.getElementById('name-group');
        const authTitle = document.querySelector('.auth-title');
        const authSubtitle = document.getElementById('auth-subtitle');
        const authBtn = document.getElementById('auth-btn');
        const authSwitchText = document.getElementById('auth-switch-text');

        hideError();

        if (isSignUp) {
            nameGroup.style.display = 'block';
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Sign up to get started';
            authBtn.textContent = 'Sign Up';
            authSwitchText.textContent = 'Already have an account? ';
            switchLink.textContent = 'Sign in';
        } else {
            nameGroup.style.display = 'none';
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Sign in to access your dashboard';
            authBtn.textContent = 'Sign In';
            authSwitchText.textContent = "Don't have an account? ";
            switchLink.textContent = 'Sign up';
        }
    }

    function showDashboard(user) {
        container.classList.remove('show-auth');
        container.classList.add('show-dashboard');
        
        const userNameEl = document.getElementById('user-name');
        const userEmailEl = document.getElementById('user-email');

        userNameEl.textContent = user.user_metadata?.full_name || 'User';
        userEmailEl.textContent = user.email;
    }

    function showAuth() {
        container.classList.remove('show-dashboard');
        container.classList.add('show-auth');
        authForm.reset();
    }
    
    function showError(message) {
        const errorEl = document.getElementById('error-message');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    function hideError() {
        const errorEl = document.getElementById('error-message');
        errorEl.style.display = 'none';
    }

    // --- Event Listeners ---

    switchLink.addEventListener('click', toggleAuthMode);

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const fullName = document.getElementById('name').value;
        const authBtn = document.getElementById('auth-btn');

        if (isSignUp && !fullName) {
            showError('Please enter your full name');
            return;
        }

        authBtn.disabled = true;
        authBtn.textContent = 'Please wait...';

        const response = await chrome.runtime.sendMessage({
            type: 'auth',
            payload: {
                mode: isSignUp ? 'signup' : 'login',
                email,
                password,
                fullName: isSignUp ? fullName : undefined
            }
        });
        
        if (response.success) {
            showDashboard(response.user);
        } else {
            showError(response.error || 'An unknown error occurred.');
        }

        authBtn.disabled = false;
        authBtn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    });

    logoutBtn.addEventListener('click', async () => {
        await chrome.runtime.sendMessage({ type: 'auth:logout' });
        showAuth();
    });

    openWebsiteBtn.addEventListener('click', () => {
        // Replace with your actual website URL
        chrome.tabs.create({ url: 'http://localhost:5173/' });
    });

    // --- Initial Check ---
    async function checkAuthentication() {
        const response = await chrome.runtime.sendMessage({ type: 'auth:check' });
        if (response.authenticated) {
            showDashboard(response.user);
        } else {
            showAuth();
        }
    }

    checkAuthentication();
});
