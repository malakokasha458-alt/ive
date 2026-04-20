// ============================================
// MAIN.JS - Core Application Logic
// ============================================

// Global State
let allCourses = [];
let currentUser = null;

// DOM Elements
const DOM = {
    // Navigation
    navbar: document.querySelector('.navbar'),
    userProfile: document.querySelector('#user-profile'),
    userName: document.querySelector('#user-name'),
    logoutBtn: document.querySelector('#logout-btn'),
    cartCounter: document.querySelector('#cart-counter'),
    
    // Course Display
    coursesContainer: document.querySelector('#courses-container'),
    searchInput: document.querySelector('#search-input'),
    
    // Auth Links
    loginBtn: document.querySelector('#login-btn'),
    registerBtn: document.querySelector('#register-btn')
};

// ============================================
// Utility Functions
// ============================================

const Utils = {
    // Format price
    formatPrice: (price) => `$${parseFloat(price).toFixed(2)}`,
    
    // Generate rating stars
    renderStars: (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
        if (halfStar) stars += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
        
        return stars;
    },
    
    // Debounce function for search
    debounce: (func, delay) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, delay);
        };
    },
    
    // Show notification
    showNotification: (message, type = 'success') => {
        Swal.fire({
            text: message,
            icon: type,
            confirmButtonColor: '#0077C0',
            timer: 2000,
            showConfirmButton: false
        });
    }
};

// ============================================
// Authentication Functions
// ============================================

const Auth = {
    // Check if user is logged in
    isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',
    
    // Get current user
    getCurrentUser: () => {
        const user = localStorage.getItem('registeredUser');
        return user ? JSON.parse(user) : null;
    },
    
    // Update UI based on auth state
    updateUI: () => {
        const isLoggedIn = Auth.isLoggedIn();
        const user = Auth.getCurrentUser();
        
        if (isLoggedIn && user) {
            // Show user profile
            if (DOM.userName) DOM.userName.textContent = user.userName;
            if (DOM.userProfile) DOM.userProfile.style.display = 'flex';
            if (DOM.loginBtn) DOM.loginBtn.style.display = 'none';
            if (DOM.registerBtn) DOM.registerBtn.style.display = 'none';
            if (DOM.logoutBtn) DOM.logoutBtn.style.display = 'flex';
        } else {
            // Show auth buttons
            if (DOM.userProfile) DOM.userProfile.style.display = 'none';
            if (DOM.loginBtn) DOM.loginBtn.style.display = 'inline-flex';
            if (DOM.registerBtn) DOM.registerBtn.style.display = 'inline-flex';
            if (DOM.logoutBtn) DOM.logoutBtn.style.display = 'none';
        }
    },
    
    // Logout
    logout: () => {
        localStorage.setItem('isLoggedIn', 'false');
        Utils.showNotification('Logged out successfully!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
};

// ============================================
// Cart Functions
// ============================================

const Cart = {
    // Get cart items
    getItems: () => JSON.parse(localStorage.getItem('cart')) || [],
    
    // Save cart
    save: (cart) => localStorage.setItem('cart', JSON.stringify(cart)),
    
    // Add course to cart
    add: (course) => {
        const cart = Cart.getItems();
        const exists = cart.find(item => item.id === course.id);
        
        if (exists) {
            Utils.showNotification('Course already in cart!', 'info');
            return false;
        }
        
        cart.push(course);
        Cart.save(cart);
        Cart.updateCounter();
        Utils.showNotification('Course added to cart!');
        return true;
    },
    
    // Remove from cart
    remove: (index) => {
        const cart = Cart.getItems();
        cart.splice(index, 1);
        Cart.save(cart);
        Cart.updateCounter();
        Utils.showNotification('Course removed from cart', 'info');
        return cart;
    },
    
    // Update cart counter in navbar
    updateCounter: () => {
        const count = Cart.getItems().length;
        if (DOM.cartCounter) DOM.cartCounter.textContent = count;
    },
    
    // Calculate totals
    calculateTotals: () => {
        const items = Cart.getItems();
        const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
        const fee = subtotal > 0 ? 12 : 0;
        const discount = subtotal > 0 ? 25 : 0;
        const total = subtotal + fee - discount;
        
        return { subtotal, fee, discount, total };
    }
};

// ============================================
// Course Functions
// ============================================

const CourseAPI = {
    // Fetch courses from API
    fetchAll: async () => {
        try {
            const response = await fetch('https://raw.githubusercontent.com/hagerr55/courses-data/main/courses.json');
            const data = await response.json();
            allCourses = data.courses;
            return allCourses;
        } catch (error) {
            console.error('Error fetching courses:', error);
            return [];
        }
    },
    
    // Get course by ID
    getById: (id) => allCourses.find(course => course.id === parseInt(id)),
    
    // Search courses
    search: (query) => {
        const term = query.toLowerCase();
        return allCourses.filter(course => 
            course.title.toLowerCase().includes(term) ||
            course.shortDescription.toLowerCase().includes(term) ||
            course.level.toLowerCase().includes(term)
        );
    }
};

// ============================================
// UI Rendering Functions
// ============================================

const UI = {
    // Render course cards
    renderCourses: (courses) => {
        if (!DOM.coursesContainer) return;
        
        if (!courses.length) {
            DOM.coursesContainer.innerHTML = `
                <div class="text-center p-5">
                    <p>No courses found. Please try a different search.</p>
                </div>
            `;
            return;
        }
        
        DOM.coursesContainer.innerHTML = courses.map(course => `
            <div class="course-card" onclick="window.location.href='details.html?id=${course.id}'">
                <img src="${course.mainImage}" alt="${course.title}" class="course-image">
                <div class="course-info">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description">${course.shortDescription}</p>
                    <div class="course-meta">
                        <span class="course-level">${course.level}</span>
                        <div class="rating">
                            ${Utils.renderStars(course.rating.rate)}
                            <span>(${course.rating.rate})</span>
                        </div>
                        <span class="course-duration">⏱ ${course.duration}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    // Render cart items
    renderCart: () => {
        const container = document.querySelector('#cart-items-container');
        if (!container) return;
        
        const cart = Cart.getItems();
        
        if (!cart.length) {
            container.innerHTML = `
                <div class="text-center p-5">
                    <p>Your cart is empty. Start shopping!</p>
                    <a href="index.html" class="btn btn-primary mt-3">Browse Courses</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.mainImage}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-meta">${item.level} • ${item.duration}</p>
                </div>
                <div class="cart-item-price">${Utils.formatPrice(item.price)}</div>
                <i class="fas fa-trash-alt delete-item" onclick="Cart.remove(${index})"></i>
            </div>
        `).join('');
        
        UI.updateCartSummary();
    },
    
    // Update cart summary
    updateCartSummary: () => {
        const totals = Cart.calculateTotals();
        
        const subtotalEl = document.querySelector('#subtotal');
        const feeEl = document.querySelector('#fee');
        const discountEl = document.querySelector('#discount');
        const totalEl = document.querySelector('#total');
        
        if (subtotalEl) subtotalEl.textContent = Utils.formatPrice(totals.subtotal);
        if (feeEl) feeEl.textContent = Utils.formatPrice(totals.fee);
        if (discountEl) discountEl.textContent = `-${Utils.formatPrice(totals.discount)}`;
        if (totalEl) totalEl.textContent = Utils.formatPrice(totals.total);
    },
    
    // Render profile activities
    renderProfile: () => {
        const activities = JSON.parse(localStorage.getItem('activities')) || [];
        const container = document.querySelector('#activities-container');
        const user = Auth.getCurrentUser();
        
        if (user) {
            const userNameEl = document.querySelector('#profile-user-name');
            const userEmailEl = document.querySelector('#profile-user-email');
            if (userNameEl) userNameEl.textContent = user.userName;
            if (userEmailEl) userEmailEl.textContent = user.email;
        }
        
        if (!container) return;
        
        if (!activities.length) {
            container.innerHTML = '<p class="text-center">No activities yet. Start learning!</p>';
            return;
        }
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-info">
                    <img src="${activity.mainImage}" alt="${activity.title}" class="activity-icon">
                    <div>
                        <h4>${activity.title}</h4>
                        <small>${activity.date}</small>
                    </div>
                </div>
                <span class="activity-status">${activity.status}</span>
            </div>
        `).join('');
    }
};

// ============================================
// Event Handlers
// ============================================

const EventHandlers = {
    // Handle search input
    handleSearch: Utils.debounce((e) => {
        const query = e.target.value;
        const filtered = CourseAPI.search(query);
        UI.renderCourses(filtered);
    }, 300),
    
    // Handle checkout
    handleCheckout: () => {
        const cart = Cart.getItems();
        
        if (!cart.length) {
            Utils.showNotification('Your cart is empty!', 'warning');
            return;
        }
        
        if (Auth.isLoggedIn()) {
            window.location.href = 'payment.html';
        } else {
            Swal.fire({
                title: 'Login Required',
                text: 'Please login to complete your purchase',
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#0077C0',
                confirmButtonText: 'Login Now',
                cancelButtonText: 'Later'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'login.html';
                }
            });
        }
    }
};

// ============================================
// Navigation Active Link
// ============================================

const setActiveNavLink = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-links a');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else if (currentPage === 'index.html' && href === './index.html') {
            link.classList.add('active');
        }
    });
};

// ============================================
// Initialize Application
// ============================================

const init = async () => {
    // Set active nav link
    setActiveNavLink();
    
    // Update auth UI
    Auth.updateUI();
    
    // Update cart counter
    Cart.updateCounter();
    
    // Load courses if on homepage
    if (DOM.coursesContainer) {
        await CourseAPI.fetchAll();
        UI.renderCourses(allCourses);
        
        // Add search listener
        if (DOM.searchInput) {
            DOM.searchInput.addEventListener('input', EventHandlers.handleSearch);
        }
    }
    
    // Render cart if on cart page
    if (document.querySelector('#cart-items-container')) {
        UI.renderCart();
    }
    
    // Render profile if on profile page
    if (document.querySelector('#activities-container')) {
        UI.renderProfile();
    }
    
    // Add checkout listener
    const checkoutBtn = document.querySelector('#checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', EventHandlers.handleCheckout);
    }
    
    // Add logout listener
    if (DOM.logoutBtn) {
        DOM.logoutBtn.addEventListener('click', Auth.logout);
    }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);



// Add to existing Utils object
Utils.formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

Utils.generateOrderId = () => {
    return 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
};

// Add to Cart object
Cart.getTotalItems = () => {
    return Cart.getItems().length;
};

Cart.getSubtotal = () => {
    return Cart.getItems().reduce((sum, item) => sum + (item.price || 0), 0);
};

// Add to Auth object (if not exists)
Auth.updateNavbar = () => {
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
};

// Override the existing init function to include Auth.updateNavbar
const originalInit = init;
window.init = async () => {
    await originalInit();
    Auth.updateNavbar();
};

// ============================================
// UPDATE NAVBAR ON ALL PAGES
// ============================================

// Function to update navbar based on auth state
function updateNavbarAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let user = null;
    
    try {
        const userData = localStorage.getItem('registeredUser');
        if (userData) {
            user = JSON.parse(userData);
        }
    } catch (e) {
        console.error('Error parsing user data:', e);
    }
    
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

// Update cart counter
function updateCartCounter() {
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        cart = [];
    }
    const counter = document.querySelector('#cart-counter');
    if (counter) {
        counter.textContent = cart.length;
    }
}

// Call update functions on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavbarAuth();
    updateCartCounter();
    
    // Setup logout button if exists
    const logoutBtn = document.querySelector('#logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('currentUserEmail');
            window.location.href = 'index.html';
        });
    }
});