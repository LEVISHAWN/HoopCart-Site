let cart = [];
let products = [];
let appliedCoupon = null;

// Fetch products from the backend
fetch('http://localhost:3000/api/products')
    .then(response => response.json())
    .then(data => {
        products = data;
        renderProducts();
    })
    .catch(error => console.error('Error fetching products:', error));

// Render products dynamically
function renderProducts(filteredProducts = products) {
    const productContainer = document.getElementById('product-list');
    if (!productContainer) return;

    productContainer.innerHTML = '';
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="price">$${product.price.toFixed(2)}</p>
            <p class="stock">Available: ${product.stock} units</p>
            ${product.coupon ? `<p class="coupon">Coupon: ${product.coupon}</p>` : ''}
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productContainer.appendChild(card);
    });
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
        alert('Product is out of stock!');
        return;
    }

    const quantity = parseInt(prompt(`How many ${product.name}s do you want to buy? (Max: ${product.stock})`));
    if (isNaN(quantity) || quantity <= 0 || quantity > product.stock) {
        alert('Invalid quantity or not enough stock.');
        return;
    }

    product.stock -= quantity;
    updateProductStock(product);

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    saveCart();
    alert(`${quantity} ${product.name}(s) added to cart!`);
    renderProducts();
}

// Update product stock
function updateProductStock(product) {
    fetch('http://localhost:3000/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    })
    .catch(error => console.error('Error updating product stock:', error));
}

// Save cart
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    renderCart();
}

// Render cart
function renderCart() {
    const cartItemsList = document.getElementById('cart-items');
    if (!cartItemsList) return;

    cartItemsList.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: auto;">
            <span>${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</span>
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItemsList.appendChild(li);
        total += item.price * item.quantity;
    });

    const cartTotalElement = document.getElementById('cart-total');
    if (cartTotalElement) {
        cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
    }
}

// Checkout process
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items to proceed.');
        return;
    }

    const mapModal = document.getElementById('map-modal');
    mapModal.style.display = 'block';

    // Initialize the map if it hasn't been initialized already
    if (!mapModal.dataset.mapInitialized) {
        const map = L.map('map').setView([1.3733, 36.89], 7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const defaultMarker = L.marker([1.3733, 36.89]).addTo(map);
        defaultMarker.bindPopup("Please select your delivery location.");

        mapModal.dataset.mapInitialized = "true";
    }
}

// Confirm delivery
// Confirm delivery
function confirmDelivery() {
    const deliveryLocation = document.getElementById('delivery-location-input').value.trim();
    if (!deliveryLocation) {
        alert('Please enter a valid delivery location.');
        return;
    }

    // Use OpenStreetMap Nominatim API for geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(deliveryLocation)}`)
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) {
                alert('Location not found. Please enter a valid location.');
                return;
            }

            const location = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };

            console.log('Geocoded location:', location);

            // Ensure map is initialized
            if (!map) {
                map = L.map('map').setView([location.lat, location.lng], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);
            } else {
                map.setView([location.lat, location.lng], 15);
            }

            // Remove previous markers
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            // Add new marker
            const marker = L.marker([location.lat, location.lng]).addTo(map);
            marker.bindPopup(`Delivery Location: ${deliveryLocation}`).openPopup();

            // Save to localStorage
            localStorage.setItem('deliveryLocation', deliveryLocation);

            closeModal('map-modal');
            choosePaymentMethod();
        })
        .catch(error => {
            console.error('Error fetching location:', error);
            alert('Error fetching location. Please try again.');
        });
}

// Ask user for payment method
function choosePaymentMethod() {
    const paymentChoice = prompt('Choose payment method:\n1. Cash on Delivery\n2. Pay on Order\nType "1" for COD or "2" for Pay on Order.').trim();

    if (paymentChoice === "1") {
        processCashOnDelivery();
    } else if (paymentChoice === "2") {
        openPaymentModal();
    } else {
        alert("Invalid choice. Please try again.");
        choosePaymentMethod();
    }
}

// Process Cash on Delivery (COD)
function processCashOnDelivery() {
    const deliveryLocation = localStorage.getItem('deliveryLocation');
    if (!deliveryLocation) {
        alert('Delivery location not confirmed.');
        return;
    }

    setTimeout(() => {
        alert(`Order placed successfully! Your items will be delivered to:\n${deliveryLocation}\nPayment will be collected upon delivery.`);
        completeCheckout(deliveryLocation, "Cash on Delivery");
    }, 1000);
}

// Open payment modal for Pay on Order
function openPaymentModal() {
    const paymentMethod = prompt('Choose payment method:\n1. M-Pesa\n2. PayPal').trim();

    if (paymentMethod === '1') {
        handlePayment('M-Pesa');
    } else if (paymentMethod === '2') {
        handlePayment('PayPal');
    } else {
        alert('Invalid payment method. Please enter either 1 or 2.');
    }
}

// Handle payment
function handlePayment(paymentMethod) {
    const deliveryLocation = localStorage.getItem('deliveryLocation');
    if (!deliveryLocation) {
        alert('Please confirm your delivery location first.');
        return;
    }

    setTimeout(() => {
        alert(`Payment done to HoopCart using ${paymentMethod}`);
        completeCheckout(deliveryLocation, paymentMethod);
    }, 1000);
}

// Complete checkout
function completeCheckout(deliveryLocation, paymentMethod) {
    fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryLocation, paymentMethod })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Order placed successfully') {
            alert(`Order Successful! Your items will be delivered to:\n${data.deliveryLocation}`);
            clearCart();
        } else {
            alert('There was an issue with your order.');
        }
    })
    .catch(error => console.error('Error during checkout:', error));
}

// Clear cart
function clearCart() {
    cart = [];
    saveCart();
    renderCart();
    renderProducts();
    closeModal('payment-modal');
}

// Close modals
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
    loadCart();
    renderProducts();
});
