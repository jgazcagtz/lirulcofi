// State Management
let total = 0;
let orderNumber = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedProduct = null;
let deliveryFee = 0;
let currentCategory = 'all';
let searchQuery = '';
let currentCheckoutStage = 1;

// Product Data with Categories
const products = [
    { name: "Café Americano", img: "https://i.imgur.com/DezlfGS.png", price: 45, description: "Café americano preparado al momento.", category: "coffee" },
    { name: "Cappuccino", img: "https://i.imgur.com/DezlfGS.png", price: 55, description: "Delicioso cappuccino con espuma de leche.", category: "coffee" },
    { name: "Latte", img: "https://i.imgur.com/DezlfGS.png", price: 60, description: "Café latte con leche vaporizada.", category: "coffee" },
    { name: "Mocha", img: "https://i.imgur.com/DezlfGS.png", price: 65, description: "Café mocha con chocolate y crema.", category: "coffee" },
    { name: "Espresso Doble", img: "https://i.imgur.com/DezlfGS.png", price: 50, description: "Doble shot de espresso.", category: "coffee" },
    { name: "Frappuccino", img: "https://i.imgur.com/DezlfGS.png", price: 75, description: "Frappuccino frío con sabor a elegir.", category: "drink" },
    { name: "Panini de Jamón y Queso", img: "https://i.imgur.com/DezlfGS.png", price: 85, description: "Panini tostado con jamón y queso derretido.", category: "food" },
    { name: "Panini Vegetariano", img: "https://i.imgur.com/DezlfGS.png", price: 80, description: "Panini vegetariano con verduras frescas.", category: "food" },
    { name: "Muffin de Chocolate", img: "https://i.imgur.com/DezlfGS.png", price: 40, description: "Muffin esponjoso de chocolate.", category: "dessert" },
    { name: "Croissant", img: "https://i.imgur.com/DezlfGS.png", price: 35, description: "Croissant francés recién horneado.", category: "dessert" },
    { name: "Pastel de Zanahoria", img: "https://i.imgur.com/DezlfGS.png", price: 50, description: "Delicioso pastel de zanahoria.", category: "dessert" },
    { name: "Té Verde", img: "https://i.imgur.com/DezlfGS.png", price: 45, description: "Té verde caliente y relajante.", category: "drink" },
    { name: "Té Chai Latte", img: "https://i.imgur.com/DezlfGS.png", price: 65, description: "Té chai con leche y especias.", category: "drink" },
    { name: "Smoothie de Frutas", img: "https://i.imgur.com/DezlfGS.png", price: 70, description: "Smoothie de frutas naturales.", category: "drink" }
];

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Cart Functions
function toggleCart() {
    const overlay = document.getElementById('cart-overlay');
    const drawer = document.getElementById('cart-drawer');
    overlay.classList.toggle('active');
    drawer.classList.toggle('active');
    
    // Reset to stage 1 when opening cart
    if (drawer.classList.contains('active')) {
        goToStage1();
    }
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartFooter = document.getElementById('cart-footer');
    const cartBadge = document.getElementById('cart-badge');
    
    cartItems.innerHTML = '';
    total = 0;

    // Separate delivery fee from regular items
    const cartWithoutDelivery = cart.filter(item => item.name !== 'Costo de Envío');
    const deliveryFeeItem = cart.find(item => item.name === 'Costo de Envío');
    
    if (deliveryFeeItem) {
        deliveryFee = deliveryFeeItem.price;
    }

    cartWithoutDelivery.forEach((item, displayIndex) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        // Find actual index in cart array
        const actualIndex = cart.findIndex(cartItem => 
            cartItem.name === item.name && 
            cartItem.price === item.price
        );
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)} c/u</div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="qty-btn" onclick="decreaseQuantity(${actualIndex})">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="increaseQuantity(${actualIndex})">+</button>
                </div>
                <button class="remove-btn" onclick="removeCartItem(${actualIndex})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    // Update summary cards
    updateOrderSummary();
    
    if (cartWithoutDelivery.length === 0) {
        cartEmpty.style.display = 'block';
        cartFooter.style.display = 'none';
        cartBadge.style.display = 'none';
        document.getElementById('checkout-stage-1').style.display = 'none';
    } else {
        cartEmpty.style.display = 'none';
        cartFooter.style.display = 'block';
        cartBadge.textContent = cartWithoutDelivery.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.style.display = 'flex';
        document.getElementById('checkout-stage-1').style.display = 'block';
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updatePayPalForm();
    updateWhatsAppLink();
}

function updateOrderSummary() {
    const finalTotal = total + deliveryFee;
    
    // Stage 1 summary
    document.getElementById('summary-subtotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('summary-delivery').textContent = `$${deliveryFee.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `$${finalTotal.toFixed(2)}`;
    
    // Stage 2 summary
    document.getElementById('final-subtotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('final-delivery').textContent = `$${deliveryFee.toFixed(2)}`;
    document.getElementById('final-total').textContent = `$${finalTotal.toFixed(2)}`;
}

function addToCart(product, quantity) {
    const existingProduct = cart.find(item => item.name === product.name && item.name !== 'Costo de Envío');
    
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart.push({ name: product.name, price: product.price, quantity: quantity });
    }
    
    updateCart();
    showToast(`${product.name} agregado al carrito`, 'success');
}

function increaseQuantity(index) {
    if (index >= 0 && index < cart.length && cart[index].name !== 'Costo de Envío') {
        cart[index].quantity += 1;
        updateCart();
    }
}

function decreaseQuantity(index) {
    if (index >= 0 && index < cart.length && cart[index].name !== 'Costo de Envío') {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            removeCartItem(index);
        }
        updateCart();
    }
}

function removeCartItem(index) {
    if (index >= 0 && index < cart.length && cart[index].name !== 'Costo de Envío') {
        cart.splice(index, 1);
        updateCart();
        showToast('Producto eliminado del carrito', 'success');
    }
}

function calculateDeliveryFee(distance) {
    if (distance <= 2) return 20;
    if (distance <= 5) return 30;
    return 30 + (distance - 5) * 5;
}

function updateDeliveryFee() {
    const distance = parseFloat(document.getElementById('delivery-distance').value) || 0;
    deliveryFee = calculateDeliveryFee(distance);

    const existingDeliveryFee = cart.find(item => item.name === 'Costo de Envío');
    if (existingDeliveryFee) {
        existingDeliveryFee.price = deliveryFee;
    } else if (deliveryFee > 0) {
        cart.push({ name: 'Costo de Envío', price: deliveryFee, quantity: 1 });
    }
    updateCart();
}

function updatePayPalForm() {
    const paypalFormContainer = document.getElementById('paypal-form-container');
    const cartWithoutDelivery = cart.filter(item => item.name !== 'Costo de Envío');
    const finalTotal = total + deliveryFee;
    
    if (paypalFormContainer) {
        paypalFormContainer.innerHTML = `
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                <input type="hidden" name="cmd" value="_xclick" />
                <input type="hidden" name="business" value="gascagtz@gmail.com" />
                <input type="hidden" name="currency_code" value="MXN" />
                <input type="hidden" name="amount" value="${finalTotal.toFixed(2)}" />
                <input type="hidden" name="item_name" value="${cartWithoutDelivery.map(item => `${item.name} (${item.quantity})`).join(', ')}" />
                <input type="image" src="https://www.paypalobjects.com/webstatic/en_US/i/btn/png/silver-pill-paypal-44px.png" 
                       border="0" name="submit" title="Pay with PayPal" 
                       alt="PayPal - The safer, easier way to pay online!" 
                       style="cursor: pointer; width: 100%;" />
            </form>
        `;
    }
}

function updateWhatsAppLink() {
    const whatsappBtn = document.getElementById('whatsapp-btn');
    if (!whatsappBtn) return;
    
    const paymentMethodInput = document.querySelector('input[name="payment-method"]:checked');
    if (!paymentMethodInput) return;
    
    const paymentMethod = paymentMethodInput.value;
    const deliveryMethodInput = document.querySelector('input[name="delivery-method"]:checked');
    const deliveryMethod = deliveryMethodInput ? deliveryMethodInput.value : 'A Domicilio';
    const address = document.getElementById('delivery-address')?.value || 'No especificada';
    const notes = document.getElementById('order-notes')?.value || 'Sin notas adicionales';
    const distance = document.getElementById('delivery-distance')?.value || '0';
    
    const cartWithoutDelivery = cart.filter(item => item.name !== 'Costo de Envío');
    const finalTotal = total + deliveryFee;
    
    const message = `Número de Orden: ${orderNumber || 'Pendiente'}\n\nOrden de Lirul Coffee:\n${cartWithoutDelivery.map(item => `${item.name} (${item.quantity}) - $${item.price} c/u`).join('\n')}\n\nTotal: $${finalTotal.toFixed(2)}\nMétodo de pago: ${paymentMethod}\nMétodo de entrega: ${deliveryMethod}\nDirección: ${address}\nDistancia: ${distance} km\nCosto de Envío: $${deliveryFee.toFixed(2)}\nNotas: ${notes}`;
    
    whatsappBtn.href = `https://wa.me/525533355687?text=${encodeURIComponent(message)}`;
}

// Checkout Stage Management
function goToStage1() {
    currentCheckoutStage = 1;
    document.getElementById('checkout-stage-1').style.display = 'block';
    document.getElementById('checkout-stage-2').style.display = 'none';
    document.getElementById('btn-stage-1').style.display = 'block';
    document.getElementById('stage-2-buttons').style.display = 'none';
    document.getElementById('cart-back-btn').style.display = 'none';
    document.getElementById('cart-header-title').innerHTML = '<i class="fas fa-shopping-cart"></i> Carrito';
    
    // Update step indicator
    document.querySelector('#step-1 .step-number').classList.add('active');
    document.querySelector('#step-1 .step-number').classList.remove('completed');
    document.querySelector('#step-2 .step-number').classList.remove('active', 'completed');
    document.querySelector('.step-line').classList.remove('active');
}

function goToStage2() {
    // Validate stage 1
    const address = document.getElementById('delivery-address').value.trim();
    if (!address) {
        showToast('Por favor ingresa una dirección de entrega', 'error');
        return;
    }

    currentCheckoutStage = 2;
    document.getElementById('checkout-stage-1').style.display = 'none';
    document.getElementById('checkout-stage-2').style.display = 'block';
    document.getElementById('btn-stage-1').style.display = 'none';
    document.getElementById('stage-2-buttons').style.display = 'block';
    document.getElementById('cart-back-btn').style.display = 'flex';
    document.getElementById('cart-header-title').innerHTML = '<i class="fas fa-credit-card"></i> Pago';
    
    // Update step indicator
    document.querySelector('#step-1 .step-number').classList.remove('active');
    document.querySelector('#step-1 .step-number').classList.add('completed');
    document.querySelector('#step-2 .step-number').classList.add('active');
    document.querySelector('.step-line').classList.add('active');
    
    // Update order review
    updateOrderReview();
    updatePaymentDetails();
}

function updateOrderReview() {
    const reviewItems = document.getElementById('order-review-items');
    const cartWithoutDelivery = cart.filter(item => item.name !== 'Costo de Envío');
    
    reviewItems.innerHTML = '';
    
    cartWithoutDelivery.forEach(item => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'cart-item';
        reviewItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.quantity} x $${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-actions">
                <span style="font-weight: 700; color: var(--primary);">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
        reviewItems.appendChild(reviewItem);
    });
    
    // Update review info
    document.getElementById('review-address').textContent = document.getElementById('delivery-address').value || 'No especificada';
    const deliveryMethod = document.querySelector('input[name="delivery-method"]:checked');
    document.getElementById('review-delivery-method').textContent = deliveryMethod ? deliveryMethod.value : 'A Domicilio';
    
    const notes = document.getElementById('order-notes').value.trim();
    if (notes) {
        document.getElementById('review-notes').textContent = notes;
        document.getElementById('review-notes-row').style.display = 'flex';
    } else {
        document.getElementById('review-notes-row').style.display = 'none';
    }
}

function updatePaymentDetails() {
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
    const paymentDetails = document.getElementById('payment-details');
    const paypalContainer = document.getElementById('paypal-form-container');
    const mercadopagoContainer = document.getElementById('mercadopago-link-container');
    
    if (!paymentMethod) return;
    
    if (paymentMethod.value === 'PayPal') {
        paymentDetails.style.display = 'block';
        paypalContainer.style.display = 'block';
        mercadopagoContainer.style.display = 'none';
        updatePayPalForm();
    } else if (paymentMethod.value === 'Mercado Pago') {
        paymentDetails.style.display = 'block';
        paypalContainer.style.display = 'none';
        mercadopagoContainer.style.display = 'block';
    } else {
        paymentDetails.style.display = 'none';
    }
}

function uploadOrder() {
    if (cart.filter(item => item.name !== 'Costo de Envío').length === 0) {
        showToast('Agrega productos al carrito primero', 'error');
        return;
    }

    if (!orderNumber) {
        orderNumber = Math.floor(Math.random() * 1000000) + 1;
    }

    const orderData = {
        timestamp: new Date().toLocaleString(),
        orderNumber: orderNumber,
        deliveryAddress: document.getElementById('delivery-address').value || 'No especificada',
        orderNotes: document.getElementById('order-notes').value || 'Sin notas adicionales',
        paymentMethod: document.querySelector('input[name="payment-method"]:checked').value,
        deliveryMethod: document.querySelector('input[name="delivery-method"]:checked').value,
        deliveryDistance: parseFloat(document.getElementById('delivery-distance').value) || 0,
        deliveryFee: deliveryFee.toFixed(2),
        cart: JSON.stringify(cart),
        total: (total + deliveryFee).toFixed(2)
    };

    updateWhatsAppLink();

    fetch('https://script.google.com/macros/s/AKfycbxB9-728OnNnromP-oOQStESL_srYAQ_aXb2Wv1bROiqlq5jMcLTvYEHjDuzzHBrrWh/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
    .then(() => {
        showToast('Pedido enviado correctamente', 'success');
        document.getElementById('whatsapp-btn').style.display = 'flex';
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error al enviar el pedido', 'error');
    });
}

// Product Display
function filterProducts() {
    const filtered = products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    displayProducts(filtered);
}

function displayProducts(productsToShow) {
    const menu = document.getElementById('menu');
    const emptyState = document.getElementById('empty-state');
    
    menu.innerHTML = '';
    
    if (productsToShow.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    productsToShow.forEach((product, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        const globalIndex = products.findIndex(p => p.name === product.name);
        menuItem.innerHTML = `
            <img src="${product.img}" alt="${product.name}" class="menu-item-image">
            <div class="menu-item-content">
                <h3>${product.name}</h3>
                <p class="menu-item-description">${product.description}</p>
                <div class="menu-item-footer">
                    <div class="menu-item-price">$${product.price}</div>
                    <div class="menu-item-actions">
                        <select class="quantity-select" id="qty-${globalIndex}">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                        <button class="btn-add" onclick="addToCartByIndex(${globalIndex})">
                            <i class="fas fa-plus"></i> Agregar
                        </button>
                    </div>
                </div>
            </div>
        `;
        menu.appendChild(menuItem);
    });
}

function addToCartByIndex(index) {
    const product = products[index];
    const quantity = parseInt(document.getElementById(`qty-${index}`).value);
    addToCart(product, quantity);
}

// Event Listeners
document.getElementById('search-input').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    filterProducts();
});

document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.dataset.category;
        filterProducts();
    });
});

function togglePromoModal() {
    document.getElementById('promo-modal').classList.toggle('active');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    filterProducts();
    updateCart();
    goToStage1();
    
    // Update WhatsApp link when form changes
    ['delivery-address', 'order-notes', 'delivery-distance'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                updateWhatsAppLink();
                if (currentCheckoutStage === 2) {
                    updateOrderReview();
                }
            });
        }
    });
    
    // Payment method change handler
    document.querySelectorAll('input[name="payment-method"]').forEach(input => {
        input.addEventListener('change', () => {
            updatePaymentDetails();
            updateWhatsAppLink();
        });
    });
    
    // Delivery method change handler
    document.querySelectorAll('input[name="delivery-method"]').forEach(input => {
        input.addEventListener('change', () => {
            updateWhatsAppLink();
            if (currentCheckoutStage === 2) {
                updateOrderReview();
            }
        });
    });
});

// Close modals on outside click
window.onclick = function(event) {
    const promoModal = document.getElementById('promo-modal');
    if (event.target === promoModal) {
        promoModal.classList.remove('active');
    }
}

