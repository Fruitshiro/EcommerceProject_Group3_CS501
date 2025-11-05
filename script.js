// --- 1. Global State and DOM Elements ---
// Uses localStorage for persistent client-side data simulation
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || {};

const loggedOutControls = document.getElementById('logged-out-controls');
const loggedInControls = document.getElementById('logged-in-controls');
const userDisplayName = document.getElementById('user-display-name');
// trackOrderControl element removed
const cartCountElement = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');


// --- 2. Core UI Update Function ---

/**
 * Toggles visibility of navigation elements based on login status.
 */
function updateUI() {
    // 2a. Authentication Controls
    if (currentUser) {
        // Logged In State: SHOW profile/logout
        loggedInControls.style.display = 'flex';
        loggedOutControls.style.display = 'none';
        
        userDisplayName.textContent = `Hi, ${currentUser.name}`;
    } else {
        // Logged Out State: SHOW login/register, HIDE profile/logout
        loggedInControls.style.display = 'none'; 
        loggedOutControls.style.display = 'flex';
        
        userDisplayName.textContent = '';
    }
    
    // 2b. Cart Control (Always runs)
    updateCartCount();
}

// --- 3. Authentication Logic ---

// Handles user registration
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const name = document.getElementById('reg-name').value;

    if (users[email]) {
        alert('Registration failed: Email already exists.');
        return;
    }

    const newUser = {
        name: name,
        email: email,
        password: document.getElementById('reg-password').value,
        address: document.getElementById('reg-address').value
    };

    users[email] = newUser;
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful! You can now log in.');
    
    // Auto-close modal after successful registration
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    registerModal.hide();
});

// Handles user login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const user = users[email];

    if (user && user.password === password) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Hide login modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        
        alert(`Welcome back, ${user.name}!`);
        updateUI();

    } else {
        alert('Login failed: Invalid email or password.');
    }
});

// Handles user logout
document.getElementById('logout-btn').addEventListener('click', function() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart'); 
    cart = [];
    alert('You have been logged out.');
    updateUI();
});


// --- 4. Cart Logic ---

// Updates the small badge number next to the cart icon
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
}

// Renders the list of items inside the cart modal
function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center text-muted py-3">Your cart is empty.</p>';
        cartTotalElement.textContent = '0';
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItemHTML = `
            <div class="list-group-item d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                    <img src="${item.img}" alt="${item.name}" class="rounded me-3" width="60" height="60" style="object-fit: cover;">
                    <div>
                        <h6 class="mb-0 fw-bold">${item.name}</h6>
                        <small class="text-muted">₱${item.price}.00 x ${item.quantity}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <span class="fw-bold me-3">₱${itemTotal}.00</span>
                    <button class="btn btn-sm btn-danger remove-from-cart" data-index="${index}">
                        &times;
                    </button>
                </div>
            </div>
        `;
        cartItemsContainer.innerHTML += cartItemHTML;
    });

    cartTotalElement.textContent = total.toFixed(2);
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Attaches event listeners for all "Add to Cart" buttons
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        if (!currentUser) {
            alert('Please log in or register to add items to your cart.');
            // Automatically open login modal if user tries to add to cart
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }

        const name = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        const img = this.getAttribute('data-img');

        const existingItemIndex = cart.findIndex(item => item.name === name);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ name, price, img, quantity: 1 });
        }

        updateCartCount();
        alert(`${name} added to cart!`);
    });
});

// Event delegation for cart item actions (e.g., remove)
document.getElementById('cart-items').addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-from-cart')) {
        const index = e.target.getAttribute('data-index');
        cart.splice(index, 1);
        renderCart();
        updateCartCount();
    }
});

// Clears the entire cart
document.getElementById('clear-cart').addEventListener('click', function() {
    cart = [];
    renderCart();
    updateCartCount();
});

// "Buy Now" (Checkout) Simulation
document.getElementById('buy-now').addEventListener('click', function() {
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        return;
    }
    
    // Simulate order placement and clear the cart
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    alert(`Checkout successful! You have purchased ${cart.length} item(s) for ₱${total.toFixed(2)}. Your order is now being processed.`);
    
    // Close cart modal
    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    cartModal.hide();

    cart = [];
    renderCart();
    updateCartCount();
});

// Update cart content whenever the modal is shown
document.getElementById('cartModal').addEventListener('show.bs.modal', renderCart);


// --- 5. Initialization ---

// Run UI update when the script first loads to set the correct control visibility
updateUI();