// ============================================
// PAYMENT.JS - Complete Payment Processing Logic
// ============================================

// Payment Module
const Payment = {
    selectedMethod: 'card',
    isProcessing: false,
    
    // Payment methods configuration
    methods: {
        card: {
            name: 'Credit/Debit Card',
            icon: 'fas fa-credit-card',
            fields: ['cardNumber', 'expiryDate', 'cvv', 'cardholderName']
        },
        wallet: {
            name: 'Mobile Wallet',
            icon: 'fas fa-mobile-alt',
            fields: ['walletNumber', 'mobileNumber']
        }
    },
    
    // Initialize payment page
    init: () => {
        // Check if user is logged in
        if (!Auth.isLoggedIn()) {
            sessionStorage.setItem('redirectAfterLogin', 'payment.html');
            window.location.href = 'login.html';
            return;
        }
        
        // Check if cart has items
        const cart = Cart.getItems();
        if (cart.length === 0) {
            window.location.href = 'cart.html';
            return;
        }
        
        // Load order summary
        Payment.loadOrderSummary();
        
        // Set default active payment method
        const defaultMethod = document.querySelector('.payment-method[data-method="card"]');
        if (defaultMethod) defaultMethod.classList.add('active');
        
        // Setup event listeners
        Payment.setupEventListeners();
        
        // Format input fields
        Payment.setupInputFormatting();
    },
    
    // Setup event listeners
    setupEventListeners: () => {
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', () => {
                const methodType = method.dataset.method;
                Payment.selectMethod(methodType);
            });
        });
        
        // Real-time validation
        const inputs = ['#payment-number', '#expiry-date', '#cvv', '#cardholder-name', '#mobile-number'];
        inputs.forEach(selector => {
            const input = document.querySelector(selector);
            if (input) {
                input.addEventListener('input', (e) => {
                    Payment.validateField(e.target);
                });
            }
        });
        
        // Prevent form submission on enter
        const form = document.querySelector('#payment-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                Payment.processPayment();
            });
        }
    },
    
    // Setup input formatting
    setupInputFormatting: () => {
        // Format card number
        const cardNumberInput = document.querySelector('#payment-number');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 16) value = value.slice(0, 16);
                value = value.replace(/(\d{4})/g, '$1 ').trim();
                e.target.value = value;
                Payment.detectCardType(value);
            });
        }
        
        // Format expiry date
        const expiryInput = document.querySelector('#expiry-date');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                e.target.value = value;
            });
        }
        
        // Format CVV
        const cvvInput = document.querySelector('#cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 4) value = value.slice(0, 4);
                e.target.value = value;
            });
        }
        
        // Format mobile number
        const mobileInput = document.querySelector('#mobile-number');
        if (mobileInput) {
            mobileInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.slice(0, 11);
                e.target.value = value;
            });
        }
    },
    
    // Detect card type based on number
    detectCardType: (cardNumber) => {
        const cleanNumber = cardNumber.replace(/\s/g, '');
        let cardType = 'unknown';
        
        if (cleanNumber.startsWith('4')) {
            cardType = 'visa';
        } else if (cleanNumber.startsWith('5')) {
            cardType = 'mastercard';
        } else if (cleanNumber.startsWith('3')) {
            cardType = 'amex';
        } else if (cleanNumber.startsWith('6')) {
            cardType = 'discover';
        }
        
        // Update UI to show card type
        const cardIcons = document.querySelectorAll('.payment-method');
        cardIcons.forEach(icon => {
            if (icon.dataset.method === 'card') {
                if (cardType !== 'unknown') {
                    icon.style.opacity = '1';
                }
            }
        });
        
        return cardType;
    },
    
    // Select payment method
    selectMethod: (method) => {
        Payment.selectedMethod = method;
        
        // Update UI
        document.querySelectorAll('.payment-method').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector(`.payment-method[data-method="${method}"]`).classList.add('active');
        
        // Show/hide fields based on method
        const cardFields = document.querySelector('#card-fields');
        const walletFields = document.querySelector('#wallet-fields');
        const paymentNumberLabel = document.querySelector('#payment-number')?.previousElementSibling;
        const paymentNumberInput = document.querySelector('#payment-number');
        
        if (method === 'wallet') {
            if (cardFields) cardFields.style.display = 'none';
            if (walletFields) walletFields.style.display = 'block';
            if (paymentNumberLabel) paymentNumberLabel.textContent = 'Wallet Number';
            if (paymentNumberInput) paymentNumberInput.placeholder = 'Enter wallet number';
        } else {
            if (cardFields) cardFields.style.display = 'block';
            if (walletFields) walletFields.style.display = 'none';
            if (paymentNumberLabel) paymentNumberLabel.textContent = 'Card Number';
            if (paymentNumberInput) paymentNumberInput.placeholder = 'Enter card number';
        }
        
        // Clear validation errors
        Payment.clearValidationErrors();
    },
    
    // Validate individual field
    validateField: (input) => {
        const id = input.id;
        let isValid = true;
        let errorMessage = '';
        
        switch(id) {
            case 'payment-number':
                const cardNumber = input.value.replace(/\s/g, '');
                if (Payment.selectedMethod === 'card') {
                    if (cardNumber.length < 13 || cardNumber.length > 19) {
                        isValid = false;
                        errorMessage = 'Card number must be 13-19 digits';
                    } else if (!Payment.luhnCheck(cardNumber)) {
                        isValid = false;
                        errorMessage = 'Invalid card number';
                    }
                } else {
                    if (cardNumber.length < 8) {
                        isValid = false;
                        errorMessage = 'Wallet number must be at least 8 digits';
                    }
                }
                break;
                
            case 'expiry-date':
                if (Payment.selectedMethod === 'card') {
                    const expiry = input.value;
                    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
                        isValid = false;
                        errorMessage = 'Use format MM/YY';
                    } else {
                        const [month, year] = expiry.split('/');
                        const currentDate = new Date();
                        const currentYear = currentDate.getFullYear() % 100;
                        const currentMonth = currentDate.getMonth() + 1;
                        
                        if (month < 1 || month > 12) {
                            isValid = false;
                            errorMessage = 'Invalid month';
                        } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                            isValid = false;
                            errorMessage = 'Card has expired';
                        }
                    }
                }
                break;
                
            case 'cvv':
                if (Payment.selectedMethod === 'card') {
                    const cvv = input.value;
                    if (cvv.length < 3 || cvv.length > 4) {
                        isValid = false;
                        errorMessage = 'CVV must be 3-4 digits';
                    }
                }
                break;
                
            case 'cardholder-name':
                if (Payment.selectedMethod === 'card') {
                    const name = input.value.trim();
                    if (name.length < 2) {
                        isValid = false;
                        errorMessage = 'Enter cardholder name';
                    }
                }
                break;
                
            case 'mobile-number':
                if (Payment.selectedMethod === 'wallet') {
                    const mobile = input.value;
                    if (mobile.length < 10) {
                        isValid = false;
                        errorMessage = 'Enter valid mobile number';
                    }
                }
                break;
        }
        
        // Update UI
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            const existingError = formGroup.querySelector('.error-message');
            if (!isValid) {
                input.classList.add('error');
                if (!existingError) {
                    const errorSpan = document.createElement('span');
                    errorSpan.className = 'error-message';
                    errorSpan.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 5px; display: block;';
                    errorSpan.textContent = errorMessage;
                    formGroup.appendChild(errorSpan);
                } else {
                    existingError.textContent = errorMessage;
                }
            } else {
                input.classList.remove('error');
                if (existingError) existingError.remove();
            }
        }
        
        return isValid;
    },
    
    // Luhn algorithm for card validation
    luhnCheck: (cardNumber) => {
        let sum = 0;
        let isEven = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i), 10);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return (sum % 10) === 0;
    },
    
    // Clear all validation errors
    clearValidationErrors: () => {
        document.querySelectorAll('.error-message').forEach(error => error.remove());
        document.querySelectorAll('.form-input.error').forEach(input => input.classList.remove('error'));
    },
    
    // Validate all fields before submission
    validateAllFields: () => {
        let isValid = true;
        
        if (Payment.selectedMethod === 'card') {
            const fields = ['payment-number', 'expiry-date', 'cvv', 'cardholder-name'];
            fields.forEach(fieldId => {
                const input = document.querySelector(`#${fieldId}`);
                if (input && !Payment.validateField(input)) {
                    isValid = false;
                }
            });
        } else {
            const fields = ['payment-number', 'mobile-number'];
            fields.forEach(fieldId => {
                const input = document.querySelector(`#${fieldId}`);
                if (input && input.parentElement.style.display !== 'none') {
                    if (!Payment.validateField(input)) isValid = false;
                }
            });
        }
        
        return isValid;
    },
    
    // Load order summary
    loadOrderSummary: () => {
        const cart = Cart.getItems();
        const container = document.querySelector('#order-items');
        const totalEl = document.querySelector('#payment-total');
        
        if (!container) return;
        
        if (cart.length === 0) {
            window.location.href = 'cart.html';
            return;
        }
        
        container.innerHTML = cart.map(item => `
            <div class="order-item">
                <div class="order-item-info">
                    <span class="order-item-title">${item.title}</span>
                    <span class="order-item-level">${item.level}</span>
                </div>
                <span class="order-item-price">${Utils.formatPrice(item.price)}</span>
            </div>
        `).join('');
        
        const totals = Cart.calculateTotals();
        if (totalEl) totalEl.textContent = Utils.formatPrice(totals.total);
        
        // Also update the payment total in the order summary
        const paymentTotal = document.querySelector('#payment-total-display');
        if (paymentTotal) paymentTotal.textContent = Utils.formatPrice(totals.total);
    },
    
    // Process payment
    processPayment: async () => {
        // Prevent multiple submissions
        if (Payment.isProcessing) return;
        
        // Validate all fields
        if (!Payment.validateAllFields()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please check all fields and try again.',
                confirmButtonColor: '#0077C0'
            });
            return;
        }
        
        Payment.isProcessing = true;
        
        // Show loading state
        const payButton = document.querySelector('.pay-btn');
        const originalButtonText = payButton.innerHTML;
        payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        payButton.disabled = true;
        
        // Simulate payment processing (API call)
        await Payment.simulatePaymentAPI();
        
        // Complete purchase
        Payment.completePurchase();
        
        // Reset button
        payButton.innerHTML = originalButtonText;
        payButton.disabled = false;
        Payment.isProcessing = false;
    },
    
    // Simulate payment API (for demo)
    simulatePaymentAPI: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 2000);
        });
    },
    
    // Complete purchase after successful payment
    completePurchase: () => {
        const cart = Cart.getItems();
        
        if (cart.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Cart Empty',
                text: 'Your cart is empty. Please add courses before proceeding.',
                confirmButtonColor: '#0077C0'
            }).then(() => {
                window.location.href = 'index.html';
            });
            return;
        }
        
        // Get existing activities
        let activities = JSON.parse(localStorage.getItem('activities')) || [];
        
        // Add purchased courses to activities
        cart.forEach(course => {
            activities.unshift({
                id: course.id,
                title: course.title,
                price: course.price,
                mainImage: course.mainImage,
                level: course.level,
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                status: 'Completed',
                orderId: 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase()
            });
        });
        
        // Save activities
        localStorage.setItem('activities', JSON.stringify(activities));
        
        // Get my courses (for profile)
        let myCourses = JSON.parse(localStorage.getItem('myCourses')) || [];
        myCourses.push(...cart);
        localStorage.setItem('myCourses', JSON.stringify(myCourses));
        
        // Clear cart
        localStorage.removeItem('cart');
        Cart.updateCounter();
        
        // Get payment details for receipt
        const paymentDetails = Payment.getPaymentDetails();
        
        // Show success message with receipt
        Swal.fire({
            icon: 'success',
            title: 'Payment Successful! 🎉',
            html: `
                <div style="text-align: left; margin-top: 20px;">
                    <p><strong>Order Summary:</strong></p>
                    ${cart.map(course => `<p>• ${course.title} - ${Utils.formatPrice(course.price)}</p>`).join('')}
                    <hr>
                    <p><strong>Total Paid:</strong> ${Utils.formatPrice(Cart.calculateTotals().total)}</p>
                    <p><strong>Payment Method:</strong> ${Payment.methods[Payment.selectedMethod].name}</p>
                    <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
                    <p><strong>Date:</strong> ${paymentDetails.date}</p>
                </div>
            `,
            confirmButtonColor: '#0077C0',
            confirmButtonText: 'Go to My Profile',
            showCancelButton: true,
            cancelButtonText: 'Continue Shopping',
            cancelButtonColor: '#6c757d'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'profile.html';
            } else {
                window.location.href = 'index.html';
            }
        });
    },
    
    // Get payment details for receipt
    getPaymentDetails: () => {
        const now = new Date();
        return {
            transactionId: 'TXN-' + Math.random().toString(36).substr(2, 10).toUpperCase(),
            date: now.toLocaleString('en-US'),
            method: Payment.selectedMethod,
            status: 'successful'
        };
    },
    
    // Apply promo code (optional feature)
    applyPromoCode: (code) => {
        const promoCodes = {
            'WELCOME20': { discount: 20, type: 'percentage' },
            'SAVE50': { discount: 50, type: 'fixed' },
            'GROWTH2024': { discount: 25, type: 'fixed' }
        };
        
        const promo = promoCodes[code.toUpperCase()];
        
        if (!promo) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Code',
                text: 'The promo code you entered is invalid or expired.',
                confirmButtonColor: '#0077C0'
            });
            return false;
        }
        
        const totals = Cart.calculateTotals();
        let discountAmount = promo.type === 'percentage' 
            ? (totals.subtotal * promo.discount / 100)
            : promo.discount;
        
        // Save discount to localStorage for summary
        localStorage.setItem('promoDiscount', discountAmount);
        
        Swal.fire({
            icon: 'success',
            title: 'Code Applied!',
            text: `You saved ${Utils.formatPrice(discountAmount)}!`,
            confirmButtonColor: '#0077C0'
        });
        
        // Refresh order summary
        Payment.loadOrderSummary();
        
        return true;
    }
};

// Initialize payment page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Payment.init();
});