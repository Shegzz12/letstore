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
  if (typeof price !== "number") return "N 0.00"
  return price
    .toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace("NGN", "N")
}

function calculateDiscount(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
}

function getRandomProducts(products, count) {
  if (!products || products.length === 0) return []
  const shuffled = [...products].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function groupProductsByCategory(products) {
  const categoryMap = {}
  products.forEach((product) => {
    const category = product.category?.trim() || "Uncategorized"
    if (!categoryMap[category]) {
      categoryMap[category] = []
    }
    categoryMap[category].push(product)
  })
  return categoryMap
}

function getAuthHeaders(contentType = "application/json") {
  if (!AUTH_TOKEN) {
    console.warn("Authentication required. Bearer Token missing.")
    return null
  }
  return {
    "Content-Type": contentType,
    Authorization: `Bearer ${AUTH_TOKEN}`,
  }
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
      // Moon icon for dark mode
      icon.innerHTML = `
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            `
    } else {
      // Sun icon for light mode
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

// Banner Carousel
function initBannerCarousel() {
  const slides = document.querySelectorAll(".banner-slide")
  const indicators = document.querySelector(".banner-indicators")

  // Create indicators
  slides.forEach((_, index) => {
    const indicator = document.createElement("div")
    indicator.className = "indicator"
    if (index === 0) indicator.classList.add("active")
    indicator.addEventListener("click", () => goToSlide(index))
    indicators.appendChild(indicator)
  })

  // Auto-play
  startSlideShow()

  // Navigation buttons
  document.querySelector(".banner-nav.prev")?.addEventListener("click", prevSlide)
  document.querySelector(".banner-nav.next")?.addEventListener("click", nextSlide)
}

function goToSlide(index) {
  const slides = document.querySelectorAll(".banner-slide")
  const indicators = document.querySelectorAll(".indicator")

  slides[currentSlide].classList.remove("active")
  indicators[currentSlide].classList.remove("active")

  currentSlide = index

  slides[currentSlide].classList.add("active")
  indicators[currentSlide].classList.add("active")
}

function nextSlide() {
  const slides = document.querySelectorAll(".banner-slide")
  goToSlide((currentSlide + 1) % slides.length)
}

function prevSlide() {
  const slides = document.querySelectorAll(".banner-slide")
  goToSlide((currentSlide - 1 + slides.length) % slides.length)
}

function startSlideShow() {
  stopSlideShow()
  slideInterval = setInterval(nextSlide, 10000) // 10 seconds
}

function stopSlideShow() {
  if (slideInterval) {
    clearInterval(slideInterval)
    slideInterval = null
  }
}

// Product Card Creation
function createProductCard(product) {
  const discount = calculateDiscount(product.price, product.old_price)
  const imageUrl = Array.isArray(product.image_urls) ? product.image_urls[0] : product.image_urls

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
                <div class="product-name">${product.name}</div>
                <div class="product-category">${product.category || "Electronics"}</div>
                <div class="product-price-row">
                    <div>
                        <span class="product-price">${formatCurrency(product.price)}</span>
                        ${
                          product.old_price && product.old_price > product.price
                            ? `<span class="product-old-price">${formatCurrency(product.old_price)}</span>`
                            : ""
                        }
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
    `
}

// Product Display
function displayProducts(container, products) {
  if (!container || !products || products.length === 0) {
    if (container)
      container.innerHTML =
        '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">No products available.</p>'
    return
  }

  container.innerHTML = products.map(createProductCard).join("")

  // Add click handlers to product cards
  container.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (!e.target.closest("[data-action]")) {
        const productId = card.dataset.productId
        const product = cachedProducts.find((p) => p.id == productId)
        if (product) openProductModal(product)
      }
    })
  })

  // Add handlers for cart buttons
  container.querySelectorAll('[data-action="add-to-cart"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.closest(".product-card").dataset.productId
      addToCart(productId)
    })
  })
}

// Load Products from Backend
async function loadProducts() {
  const popularContainer = document.getElementById("popular-products")

  if (popularContainer) {
    popularContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; padding: 40px;">
                <div class="splash-loader" style="width: 30px; height: 30px;"></div>
                <p style="margin-top: 15px; color: ${PRIMARY_COLOR}; font-weight: 600;">LOADING PRODUCTS...</p>
            </div>
        `
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      headers: { Accept: "application/json" },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const result = await response.json()
    const products = result.data || []

    cachedProducts = products

    if (products.length === 0) {
      if (popularContainer) {
        popularContainer.innerHTML = '<p style="text-align: center; padding: 40px;">No products available.</p>'
      }
      return
    }

    // Display "Items You Like" section
    if (popularContainer) {
      displayProducts(popularContainer, getRandomProducts(products, 8))
    }

    // Display category sections
    displayCategorySections(products)
  } catch (error) {
    console.error("Error loading products:", error)
    if (popularContainer) {
      popularContainer.innerHTML = `
                <p style="text-align: center; color: red; padding: 40px;">
                    Error loading products. ${error.message}. Please check your internet connection.
                </p>
            `
    }
  }
}

// Display Category Sections
function displayCategorySections(products) {
  const categorySectionsContainer = document.getElementById("category-sections")
  if (!categorySectionsContainer) return

  const categoryMap = groupProductsByCategory(products)
  const categories = Object.keys(categoryMap).sort(() => Math.random() - 0.5)

  categorySectionsContainer.innerHTML = categories
    .map((category) => {
      const categoryProducts = getRandomProducts(categoryMap[category], 8)
      return `
            <section class="product-section">
                <div class="section-header">
                    <h2 class="section-title">${category}</h2>
                    <button class="see-all-btn" data-category="${category}">See All</button>
                </div>
                <div class="product-grid" data-category-grid="${category}">
                    ${categoryProducts.map(createProductCard).join("")}
                </div>
            </section>
        `
    })
    .join("")

  // Add click handlers
  categorySectionsContainer.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (!e.target.closest("[data-action]")) {
        const productId = card.dataset.productId
        const product = cachedProducts.find((p) => p.id == productId)
        if (product) openProductModal(product)
      }
    })
  })

  // Add handlers for cart buttons
  categorySectionsContainer.querySelectorAll('[data-action="add-to-cart"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.closest(".product-card").dataset.productId
      addToCart(productId)
    })
  })
}

// Product Modal
function openProductModal(product) {
  const modal = document.getElementById("product-modal")
  const modalDetails = document.getElementById("modal-details")

  if (!modal || !modalDetails) return

  const discount = calculateDiscount(product.price, product.old_price)
  const imageUrl = Array.isArray(product.image_urls) ? product.image_urls[0] : product.image_urls

  modalDetails.innerHTML = `
        <div class="modal-product-layout">
            <div>
                <img src="${imageUrl}" alt="${product.name}" class="modal-product-image">
            </div>
            <div class="modal-product-details">
                <h1>${product.name}</h1>
                ${
                  discount > 0
                    ? `
                    <div class="modal-discount-info">
                        <span class="modal-discount-badge">${discount}% OFF</span>
                        <span class="modal-old-price">${formatCurrency(product.old_price)}</span>
                        <span> ⇒ </span>
                        <span class="modal-product-price">${formatCurrency(product.price)}</span>
                    </div>
                `
                    : `
                    <div class="modal-product-price">${formatCurrency(product.price)}</div>
                `
                }
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
    `

  modal.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeProductModal() {
  const modal = document.getElementById("product-modal")
  if (modal) {
    modal.classList.remove("active")
    document.body.style.overflow = ""
  }
}

// Cart Functions
function addToCart(productId) {
  showMessage("Product added to cart successfully!", "success")
  console.log("Adding to cart:", productId)
  // In a real app, you would make an API call here
}

function redirectToStore() {
  const messageDiv = document.getElementById("redirect-message")
  if (messageDiv) {
    messageDiv.classList.add("message-visible")
    setTimeout(() => {
      window.location.href = MOBILE_STORE_URL
    }, 2000)
  }
}

// Show Message
function showMessage(message, type = "success") {
  const messageDiv = document.getElementById("redirect-message")
  if (messageDiv) {
    messageDiv.textContent = message
    messageDiv.style.background = type === "success" ? "var(--success)" : "var(--error)"
    messageDiv.classList.add("message-visible")
    setTimeout(() => {
      messageDiv.classList.remove("message-visible")
    }, 3000)
  }
}

// Initialize App
function initApp() {
  // Initialize theme
  initTheme()

  // Initialize banner carousel
  initBannerCarousel()

  // Load products
  loadProducts()

  // Event listeners
  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme)
  document.getElementById("search-btn")?.addEventListener("click", () => {
    showMessage("Search functionality coming soon!", "success")
  })
  document.getElementById("notifications-btn")?.addEventListener("click", () => {
    showMessage("No new notifications", "success")
  })

  // See All buttons
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("see-all-btn")) {
      const category = e.target.dataset.category
      showMessage(`Showing all ${category} products...`, "success")
    }
  })

  // Keyboard support for modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeProductModal()
    }
  })
}

// Handle Splash Screen
document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash-screen")
  const splashDuration = 2000
  const fadeDuration = 1000

  setTimeout(() => {
    splash?.classList.add("fade-out")
    setTimeout(() => {
      if (splash) splash.style.display = "none"
      initApp()
    }, fadeDuration)
  }, splashDuration)
})

// Export functions for inline event handlers
window.closeProductModal = closeProductModal
window.redirectToStore = redirectToStore
window.addToCart = addToCart
