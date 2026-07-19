const API_BASE_URL = window.location.origin;

// DOM Elements
const addMenuForm = document.getElementById('addMenuForm');
const itemName = document.getElementById('itemName');
const itemDescription = document.getElementById('itemDescription');
const itemPrice = document.getElementById('itemPrice');
const itemCategory = document.getElementById('itemCategory');
const selectedPreloadedImage = document.getElementById('selectedPreloadedImage');
const customImageUrl = document.getElementById('customImageUrl');
const submitMenuBtn = document.getElementById('submitMenuBtn');
const formMessage = document.getElementById('formMessage');
const adminMenuList = document.getElementById('adminMenuList');
const liveMenuCount = document.getElementById('liveMenuCount');
const floatingCart = document.getElementById('floatingCart');
const cartBadge = document.getElementById('cartBadge');

// Hamburger toggle
const menu = document.querySelector('.menu');
const navbar = document.querySelector('.navbar');

if (menu && navbar) {
  menu.addEventListener('click', () => {
    menu.classList.toggle('change');
    navbar.classList.toggle('change');
  });
}

// 1. UPDATE CART BADGE
function updateCartBadge() {
  if (!cartBadge) return;
  const stored = localStorage.getItem('spice_cart');
  if (stored) {
    try {
      const cart = JSON.parse(stored);
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartBadge.textContent = totalItems;
    } catch (e) {
      cartBadge.textContent = 0;
    }
  } else {
    cartBadge.textContent = 0;
  }
}

// Floating cart click redirect
if (floatingCart) {
  floatingCart.addEventListener('click', () => {
    window.location.href = 'index.html#order-section';
  });
}

// 2. IMAGE OPTION SELECTION LOGIC
const imageTabs = document.querySelectorAll('.image-tabs .payment-tab');
const imageSubforms = document.querySelectorAll('.image-input-container .payment-details-content');
let activeImageMethod = 'preloaded';

imageTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    imageTabs.forEach(t => t.classList.remove('active'));
    imageSubforms.forEach(f => f.classList.remove('active'));

    tab.classList.add('active');
    activeImageMethod = tab.dataset.method;

    const subform = document.getElementById(`image-${activeImageMethod}`);
    if (subform) subform.classList.add('active');
  });
});

// Click preloaded thumbnail
const thumbCards = document.querySelectorAll('.thumb-card');
thumbCards.forEach(card => {
  card.addEventListener('click', () => {
    thumbCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    selectedPreloadedImage.value = card.dataset.path;
  });
});

// 3. LOAD & RENDER LIVE MENU ITEMS LIST
async function loadLiveMenu() {
  if (!adminMenuList) return;
  
  adminMenuList.innerHTML = '<div style="color: #a79a2d; font-size: 1.6rem; text-align: center; padding: 3rem 0;"><i class="fas fa-spinner fa-spin"></i> Fetching live items...</div>';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu`);
    const data = await response.json();

    if (response.ok && data.success) {
      liveMenuCount.textContent = data.count;
      adminMenuList.innerHTML = '';

      if (data.items.length === 0) {
        adminMenuList.innerHTML = '<p class="empty-cart-msg">Database is empty. Add food items using the form!</p>';
        return;
      }

      data.items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'checkout-cart-item';
        itemEl.style.padding = '1.2rem';
        itemEl.innerHTML = `
          <img src="${item.imageUrl || 'images/card-img-1.png'}" class="cart-item-img" alt="${item.name}" style="width: 5.5rem; height: 5.5rem;" />
          <div class="cart-item-info">
            <div class="cart-item-name" style="font-size: 1.6rem; font-weight:800; display:flex; align-items:center; gap:1rem;">
              ${item.name} 
              <span style="font-size: 1rem; background:#a79a2d; color:#111; padding:0.2rem 0.6rem; border-radius:5rem; text-transform:uppercase; font-weight:900;">${item.category}</span>
            </div>
            <div class="cart-item-price" style="font-size:1.4rem;">₹${item.price}</div>
            <div style="font-size: 1.2rem; color: #aaa; margin-top:0.3rem; font-weight:300; line-height:1.4;">${item.description || 'No description provided.'}</div>
          </div>
          <button type="button" class="cart-item-remove delete-menu-btn" data-id="${item._id}" title="Delete Item">
            <i class="fas fa-trash-can"></i>
          </button>
        `;
        adminMenuList.appendChild(itemEl);
      });

      // Wire up delete event listeners
      document.querySelectorAll('.delete-menu-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          if (confirm('Are you sure you want to delete this menu item from the store database?')) {
            deleteMenuItem(id);
          }
        });
      });

    } else {
      adminMenuList.innerHTML = '<p style="color: red; font-size:1.5rem; text-align:center;">Failed to retrieve items.</p>';
    }
  } catch (err) {
    console.error('Load admin menu error:', err);
    adminMenuList.innerHTML = '<p style="color: red; font-size:1.5rem; text-align:center;">Error contacting server.</p>';
  }
}

// 4. DELETE MENU ITEM
async function deleteMenuItem(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (response.ok && data.success) {
      // Reload menu
      loadLiveMenu();
    } else {
      alert(data.message || 'Failed to delete menu item.');
    }
  } catch (err) {
    console.error('Delete menu item error:', err);
    alert('Connection error. Failed to delete item.');
  }
}

// 5. ADD MENU ITEM FORM SUBMIT
if (addMenuForm) {
  addMenuForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = itemName.value.trim();
    const description = itemDescription.value.trim();
    const price = Number(itemPrice.value);
    const category = itemCategory.value;

    // Determine final image path
    let imageUrl = '';
    if (activeImageMethod === 'preloaded') {
      imageUrl = selectedPreloadedImage.value;
    } else {
      imageUrl = customImageUrl.value.trim();
      if (!imageUrl) {
        formMessage.textContent = 'Please enter a custom Image URL.';
        formMessage.style.color = 'red';
        return;
      }
    }

    if (!name || !description || !price || !category || !imageUrl) {
      formMessage.textContent = 'Please fill out all fields.';
      formMessage.style.color = 'red';
      return;
    }

    // Submit UI states
    submitMenuBtn.classList.add('loading');
    submitMenuBtn.disabled = true;
    formMessage.textContent = '';

    const payload = { name, description, price, category, imageUrl };

    try {
      const response = await fetch(`${API_BASE_URL}/api/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        formMessage.textContent = `Success: "${data.item.name}" added to menu!`;
        formMessage.style.color = '#2ecc71';
        
        // Reset form
        addMenuForm.reset();
        
        // Select first image again as default
        thumbCards.forEach((c, idx) => {
          c.classList.toggle('active', idx === 0);
        });
        selectedPreloadedImage.value = thumbCards[0].dataset.path;
        
        // Reload menu
        loadLiveMenu();
      } else {
        formMessage.textContent = data.message || 'Failed to add menu item.';
        formMessage.style.color = 'red';
      }
    } catch (err) {
      console.error('Add menu item submit error:', err);
      formMessage.textContent = 'Server connection error. Try again.';
      formMessage.style.color = 'red';
    } finally {
      submitMenuBtn.classList.remove('loading');
      submitMenuBtn.disabled = false;
    }
  });
}

// Admin Security Lock Screen Authorization
const lockScreen = document.getElementById('lockScreen');
const lockForm = document.getElementById('lockForm');
const adminPasscode = document.getElementById('adminPasscode');
const lockError = document.getElementById('lockError');

if (lockForm) {
  lockForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = adminPasscode.value.trim();
    if (pin === 'admin123' || pin === '1234') { // Secure passcodes
      sessionStorage.setItem('admin_authenticated', 'true');
      if (lockScreen) {
        lockScreen.style.opacity = '0';
        setTimeout(() => {
          lockScreen.style.display = 'none';
        }, 300);
      }
      loadLiveMenu();
    } else {
      if (lockError) {
        lockError.textContent = 'Invalid Passcode! Access Denied.';
        adminPasscode.value = '';
      }
    }
  });
}

function checkAuthorization() {
  const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
  if (isAuth) {
    if (lockScreen) lockScreen.style.display = 'none';
    loadLiveMenu();
  } else {
    if (lockScreen) {
      lockScreen.style.display = 'flex';
      lockScreen.style.opacity = '1';
    }
  }
}

// Initial triggers
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  checkAuthorization();
});
