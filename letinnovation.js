// Configuration
const BASE_URL = "https://letstore-backend-main-x0dezv.laravel.cloud"
const API_ENDPOINT = `${BASE_URL}/api/products/all`
const PRIMARY_COLOR = "#6b4b9f"
const MOBILE_STORE_URL = "https://letinnovations.store"
const AUTH_TOKEN = "50|IOrMHx8J7IGbhjvgX2pgx9TFu830KDXagzunoidI812c2540"

// Global state
let cachedProducts = []
let currentSlide = 0
let slideInterval = null
let isDarkMode = false

// Utility Functions
function formatCurrency(price) {
    if (typeof price !== 'number') { return 'N 0.00' };
    return price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem("theme")
    isDarkMode = savedTheme === "dark"
    applyTheme()
}

function toggleTheme() {
    isDarkMode = !isDarkMode
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
    applyTheme()
}

function applyTheme() {
    document.body.classList.toggle("dark-mode", isDarkMode)
    updateThemeIcon()
}

function updateThemeIcon() {
    const themeBtn = document.getElementById("theme-toggle")
    const icon = themeBtn?.querySelector(".theme-icon")
    if (icon) {
        if (isDarkMode) {
            icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`
        } else {
            icon.innerHTML = `
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            `
        }
    }
}

// Banner Carousel logic
function initBannerCarousel() {
    const slides = document.querySelectorAll(".banner-slide")
    const indicators = document.querySelector(".banner-indicators")
    if (!indicators || slides.length === 0) return

    slides.forEach((_, index) => {
        const indicator = document.createElement("div")
        indicator.className = "indicator"
        if (index === 0) indicator.classList.add("active")
        indicator.addEventListener("click", () => goToSlide(index))
        indicators.appendChild(indicator)
    })

    startSlideShow()
    document.querySelector(".banner-nav.prev")?.addEventListener("click", prevSlide)
    document.querySelector(".banner-nav.next")?.addEventListener("click", nextSlide)
}

function goToSlide(index) {
    const slides = document.querySelectorAll(".banner-slide")
    const indicators = document.querySelectorAll(".indicator")
    if (!slides.length) return
    slides[currentSlide].classList.remove("active")
    if (indicators.length) indicators[currentSlide].classList.remove("active")
    currentSlide = index
    slides[currentSlide].classList.add("active")
    if (indicators.length) indicators[currentSlide].classList.add("active")
}

function nextSlide() {
    const slides = document.querySelectorAll(".banner-slide")
    if (slides.length) goToSlide((currentSlide + 1) % slides.length)
}

function prevSlide() {
    const slides = document.querySelectorAll(".banner-slide")
    if (slides.length) goToSlide((currentSlide - 1 + slides.length) % slides.length)
}

function startSlideShow() {
    stopSlideShow()
    slideInterval = setInterval(nextSlide, 10000)
}

function stopSlideShow() {
    if (slideInterval) {
        clearInterval(slideInterval)
        slideInterval = null
    }
}

// Product Card Creation - USING YOUR WORKING PRICE LOGIC
function createProductCard(product) {
    const priceValue = product.price || 0;
    const formattedPrice = formatCurrency(priceValue);
    const discount = product.discount || 0;
    const imageUrl = (product.image_urls && product.image_urls.length > 0) ? product.image_urls[0] : '';

    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
                ${discount > 0 ? `<div class="product-badge">-${discount}% OFF</div>` : ""}
                <button class="favorite-btn" data-action="toggle-favorite" onclick="event.stopPropagation()">
                    <span class="favorite-icon">♡</span>
                </button>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name || "Product"}</div>
                <div class="product-category">${product.category || "Electronics"}</div>
                <div class="product-price-row">
                    <div>
                        <span class="product-price">N ${formattedPrice}</span>
                    </div>
                    <button class="add-to-cart-btn" data-action="add-to-cart" onclick="event.stopPropagation()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Display Functions
function displayProducts(container, products) {
    if (!container) return;
    if (!products || products.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">No products available.</p>';
        return;
    }

    container.innerHTML = products.map(createProductCard).join("");

    // Setup Listeners
    container.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("click", (e) => {
            if (!e.target.closest("[data-action]")) {
                const productId = card.dataset.productId;
                const product = cachedProducts.find((p) => String(p.id) === String(productId));
                if (product) openProductModal(product);
            }
        });
    });

    container.querySelectorAll('[data-action="add-to-cart"]').forEach((btn) => {
        btn.addEventListener("click", () => {
            const productId = btn.closest(".product-card").dataset.productId;
            addToCart(productId);
        });
    });
}

async function loadProducts() {
    const popularContainer = document.getElementById("popular-products");
    if (popularContainer) {
        popularContainer.innerHTML = `<div class="splash-loader-inline">LOADING...</div>`;
    }

    try {
        const response = await fetch(API_ENDPOINT, { 
            headers: { 
                "Accept": "application/json",
                "Authorization": `Bearer ${AUTH_TOKEN}`
            } 
        });
        if (!response.ok) throw new Error("Network error");
        
        const result = await response.json();
        const products = result.data || [];
        cachedProducts = products;

        if (popularContainer) {
            // Shuffle for "Items You Like"
            const shuffled = [...products].sort(() => Math.random() - 0.5).slice(0, 8);
            displayProducts(popularContainer, shuffled);
        }

        displayCategorySections(products);
    } catch (error) {
        console.error(error);
        if (popularContainer) popularContainer.innerHTML = "<p>Error loading products.</p>";
    }
}

function displayCategorySections(products) {
    const container = document.getElementById("category-sections");
    if (!container) return;

    // Grouping logic
    const categoryMap = {};
    products.forEach(p => {
        const cat = p.category || "General";
        if (!categoryMap[cat]) categoryMap[cat] = [];
        categoryMap[cat].push(p);
    });

    container.innerHTML = Object.keys(categoryMap).map(cat => `
        <section class="product-section">
            <div class="section-header">
                <h2 class="section-title">${cat}</h2>
                <button class="see-all-btn" data-category="${cat}">See All</button>
            </div>
            <div class="product-grid">
                ${categoryMap[cat].slice(0, 4).map(createProductCard).join("")}
            </div>
        </section>
    `).join("");

    // Re-attach listeners for dynamically created cards
    container.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("click", (e) => {
            if (!e.target.closest("[data-action]")) {
                const productId = card.dataset.productId;
                const product = cachedProducts.find((p) => String(p.id) === String(productId));
                if (product) openProductModal(product);
            }
        });
    });
}

// Modal - USING YOUR WORKING CALCULATIONS
function openProductModal(product) {
    const modal = document.getElementById("product-modal");
    const modalDetails = document.getElementById("modal-details");
    if (!modal || !modalDetails) return;

    const price = product.price || 0;
    const discount = product.discount || 0;
    // Your exact calculation for the crossed-out price:
    const costPrice = Math.round((100 * price) / (100 - discount));
    const imageUrl = (product.image_urls && product.image_urls.length > 0) ? product.image_urls[0] : '';

    modalDetails.innerHTML = `
        <div class="modal-product-layout">
            <div class="modal-image-wrapper">
                <img src="${imageUrl}" alt="${product.name}" class="modal-product-image">
            </div>
            <div class="modal-product-details">
                <h1>${product.name}</h1>
                <div class="modal-price-container">
                    <span class="modal-discount-badge">${discount}% OFF</span>
                    <span class="modal-old-price">N ${formatCurrency(costPrice)}</span>
                    <span class="price-arrow"> ⇒ </span>
                    <span class="modal-product-price">N ${formatCurrency(price)}</span>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn modal-btn-primary" onclick="redirectToStore()">SHOP NOW</button>
                    <button class="modal-btn modal-btn-secondary" onclick="addToCart(${product.id})">ADD TO CART</button>
                </div>
                <div class="modal-product-description">
                    <h3>Description</h3>
                    <p>${product.description || "No description available."}</p>
                </div>
            </div>
        </div>
    `;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeProductModal() {
    const modal = document.getElementById("product-modal");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
}

// Redirect and Cart Helpers
function addToCart(productId) {
    showMessage("Product added to cart!");
}

function redirectToStore() {
    const messageDiv = document.getElementById("redirect-message");
    if (messageDiv) {
        messageDiv.classList.add("message-visible");
        setTimeout(() => { window.location.href = MOBILE_STORE_URL; }, 1500);
    }
}

function showMessage(msg) {
    const messageDiv = document.getElementById("redirect-message");
    if (messageDiv) {
        messageDiv.textContent = msg;
        messageDiv.classList.add("message-visible");
        setTimeout(() => { messageDiv.classList.remove("message-visible"); }, 2000);
    }
}

// Initialization
function initApp() {
    initTheme();
    initBannerCarousel();
    loadProducts();

    document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeProductModal(); });
}

document.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById("splash-screen");
    setTimeout(() => {
        splash?.classList.add("fade-out");
        setTimeout(() => {
            if (splash) splash.style.display = "none";
            initApp();
        }, 600);
    }, 1500);
});

// Global exports
window.closeProductModal = closeProductModal;
window.redirectToStore = redirectToStore;
window.addToCart = addToCart;
