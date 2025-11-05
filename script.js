document.addEventListener('DOMContentLoaded', () => {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  const cartCount = document.getElementById('cart-count');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const clearCartBtn = document.getElementById('clear-cart');
  const buyNowBtn = document.getElementById('buy-now');
  const cartBtn = document.getElementById('cart-btn');
  const cartModalElement = document.getElementById('cartModal');
  const cartModal = new bootstrap.Modal(cartModalElement);

  let cart = [];

// Add item to cart
addToCartButtons.forEach(button => {
  button.addEventListener('click', () => {
    const name = button.dataset.name;
    const price = parseFloat(button.dataset.price);
    const img = button.dataset.img;

    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
      existingItem.qty++;
    } else {
      cart.push({ name, price, img, qty: 1 });
    }

    updateCartUI();

    // 🔹 Change button text to show feedback
    button.textContent = "Added ✅";
    button.disabled = true;

    // Option 1️⃣ (temporary): revert after 1.5s
    setTimeout(() => {
      button.textContent = "Add to Cart 🛒";
      button.disabled = false;
    }, 1500);
  });
});


  // Open cart modal
  cartBtn.addEventListener('click', () => {
    cartModal.show();
  });

  // Update cart UI
  function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
      total += item.price * item.qty;
      count += item.qty;

      const itemDiv = document.createElement('div');
      itemDiv.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-between');

      itemDiv.innerHTML = `
        <div class="d-flex align-items-center">
          <img src="${item.img}" alt="${item.name}">
          <div>
            <h6 class="mb-1 fw-bold">${item.name}</h6>
            <small>₱${item.price}.00 × ${item.qty}</small>
          </div>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-secondary me-2" data-index="${index}" data-action="minus">−</button>
          <button class="btn btn-sm btn-outline-secondary me-2" data-index="${index}" data-action="plus">＋</button>
          <button class="btn btn-sm btn-danger" data-index="${index}" data-action="remove">🗑️</button>
        </div>
      `;

      cartItemsContainer.appendChild(itemDiv);
    });

    cartCount.textContent = count;
    cartTotal.textContent = total.toFixed(2);

    // Attach events for +, -, remove
    document.querySelectorAll('#cart-items button').forEach(btn => {
      const index = parseInt(btn.dataset.index);
      const action = btn.dataset.action;

      btn.addEventListener('click', () => {
        if (action === 'minus') changeQty(index, -1);
        if (action === 'plus') changeQty(index, 1);
        if (action === 'remove') removeItem(index);
      });
    });
  }

  // Change quantity
  function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    updateCartUI();
  }

  // Remove item
  function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
  }

  // Clear cart
  clearCartBtn.addEventListener('click', () => {
    cart = [];
    updateCartUI();
  });

  // Buy now
  buyNowBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    alert('✅ Thank you for your purchase!');
    cart = [];
    updateCartUI();
    cartModal.hide();
  });
});
