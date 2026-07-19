const API_BASE_URL = window.location.origin;

// Global Cart State
let cart = [];

// Determine current category based on Page title or path
const isBurgerPage = document.title.toLowerCase().includes('burger');
const category = isBurgerPage ? 'burger' : 'pizza';

// DOM Elements
const menuCardsContainer = document.getElementById('menu-cards-container');
const floatingCart = document.getElementById('floatingCart');
const cartBadge = document.getElementById('cartBadge');

// Modal Elements
const customizeModal = document.getElementById('customizeModal');
const customizeItemName = document.getElementById('customizeItemName');
const customizedPrice = document.getElementById('customizedPrice');
const closeCustomizeBtn = document.getElementById('closeCustomizeBtn');
const confirmAddCartBtn = document.getElementById('confirmAddCartBtn');

// Choice Selection fields
const breadRadioName = isBurgerPage ? 'bunSelection' : 'crustSelection';

// State for item currently being customized
let activeItem = null;

// Toggle Navbar hamburger menu
const menu = document.querySelector('.menu');
const navbar = document.querySelector('.navbar');

if (menu && navbar) {
  menu.addEventListener('click', () => {
    menu.classList.toggle('change');
    navbar.classList.toggle('change');
  });
}

// 1. LOAD CART FROM LOCAL STORAGE
function loadCart() {
  const stored = localStorage.getItem('spice_cart');
  if (stored) {
    try {
      cart = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing cart from localStorage:', e);
      cart = [];
    }
  } else {
    cart = [];
  }
  updateBadge();
}

function saveCart() {
  localStorage.setItem('spice_cart', JSON.stringify(cart));
  updateBadge();
}

function updateBadge() {
  if (cartBadge) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
  }
}

// 2. FETCH MENU ITEMS DYNAMICALLY BY CATEGORY
async function fetchMenuItems() {
  try {
    if (!menuCardsContainer) return;
    menuCardsContainer.innerHTML = '<div style="color: #a79a2d; font-size: 2rem; width: 100%; text-align: center; padding: 5rem 0;"><i class="fas fa-spinner fa-spin"></i> Loading Gourmet Selections...</div>';

    const response = await fetch(`${API_BASE_URL}/api/menu?category=${category}`);
    const data = await response.json();

    if (response.ok && data.success) {
      menuCardsContainer.innerHTML = '';
      if (data.items.length === 0) {
        menuCardsContainer.innerHTML = `<div style="color: #aaa; font-size: 2rem; width: 100%; text-align: center; padding: 5rem 0;">No ${category} items found in database.</div>`;
        return;
      }

      data.items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-wrapper';
        card.innerHTML = `
          <div class="card">
            <div class="card-img-wrapper">
              <img src="${item.imageUrl || 'images/card-img-1.png'}" class="card-img" alt="${item.name}" />
            </div>
            <div class="card-details">
              <h3 class="card-name">${item.name}</h3>
              <p class="card-description">${item.description || 'Artisan handcrafted recipe cooked fresh on order.'}</p>
              <div class="card-price">₹${item.price}</div>
              <div class="card-actions">
                <button class="card-btn add-to-cart-btn" data-id="${item._id}" data-name="${item.name}" data-price="${item.price}" data-image="${item.imageUrl}">
                  Add to Cart
                </button>
                <button class="card-btn order-now-btn" data-id="${item._id}" data-name="${item.name}" data-price="${item.price}" data-image="${item.imageUrl}">
                  Order Now
                </button>
              </div>
            </div>
          </div>
        `;
        menuCardsContainer.appendChild(card);
      });

      // Wire button listeners to open Customization Modal
      document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          openCustomizer(btn.dataset.id, btn.dataset.name, Number(btn.dataset.price), btn.dataset.image, false);
        });
      });

      document.querySelectorAll('.order-now-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          openCustomizer(btn.dataset.id, btn.dataset.name, Number(btn.dataset.price), btn.dataset.image, true);
        });
      });
    } else {
      menuCardsContainer.innerHTML = '<div style="color: red; font-size: 2rem; width: 100%; text-align: center; padding: 5rem 0;">Error fetching menu.</div>';
    }
  } catch (err) {
    console.error('Fetch category menu error:', err);
    menuCardsContainer.innerHTML = '<div style="color: red; font-size: 2rem; width: 100%; text-align: center; padding: 5rem 0;">Connection failed.</div>';
  }
}

// 3. CUSTOMIZATION MODAL TRIGGER
function openCustomizer(id, name, price, image, autoRedirect) {
  activeItem = { id, name, price, image, autoRedirect };

  // Set Modal title
  if (customizeItemName) {
    customizeItemName.textContent = `Customize ${name}`;
  }

  // Reset choices
  const radios = document.querySelectorAll(`input[name="${breadRadioName}"]`);
  if (radios.length > 0) {
    radios.forEach((r, idx) => {
      r.checked = idx === 0;
      r.closest('.choice-card').classList.toggle('active', idx === 0);
    });
  }

  const checkboxes = document.querySelectorAll('input[name="toppingSelection"]');
  checkboxes.forEach(c => {
    c.checked = false;
    c.closest('.topping-item').classList.remove('active');
  });

  // Calculate and show default price
  calculateAdjustedPrice();

  // Open modal
  if (customizeModal) {
    customizeModal.classList.add('active');
  }
}

// 4. PRICE CALCULATION & SELECTORS LOGIC
function calculateAdjustedPrice() {
  if (!activeItem) return 0;

  let extraCost = 0;

  // Bun/Crust pricing addition
  const selectedBread = document.querySelector(`input[name="${breadRadioName}"]:checked`);
  if (selectedBread) {
    const breadVal = selectedBread.value;
    if (breadVal.includes('Flat Wheat') || breadVal.includes('Thin Crust')) {
      extraCost += isBurgerPage ? 10 : 20;
    } else if (breadVal.includes('Lettuce Wrap') || breadVal.includes('Cheese-Burst')) {
      extraCost += isBurgerPage ? 20 : 50;
    }
  }

  // Toppings pricing addition
  const checkedToppings = document.querySelectorAll('input[name="toppingSelection"]:checked');
  checkedToppings.forEach(top => {
    extraCost += Number(top.dataset.price) || 0;
  });

  const finalPrice = activeItem.price + extraCost;
  if (customizedPrice) {
    customizedPrice.textContent = `₹${finalPrice.toFixed(2)}`;
  }
  return finalPrice;
}

// Attach event listeners to card options
document.querySelectorAll(`input[name="${breadRadioName}"]`).forEach(r => {
  r.addEventListener('change', (e) => {
    // Style active choice card
    document.querySelectorAll('.choice-card').forEach(card => card.classList.remove('active'));
    e.target.closest('.choice-card').classList.add('active');
    calculateAdjustedPrice();
  });
});

document.querySelectorAll('input[name="toppingSelection"]').forEach(c => {
  c.addEventListener('change', (e) => {
    e.target.closest('.topping-item').classList.toggle('active', e.target.checked);
    calculateAdjustedPrice();
  });
});

// Close Customizer Modal
if (closeCustomizeBtn) {
  closeCustomizeBtn.addEventListener('click', () => {
    if (customizeModal) customizeModal.classList.remove('active');
    activeItem = null;
  });
}

// 5. CONFIRM CUSTOM OPTIONS AND SAVE TO CART
if (confirmAddCartBtn) {
  confirmAddCartBtn.addEventListener('click', () => {
    if (!activeItem) return;

    // Get Bread selection
    let breadVal = 'Brioche Bun'; // fallback default
    const selectedBread = document.querySelector(`input[name="${breadRadioName}"]:checked`);
    if (selectedBread) {
      breadVal = selectedBread.value;
    }

    // Get checked toppings
    const toppings = [];
    const checkedToppings = document.querySelectorAll('input[name="toppingSelection"]:checked');
    checkedToppings.forEach(top => {
      toppings.push(top.value);
    });

    const finalPrice = calculateAdjustedPrice();

    // Create item entry customization summary
    let optionText = breadVal;
    if (toppings.length > 0) {
      optionText += ' (' + toppings.join(', ') + ')';
    }

    // Save cart unique element
    // Check if duplicate customizable item already exists in cart list
    const existing = cart.find(x => 
      x.id === activeItem.id && 
      x.customization && 
      x.customization.breadOrCrust === breadVal && 
      JSON.stringify(x.customization.toppings) === JSON.stringify(toppings)
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: activeItem.id,
        name: `${activeItem.name} [${optionText}]`,
        price: finalPrice,
        image: activeItem.image,
        quantity: 1,
        customization: {
          breadOrCrust: breadVal,
          toppings: toppings
        }
      });
    }

    saveCart();
    
    // Close modal
    if (customizeModal) customizeModal.classList.remove('active');

    // Handle order now auto redirect
    if (activeItem.autoRedirect) {
      window.location.href = 'index.html#order-section';
    } else {
      // Floating cart button feedback
      if (floatingCart) {
        floatingCart.style.transform = 'scale(1.2) translateY(-0.5rem)';
        setTimeout(() => {
          floatingCart.style.transform = '';
        }, 300);
      }
    }

    activeItem = null;
  });
}

// Floating Cart Icon click scroll/redirect
if (floatingCart) {
  floatingCart.addEventListener('click', () => {
    window.location.href = 'index.html#order-section';
  });
}

// Secret Admin Shortcut: Ctrl + Shift + A
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    window.location.href = 'admin.html';
  }
});

// Page execution triggers
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  fetchMenuItems();
});
