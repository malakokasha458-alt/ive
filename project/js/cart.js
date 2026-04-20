// ============================================
// CART-PAGE.JS - Shopping Cart Page Logic
// ============================================

// Render cart items (overrides the main UI.renderCart)
const CartPage = {
    // Render cart items with delete functionality
    renderCartItems: () => {
        const container = document.querySelector('#cart-items-container');
        if (!container) return;
        
        const cart = Cart.getItems();
        
        if (!cart.length) {
            container.innerHTML = `
                <div class="text-center p-5">
                    <i class="fas fa-shopping-cart" style="font-size: 48px; color: var(--text-light); margin-bottom: 20px;"></i>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added any courses yet.</p>
                    <a href="index.html" class="btn btn-primary mt-3">Browse Courses</a>
                </div>
            `;
            // Update summary to show zeros
            CartPage.updateSummary();
            return;
        }
        
        container.innerHTML = cart.map((item, index) => `
            <div class="cart-item" data-index="${index}" id="cart-item-${index}">
                <img src="${item.mainImage}" alt="${item.title}" class="cart-item-image" onerror="this.src='./imges/img2.jpg'">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-meta">
                        <span class="course-level">${item.level}</span>
                        <span>•</span>
                        <span>⏱ ${item.duration}</span>
                        <span>•</span>
                        <span>👨‍🏫 ${item.instructor?.name || 'Expert'}</span>
                    </p>
                </div>
                <div class="cart-item-price">${Utils.formatPrice(item.price)}</div>
                <i class="fas fa-trash-alt delete-item" onclick="CartPage.removeItem(${index})" style="cursor: pointer;"></i>
            </div>
        `).join('');
        
        CartPage.updateSummary();
    },
    
    // Remove item from cart - WITHOUT PAGE RELOAD
    removeItem: (index) => {
        Swal.fire({
            title: 'Remove Course?',
            text: 'Are you sure you want to remove this course from your cart?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#0077C0',
            confirmButtonText: 'Yes, Remove',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // Get current cart
                let cart = Cart.getItems();
                
                // Remove item at index
                cart.splice(index, 1);
                
                // Save to localStorage
                Cart.save(cart);
                
                // Update cart counter in navbar
                Cart.updateCounter();
                
                // Re-render cart items (this will update the UI without reload)
                CartPage.renderCartItems();
                
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Removed!',
                    text: 'Course has been removed from your cart.',
                    confirmButtonColor: '#0077C0',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    },
    
    // Update order summary dynamically
    updateSummary: () => {
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
    
    // Handle checkout
    handleCheckout: () => {
        const cart = Cart.getItems();
        
        if (!cart.length) {
            Swal.fire({
                icon: 'warning',
                title: 'Cart is Empty',
                text: 'Please add some courses before proceeding to checkout.',
                confirmButtonColor: '#0077C0'
            });
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
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Login Now',
                cancelButtonText: 'Later'
            }).then((result) => {
                if (result.isConfirmed) {
                    sessionStorage.setItem('redirectAfterLogin', 'payment.html');
                    window.location.href = 'login.html';
                }
            });
        }
    }
};

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
    CartPage.renderCartItems();
    
    const checkoutBtn = document.querySelector('#checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', CartPage.handleCheckout);
    }
});