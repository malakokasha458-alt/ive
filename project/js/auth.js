// ============================================
// AUTH.JS - Complete Authentication Logic
// ============================================

// Password strength checker
const PasswordStrength = {
    check: (password) => {
        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return strength;
    },
    
    getText: (strength) => {
        switch(strength) {
            case 0: return { text: 'Enter a password', class: '' };
            case 1: return { text: 'Weak password', class: 'strength-weak' };
            case 2: return { text: 'Fair password', class: 'strength-fair' };
            case 3: return { text: 'Good password', class: 'strength-good' };
            default: return { text: 'Strong password!', class: 'strength-strong' };
        }
    },
    
    updateUI: (password) => {
        const strength = PasswordStrength.check(password);
        const { text, class: className } = PasswordStrength.getText(strength);
        
        const strengthBar = document.querySelector('#strength-bar');
        const strengthText = document.querySelector('#strength-text');
        
        if (strengthBar) {
            strengthBar.className = 'strength-bar';
            if (className) strengthBar.classList.add(className);
        }
        if (strengthText) strengthText.textContent = text;
    }
};

// Validation functions
const Validators = {
    isEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    isPasswordMatch: (password, confirm) => {
        return password === confirm;
    },
    
    isPasswordStrong: (password) => {
        return PasswordStrength.check(password) >= 3;
    },
    
    showError: (message) => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonColor: '#0077C0',
            background: '#FAFAFA'
        });
    },
    
    showSuccess: (message, redirectUrl) => {
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: message,
            confirmButtonColor: '#0077C0',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        });
    }
};

// Main Auth object
const Auth = {
    // Initialize auth page
    init: () => {
        // If already logged in, redirect to home
        if (Auth.isLoggedIn() && !window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
            window.location.href = 'index.html';
        }
        
        // Setup password strength checker on register page
        const passwordInput = document.querySelector('#register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                PasswordStrength.updateUI(e.target.value);
            });
        }
        
        // Setup login form
        const loginForm = document.querySelector('#login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', Auth.handleLogin);
        }
        
        // Setup register form
        const registerForm = document.querySelector('#register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', Auth.handleRegister);
        }
        
        // Handle forgot password
        const forgotLink = document.querySelector('#forgot-password');
        if (forgotLink) {
            forgotLink.addEventListener('click', Auth.handleForgotPassword);
        }
        
        // Load remembered email if exists
        Auth.loadRememberedEmail();
    },
    
    // Check if user is logged in
    isLoggedIn: () => {
        return localStorage.getItem('isLoggedIn') === 'true';
    },
    
    // Get current user
    getCurrentUser: () => {
        const user = localStorage.getItem('registeredUser');
        return user ? JSON.parse(user) : null;
    },
    
    // Load remembered email
    loadRememberedEmail: () => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        const emailInput = document.querySelector('#login-email');
        const rememberCheckbox = document.querySelector('#remember-me');
        
        if (rememberedEmail && emailInput) {
            emailInput.value = rememberedEmail;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
    },
    
    // Handle login form submission
    handleLogin: (e) => {
        e.preventDefault();
        
        const email = document.querySelector('#login-email').value.trim();
        const password = document.querySelector('#login-password').value;
        const rememberMe = document.querySelector('#remember-me')?.checked || false;
        
        // Validate inputs
        if (!email || !password) {
            Validators.showError('Please fill in all fields');
            return;
        }
        
        if (!Validators.isEmail(email)) {
            Validators.showError('Please enter a valid email address');
            return;
        }
        
        // Get registered user from localStorage
        const registeredUser = localStorage.getItem('registeredUser');
        
        if (!registeredUser) {
            Validators.showError('No account found. Please register first.');
            return;
        }
        
        const user = JSON.parse(registeredUser);
        
        // Check credentials
        if (user.email === email && user.password === password) {
            // Set login state
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUserEmail', email);
            
            // Set remember me
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            // Check if there was a redirect after login
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
                sessionStorage.removeItem('redirectAfterLogin');
                Validators.showSuccess('Login successful!', redirectUrl);
            } else {
                Validators.showSuccess('Welcome back!', 'index.html');
            }
        } else {
            Validators.showError('Invalid email or password');
        }
    },
    
    // Handle register form submission
    handleRegister: (e) => {
        e.preventDefault();
        
        const name = document.querySelector('#register-name').value.trim();
        const email = document.querySelector('#register-email').value.trim();
        const password = document.querySelector('#register-password').value;
        const confirmPassword = document.querySelector('#confirm-password').value;
        const termsAccepted = document.querySelector('#terms-checkbox')?.checked || false;
        
        // Validate inputs
        if (!name || !email || !password || !confirmPassword) {
            Validators.showError('Please fill in all fields');
            return;
        }
        
        if (name.length < 2) {
            Validators.showError('Name must be at least 2 characters long');
            return;
        }
        
        if (!Validators.isEmail(email)) {
            Validators.showError('Please enter a valid email address');
            return;
        }
        
        if (password.length < 6) {
            Validators.showError('Password must be at least 6 characters long');
            return;
        }
        
        if (!Validators.isPasswordMatch(password, confirmPassword)) {
            Validators.showError('Passwords do not match');
            return;
        }
        
        if (!termsAccepted) {
            Validators.showError('Please accept the Terms of Service and Privacy Policy');
            return;
        }
        
        // Check if user already exists
        const existingUser = localStorage.getItem('registeredUser');
        if (existingUser) {
            const user = JSON.parse(existingUser);
            if (user.email === email) {
                Validators.showError('An account with this email already exists');
                return;
            }
        }
        
        // Create new user object
        const newUser = {
            userName: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString(),
            avatar: './imges/img_avatar.png'
        };
        
        // Save to localStorage
        localStorage.setItem('registeredUser', JSON.stringify(newUser));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUserEmail', email);
        
        // Initialize empty arrays for new user
        if (!localStorage.getItem('myCourses')) {
            localStorage.setItem('myCourses', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('activities')) {
            localStorage.setItem('activities', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
        
        Validators.showSuccess('Account created successfully!', 'index.html');
    },
    
    // Handle forgot password
    handleForgotPassword: (e) => {
        e.preventDefault();
        
        Swal.fire({
            title: 'Reset Password',
            text: 'Enter your email address to receive reset instructions',
            input: 'email',
            inputPlaceholder: 'your@email.com',
            showCancelButton: true,
            confirmButtonColor: '#0077C0',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Send Reset Link',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const email = result.value;
                const registeredUser = localStorage.getItem('registeredUser');
                
                if (registeredUser && JSON.parse(registeredUser).email === email) {
                    // In a real app, this would send an email
                    Swal.fire({
                        icon: 'success',
                        title: 'Reset Link Sent!',
                        text: 'Check your email for password reset instructions',
                        confirmButtonColor: '#0077C0'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Email Not Found',
                        text: 'No account found with this email address',
                        confirmButtonColor: '#0077C0'
                    });
                }
            }
        });
    },
    
    // Logout
    logout: () => {
        Swal.fire({
            title: 'Logout?',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0077C0',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, Logout',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.setItem('isLoggedIn', 'false');
                localStorage.removeItem('currentUserEmail');
                
                Swal.fire({
                    icon: 'success',
                    title: 'Logged Out!',
                    text: 'You have been logged out successfully.',
                    confirmButtonColor: '#0077C0',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = 'index.html';
                });
            }
        });
    },
    
    // Update navbar based on auth state
    updateNavbar: () => {
        const isLoggedIn = Auth.isLoggedIn();
        const user = Auth.getCurrentUser();
        
        const loginBtn = document.querySelector('#login-btn');
        const registerBtn = document.querySelector('#register-btn');
        const userProfile = document.querySelector('#user-profile');
        const userName = document.querySelector('#user-name');
        const logoutBtn = document.querySelector('#logout-btn');
        
        if (isLoggedIn && user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (userProfile) userProfile.style.display = 'flex';
            if (userName) userName.textContent = user.userName;
            if (logoutBtn) logoutBtn.style.display = 'flex';
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-flex';
            if (registerBtn) registerBtn.style.display = 'inline-flex';
            if (userProfile) userProfile.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }
};

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});