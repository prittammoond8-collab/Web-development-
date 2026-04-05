const navList = document.getElementById('nav-list');
const toggle = document.querySelector('.menu-toggle');
const contactForm = document.querySelector('.contact__form');
const formStatus = document.querySelector('.form-status');
const yearEl = document.getElementById('year');
const cartButton = document.querySelector('.cart-button');
const cartDrawer = document.querySelector('.cart'); 
const cartOverlay = document.querySelector('.cart-overlay');
const cartItemsEl = document.querySelector('.cart__items');
const cartSubtotalEl = document.querySelector('.cart__subtotal');
const cartCountEl = document.querySelector('.cart-count');
const cartClose = document.querySelector('.cart__close');
const cartClear = document.querySelector('.cart__clear');
const cartCheckout = document.querySelector('.cart__checkout');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (toggle && navList) {
  toggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? 'Close' : 'Menu';
  });

  navList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Menu';
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) {
      navList.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Menu';
    }
  });
}

document.querySelectorAll('.product__actions .btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const product = btn.dataset.product || 'Boot';
    const price = Number(btn.dataset.price || 0);
    addToCart({ name: product, price });
    flashButton(btn);
  });
});

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = data.get('name') || 'there';
    formStatus.textContent = `Thanks, ${name}! A fitter will reply within 24 hours.`;
    contactForm.reset();
  });
}

/* Cart logic */
let cart = [];

function loadCart() {
  try {
    cart = JSON.parse(localStorage.getItem('bb-cart') || '[]');
  } catch (e) {
    cart = [];
  }
}

function saveCart() {
  try {
    localStorage.setItem('bb-cart', JSON.stringify(cart));
  } catch (e) {
    // storage can fail in private mode; ignore to keep UI working
  }
}

function formatCurrency(value) {
  const amount = Number.isFinite(value) ? value : 0;
  return `INR ${amount.toLocaleString('en-IN')}`;
}

function renderCart() {
  if (!cartItemsEl || !cartSubtotalEl || !cartCountEl) return;
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart__empty">Your cart is empty. Add a pair to get started.</p>';
  } else {
    cartItemsEl.innerHTML = cart.map((item, index) => `
      <div class="cart__item">
        <div>
          <strong>${item.name}</strong>
          <small>${formatCurrency(item.price)}</small>
        </div>
        <button class="cart__remove" data-index="${index}" aria-label="Remove ${item.name}">Remove</button>
      </div>
    `).join('');
  }

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  cartSubtotalEl.textContent = formatCurrency(subtotal);
  cartCountEl.textContent = cart.length;

  cartItemsEl.querySelectorAll('.cart__remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      cart.splice(idx, 1);
      saveCart();
      renderCart();
    });
  });
}

function addToCart(item) {
  if (!item || !item.name) return;
  cart.push({ name: item.name, price: Number(item.price) || 0 });
  saveCart();
  renderCart();
  openCart();
}

function openCart() {
  if (!cartDrawer || !cartOverlay) return;
  cartDrawer.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartOverlay.hidden = false;
}

function closeCart() {
  if (!cartDrawer || !cartOverlay) return;
  cartDrawer.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartOverlay.hidden = true;
}

function flashButton(btn) {
  btn.textContent = 'Added!';
  btn.disabled = true;
  btn.classList.add('added');

  setTimeout(() => {
    btn.textContent = 'Add to cart';
    btn.disabled = false;
    btn.classList.remove('added');
  }, 1200);

  if (formStatus) {
    formStatus.textContent = `${btn.dataset.product || 'Boot'} reserved. Tell us your size and we will confirm fit.`;
  }
}

function setupCartControls() {
  if (cartButton) cartButton.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  if (cartClear) {
    cartClear.addEventListener('click', () => {
      cart = [];
      saveCart();
      renderCart();
    });
  }

  if (cartCheckout) {
    cartCheckout.addEventListener('click', () => {
      const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
      alert(`Checkout coming soon. Subtotal: ${formatCurrency(subtotal)}.`);
    });
  }
}

loadCart();
renderCart();
setupCartControls();
