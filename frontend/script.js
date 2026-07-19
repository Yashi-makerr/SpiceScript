  const icons = document.querySelectorAll('.section-1-icons i');
    let i = 1;
    setInterval(() => {
      i++;
      const icon = document.querySelector('.section-1-icons i.change');
      icon.classList.remove('change');
      if (i > icons.length) {
        icons[0].classList.add('change');
        i = 1;
      } else {
        icon.nextElementSibling.classList.add('change');
      }
    }, 1000);

    // Toggle navbar
    const menu = document.querySelector('.menu');
    const navbar = document.querySelector('.navbar');

    menu.addEventListener('click', () => {
      menu.classList.toggle('change');
      navbar.classList.toggle('change');
    });

    // Order & Checkout System
    const API_BASE_URL = window.location.origin;

    // Shopping Cart State
    let cart = [];

    // DOM Elements
    const menuCardsContainer = document.getElementById('menu-cards-container');
    const cartItemsList = document.getElementById('cartItemsList');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryDelivery = document.getElementById('summaryDelivery');
    const summaryTax = document.getElementById('summaryTax');
    const summaryTotal = document.getElementById('summaryTotal');
    const floatingCart = document.getElementById('floatingCart');
    const cartBadge = document.getElementById('cartBadge');
    const orderForm = document.getElementById('orderForm');
    const orderMessage = document.getElementById('orderMessage');
    const submitOrderBtn = document.getElementById('submitOrderBtn');

    // Success Modal Elements
    const successModal = document.getElementById('successModal');
    const successOrderId = document.getElementById('successOrderId');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');

    // 1. DYNAMICALLY LOAD MENU ITEMS FROM DB
    async function loadMenu() {
      try {
        if (!menuCardsContainer) return;
        menuCardsContainer.innerHTML = '<div style="color: #a79a2d; font-size: 2rem; width: 100%; text-align: center; padding: 5rem 0;"><i class="fas fa-spinner fa-spin"></i> Loading Delicious Menu...</div>';
        
        const response = await fetch(`${API_BASE_URL}/api/menu`);
        const data = await response.json();

        if (response.ok && data.success) {
          if (data.items.length === 0) {
            menuCardsContainer.innerHTML = '<div style="color: #aaa; font-size: 2rem; width: 100%; text-align: center; padding: 5rem 0;">No menu items available. Wait for database seeding!</div>';
            return;
          }

          menuCardsContainer.innerHTML = '';
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
                  <p class="card-description">
                    ${item.description || 'Delicious home-style food cooked fresh on order.'}
                  </p>
                  <div class="card-price">
                    ₹${item.price}
                  </div>
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

          // Re-wire button events
          document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              addToCart(btn.dataset.id, btn.dataset.name, Number(btn.dataset.price), btn.dataset.image, false);
            });
          });

          document.querySelectorAll('.order-now-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              addToCart(btn.dataset.id, btn.dataset.name, Number(btn.dataset.price), btn.dataset.image, true);
            });
          });

        } else {
          menuCardsContainer.innerHTML = '<div style="color: red; font-size: 2rem; width: 100%; text-align: center; padding: 5rem 0;">Error fetching menu items.</div>';
        }
      } catch (err) {
        console.error('Menu load error:', err);
        menuCardsContainer.innerHTML = '<div style="color: red; font-size: 2rem; width: 100%; text-align: center; padding: 5rem 0;">Failed to connect to backend server.</div>';
      }
    }

    // 2. CART LOGIC IMPLEMENTATION
    function addToCart(id, name, price, image, autoScroll = false) {
      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id, name, price, image, quantity: 1 });
      }
      renderCart();

      // Micro-animation for cart badge
      if (floatingCart) {
        floatingCart.style.transform = 'scale(1.2)';
        setTimeout(() => {
          floatingCart.style.transform = '';
        }, 300);
      }

      if (autoScroll) {
        const orderSection = document.getElementById('order-section');
        if (orderSection) {
          orderSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }

    function removeFromCart(id) {
      cart = cart.filter(item => item.id !== id);
      renderCart();
    }

    function updateQty(id, newQty) {
      const item = cart.find(item => item.id === id);
      if (item) {
        item.quantity = newQty;
        if (item.quantity <= 0) {
          removeFromCart(id);
        } else {
          renderCart();
        }
      }
    }

    function renderCart() {
      if (!cartItemsList) return;
      cartItemsList.innerHTML = '';
      
      let subtotal = 0;
      let totalItems = 0;

      if (cart.length === 0) {
        cartItemsList.innerHTML = '<p class="empty-cart-msg">Your cart is empty. Add delicious items to order.</p>';
      } else {
        cart.forEach(item => {
          subtotal += item.price * item.quantity;
          totalItems += item.quantity;

          const itemEl = document.createElement('div');
          itemEl.className = 'checkout-cart-item';
          itemEl.innerHTML = `
            <img src="${item.image || 'images/card-img-1.png'}" class="cart-item-img" alt="${item.name}" />
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">₹${item.price}</div>
              <div class="cart-item-qty-controls">
                <button type="button" class="qty-btn dec-qty-btn" data-id="${item.id}">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button type="button" class="qty-btn inc-qty-btn" data-id="${item.id}">+</button>
              </div>
            </div>
            <button type="button" class="cart-item-remove" data-id="${item.id}">
              <i class="fas fa-trash-can"></i>
            </button>
          `;
          cartItemsList.appendChild(itemEl);
        });

        // Add quantity and remove button listeners
        cartItemsList.querySelectorAll('.dec-qty-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const item = cart.find(x => x.id === btn.dataset.id);
            if (item) updateQty(item.id, item.quantity - 1);
          });
        });

        cartItemsList.querySelectorAll('.inc-qty-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const item = cart.find(x => x.id === btn.dataset.id);
            if (item) updateQty(item.id, item.quantity + 1);
          });
        });

        cartItemsList.querySelectorAll('.cart-item-remove').forEach(btn => {
          btn.addEventListener('click', () => {
            removeFromCart(btn.dataset.id);
          });
        });
      }

      // Calculations
      const deliveryFee = cart.length > 0 ? 40 : 0;
      const tax = Number((subtotal * 0.05).toFixed(2));
      const grandTotal = subtotal + deliveryFee + tax;

      // Update badge
      if (cartBadge) cartBadge.textContent = totalItems;

      // Update summary numbers
      if (summarySubtotal) summarySubtotal.textContent = `₹${subtotal.toFixed(2)}`;
      if (summaryDelivery) summaryDelivery.textContent = `₹${deliveryFee.toFixed(2)}`;
      if (summaryTax) summaryTax.textContent = `₹${tax.toFixed(2)}`;
      if (summaryTotal) summaryTotal.textContent = `₹${grandTotal.toFixed(2)}`;

      // Save updated cart to localStorage to sync between pages
      localStorage.setItem('spice_cart', JSON.stringify(cart));
    }

    // Floating Cart Click Scroll
    if (floatingCart) {
      floatingCart.addEventListener('click', () => {
        const section = document.getElementById('order-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // 3. PAYMENT FORM METHOD TOGGLE
    const paymentTabs = document.querySelectorAll('.payment-tab');
    const paymentSubforms = document.querySelectorAll('.payment-details-content');
    let activePaymentMethod = 'cod';

    paymentTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        paymentTabs.forEach(t => t.classList.remove('active'));
        paymentSubforms.forEach(f => f.classList.remove('active'));

        tab.classList.add('active');
        activePaymentMethod = tab.dataset.method;
        
        const subform = document.getElementById(`details-${activePaymentMethod}`);
        if (subform) subform.classList.add('active');
      });
    });

    // 4. INTERACTIVE CREDIT CARD FORM
    const creditCardPreview = document.getElementById('creditCardPreview');
    const cardHolderInput = document.getElementById('cardHolder');
    const cardNumberInput = document.getElementById('cardNumber');
    const cardExpiryInput = document.getElementById('cardExpiry');
    const cardCvvInput = document.getElementById('cardCvv');

    // Display fields
    const cardNumDisplay = document.getElementById('cardNumDisplay');
    const cardNameDisplay = document.getElementById('cardNameDisplay');
    const cardExpiryDisplay = document.getElementById('cardExpiryDisplay');
    const cardCvvDisplay = document.getElementById('cardCvvDisplay');

    if (cardNumberInput) {
      cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        // Group by 4 digits
        let formatted = value.match(/.{1,4}/g)?.join(' ') || '';
        e.target.value = formatted.substring(0, 19);
        cardNumDisplay.textContent = formatted || '•••• •••• •••• ••••';
      });
    }

    if (cardHolderInput) {
      cardHolderInput.addEventListener('input', (e) => {
        cardNameDisplay.textContent = e.target.value.toUpperCase() || 'YOUR NAME';
      });
    }

    if (cardExpiryInput) {
      cardExpiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
          value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
        cardExpiryDisplay.textContent = value || 'MM/YY';
      });
    }

    // Flip Card on CVV Focus
    if (cardCvvInput) {
      cardCvvInput.addEventListener('focus', () => {
        creditCardPreview.classList.add('flip');
      });
      cardCvvInput.addEventListener('blur', () => {
        creditCardPreview.classList.remove('flip');
      });
      cardCvvInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value.substring(0, 3);
        cardCvvDisplay.textContent = value || '•••';
      });
    }

    // 5. UPI QR CODE COUNTDOWN TIMER
    let qrTimerInterval;
    function startQrTimer() {
      const timerDisplay = document.getElementById('qrTimer');
      if (!timerDisplay) return;

      let timeLimit = 300; // 5 minutes in seconds
      clearInterval(qrTimerInterval);

      qrTimerInterval = setInterval(() => {
        let minutes = Math.floor(timeLimit / 60);
        let seconds = timeLimit % 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        timerDisplay.textContent = `Expiry in 0${minutes}:${seconds}`;
        timeLimit--;

        if (timeLimit < 0) {
          clearInterval(qrTimerInterval);
          timerDisplay.textContent = "QR Code Expired!";
          timerDisplay.style.backgroundColor = "#f2dede";
          timerDisplay.style.color = "#a94442";
        }
      }, 1000);
    }
    startQrTimer(); // Start countdown by default

    // UPI ID verification simulation
    const verifyUpiBtn = document.getElementById('verifyUpiBtn');
    const upiIdInput = document.getElementById('upiId');
    if (verifyUpiBtn) {
      verifyUpiBtn.addEventListener('click', () => {
        const id = upiIdInput.value.trim();
        if (!id.includes('@')) {
          alert('Please enter a valid UPI ID (e.g., user@bank)');
          return;
        }
        verifyUpiBtn.textContent = 'Verifying...';
        verifyUpiBtn.disabled = true;

        setTimeout(() => {
          verifyUpiBtn.textContent = 'Verified ✓';
          verifyUpiBtn.style.backgroundColor = '#2ecc71';
          verifyUpiBtn.style.color = '#fff';
        }, 1500);
      });
    }

    // 6. CHECKOUT FORM SUBMISSION & MOCK PROGRESS TRACKER
    if (orderForm) {
      orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
          orderMessage.textContent = 'Your cart is empty. Please add items before placing order.';
          orderMessage.style.color = 'red';
          return;
        }

        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const address = document.getElementById('address').value;

        // Collect payment variables
        let paymentStatus = 'pending';
        let cardDetails = undefined;
        let transactionId = undefined;

        if (activePaymentMethod === 'card') {
          const number = cardNumberInput.value.replace(/\s+/g, '');
          const holder = cardHolderInput.value.trim();
          if (!number || !holder || number.length < 16) {
            orderMessage.textContent = 'Please fill out card details correctly.';
            orderMessage.style.color = 'red';
            return;
          }
          paymentStatus = 'paid';
          cardDetails = {
            cardHolder: holder,
            last4: number.substring(12, 16)
          };
          transactionId = 'TXN_CARD_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        } else if (activePaymentMethod === 'upi') {
          const upiVal = upiIdInput.value.trim();
          if (!upiVal) {
            orderMessage.textContent = 'Please enter your UPI ID.';
            orderMessage.style.color = 'red';
            return;
          }
          paymentStatus = 'paid';
          transactionId = 'TXN_UPI_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }

        // Compute subtotal for orderData
        let subtotal = 0;
        cart.forEach(item => {
          subtotal += item.price * item.quantity;
        });
        const deliveryFee = 40;
        const tax = Number((subtotal * 0.05).toFixed(2));
        const grandTotal = subtotal + deliveryFee + tax;

        // Build items payload matching MenuItem model references
        const itemsPayload = cart.map(item => ({
          menuItem: item.id,
          quantity: item.quantity
        }));

        const orderData = {
          customerName,
          customerEmail,
          customerPhone,
          address,
          items: itemsPayload,
          totalAmount: grandTotal,
          paymentMethod: activePaymentMethod,
          paymentStatus,
          cardDetails,
          transactionId
        };

        // UI Loading state
        submitOrderBtn.classList.add('loading');
        submitOrderBtn.disabled = true;
        orderMessage.textContent = '';

        try {
          const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            // Trigger confirmation modal
            successOrderId.textContent = `#SSP-${data.order._id.substring(data.order._id.length - 8).toUpperCase()}`;
            successModal.classList.add('active');

            // Reset checkout state
            cart = [];
            renderCart();
            orderForm.reset();
            if (verifyUpiBtn) {
              verifyUpiBtn.textContent = 'Verify';
              verifyUpiBtn.disabled = false;
              verifyUpiBtn.style.backgroundColor = '';
              verifyUpiBtn.style.color = '';
            }

            // Start delivery status simulator
            runDeliveryStatusSimulation();

          } else {
            orderMessage.textContent = data.message || 'Failed to place order.';
            orderMessage.style.color = 'red';
          }
        } catch (err) {
          console.error('Submit order error:', err);
          orderMessage.textContent = 'Connection error. Unable to contact server.';
          orderMessage.style.color = 'red';
        } finally {
          submitOrderBtn.classList.remove('loading');
          submitOrderBtn.disabled = false;
        }
      });
    }

    // 7. REAL-TIME DELIVERY STATUS SIMULATION
    let simulationTimeouts = [];
    function runDeliveryStatusSimulation() {
      // Reset all steps to default
      const steps = ['pending', 'preparing', 'shipping', 'delivered'];
      steps.forEach(s => {
        const el = document.getElementById(`step-${s}`);
        if (el) {
          el.className = 'tracker-step';
        }
      });

      // Step 1: Placed (Immediate)
      document.getElementById('step-pending').classList.add('active');

      // Clear previous simulation timeouts if any
      simulationTimeouts.forEach(clearTimeout);
      simulationTimeouts = [];

      // Step 2: Preparing (after 4 seconds)
      simulationTimeouts.push(setTimeout(() => {
        document.getElementById('step-pending').classList.remove('active');
        document.getElementById('step-pending').classList.add('completed');
        document.getElementById('step-preparing').classList.add('active');
      }, 4000));

      // Step 3: Shipping (after 9 seconds)
      simulationTimeouts.push(setTimeout(() => {
        document.getElementById('step-preparing').classList.remove('active');
        document.getElementById('step-preparing').classList.add('completed');
        document.getElementById('step-shipping').classList.add('active');
      }, 9000));

      // Step 4: Delivered (after 14 seconds)
      simulationTimeouts.push(setTimeout(() => {
        document.getElementById('step-shipping').classList.remove('active');
        document.getElementById('step-shipping').classList.add('completed');
        document.getElementById('step-delivered').classList.add('completed', 'active');
      }, 14000));
    }

    // 8. CLOSE MODAL ACTION
    if (closeSuccessBtn) {
      closeSuccessBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
        // Stop any running simulation
        simulationTimeouts.forEach(clearTimeout);
        simulationTimeouts = [];
      });
    }

    function loadCart() {
      const stored = localStorage.getItem('spice_cart');
      if (stored) {
        try {
          cart = JSON.parse(stored);
        } catch (e) {
          console.error('Error parsing cart from localStorage:', e);
          cart = [];
        }
      }
      renderCart();
    }

    // Secret Admin Shortcut: Ctrl + Shift + A
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        window.location.href = 'admin.html';
      }
    });

    // Initial Execution
    loadMenu();
    loadCart();

