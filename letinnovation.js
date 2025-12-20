const cachedProducts = [];
const BASE_URL = "https://letstore-backend-main-x0dezv.laravel.cloud";
const API = `${BASE_URL}/api/products/all`;
const MOBILE_STORE_URL = "https://letinnovations.store";
const AUTH_TOKEN = "50|IOrMHx8J7IGbhjvgX2pgx9TFu830KDXagzunoidI812c2540";

// Selectors
const modalDetails = document.getElementById('modal-details');
const productModal = document.getElementById('product-modal');

/**
 * FIXED: Returns ONLY the number string. 
 * The "N" is added in the HTML templates to prevent "NN"
 */
function formatCurrency(price) {
    const num = Number(price);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function getProductDataById(productId) {
    return cachedProducts.find(p => String(p.id) === String(productId));
}

/**
 * Product Card Logic
 */
function createProductCardHTML(product) {
    const formattedPrice = formatCurrency(product.price);
    const uniqueId = product.id.toString();
    const image = (product.image_urls && product.image_urls[0]) ? product.image_urls[0] : 'assets/images/placeholder.png';
    
    return `
        <div class="product-card" data-product-id="${uniqueId}" onclick="openProductDetails('${uniqueId}')">
            <div class="product-image-container">
                <img src="${image}" alt="${product.name}" class="product-image" onerror="this.src='assets/images/placeholder.png'">
                ${product.discount > 0 ? `<div class="product-badge">${product.discount}% OFF</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name || "Product"}</h3>
                <p class="product-price">N ${formattedPrice}</p>
                <button class="add-to-cart-btn">VIEW DETAILS</button>
            </div>
        </div>
    `;
}

function openProductDetails(productId) {
    const product = getProductDataById(productId);
    if (!product) return;

    const formattedPrice = formatCurrency(product.price);
    const image = (product.image_urls && product.image_urls[0]) ? product.image_urls[0] : 'assets/images/placeholder.png';

    modalDetails.innerHTML = `
        <div class="modal-product-layout">
            <div class="modal-image-wrapper">
                <img src="${image}" class="modal-product-image" onerror="this.src='assets/images/placeholder.png'">
            </div>
            <div class="modal-product-details">
                <h1>${product.name}</h1>
                <div class="modal-price-container">
                    <span class="modal-product-price">N ${formattedPrice}</span>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn modal-btn-primary" onclick="redirectToStore()">SHOP NOW</button>
                </div>
                <div class="modal-product-description">
                    <h3>Description</h3>
                    <p>${product.description || "No description available for this product."}</p>
                </div>
            </div>
        </div>
    `;
    
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
}

function redirectToStore() {
    const messageDiv = document.getElementById('redirect-message');
    if(messageDiv) {
        messageDiv.style.display = 'block';
        messageDiv.classList.add('message-visible');
    }
    setTimeout(() => {
        window.location.href = MOBILE_STORE_URL;
    }, 1500);
}

// Data Loading
async function loadProducts() {
    const PG = document.getElementById('popular-products');
    if (!PG) return;

    PG.innerHTML = '<div class="loader-text">Loading Products...</div>';

    try {
        const response = await fetch(API, {
            headers: { 'Accept': 'application/json' }
        });
        const fullResponse = await response.json();
        const products = fullResponse.data || [];
        
        cachedProducts.length = 0;
        cachedProducts.push(...products);

        if (products.length === 0) {
            PG.innerHTML = '<p>No products found.</p>';
            return;
        }

        PG.innerHTML = products.map(createProductCardHTML).join("");
    } catch (error) {
        console.error("Error loading products:", error);
        PG.innerHTML = '<p>Connection error. Please check your internet.</p>';
    }
}

// Global Exports for HTML onclicks
window.closeProductModal = closeProductModal;
window.redirectToStore = redirectToStore;

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});
