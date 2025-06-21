const API_URL = 'https://fakestoreapi.com/products';


let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Api-dan mehsullari cagir
async function fetchProducts(limit = 20, page = 1) {
    try {
        const response = await fetch(`${API_URL}?limit=${limit}&page=${page}`);
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Home ve product page e yigmaq
async function populateProducts(sectionId, limit = 4) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const products = await fetchProducts(limit);
    section.innerHTML = products.map(product => `
        <div class="pro" onclick="window.location.href='product_details.html?id=${product.id}'">
            <img src="${product.image}" alt="${product.title}">
            <div class="des">
                <span>${product.category}</span>
                <h5>${product.title}</h5>
                <div class="star">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.round(product.rating.rate))}
                </div>
                <h4>$${product.price.toFixed(2)}</h4>
            </div>
            <a href="#" class="add-to-cart" data-id="${product.id}"><i class="fal fa-shopping-cart cart"></i></a>
        </div>
    `).join('');

    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-id');
            addToCart(productId);
        });
    });
}

// Single product detallari
async function populateProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId) return;

    try {
        const response = await fetch(`${API_URL}/${productId}`);
        const product = await response.json();
        const productContainer = document.querySelector('.single-pro-details');
        if (productContainer) {
            productContainer.innerHTML = `
                <h6>Home / ${product.category}</h6>
                <h4>${product.title}</h4>
                <h2>$${product.price.toFixed(2)}</h2>
                <select name="size">
                    <option>Select Size</option>
                    <option>XXL</option>
                    <option>XL</option>
                    <option>L</option>
                    <option>M</option>
                    <option>S</option>
                </select>
                <input type="number" value="1" min="1">
                <button class="normal add-to-cart" data-id="${product.id}">Add To Cart</button>
                <h4>Product Details</h4>
                <span>${product.description}</span>
            `;
            document.querySelector('.single-pro-image img').src = product.image;

            // Add to cart buttonu
            document.querySelector('.add-to-cart').addEventListener('click', () => {
                addToCart(product.id);
            });
        }

       
        populateProducts('related-products', 4);
    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}

// Cart mentiqi
function addToCart(productId) {
    fetch(`${API_URL}/${productId}`)
        .then(res => res.json())
        .then(product => {
            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            alert('Product added to cart!');
            updateCart();
        });
}

function updateCart() {
    const cartTable = document.querySelector('.cart-info');
    if (!cartTable) return;

    cartTable.innerHTML = `
        <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Subtotal</th>
        </tr>
        ${cart.map(item => `
            <tr>
                <td>
                    <div class="cart-info">
                        <img src="${item.image}" alt="${item.title}">
                        <div>
                            <p>${item.title}</p>
                            <small>Price: $${item.price.toFixed(2)}</small>
                            <br>
                            <a href="#" class="remove-item" data-id="${item.id}">Remove</a>
                        </div>
                    </div>
                </td>
                <td><input type="number" value="${item.quantity}" min="1" class="quantity" data-id="${item.id}"></td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('')}
    `;

    
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    const cartTotal = document.querySelector('.cart-total');
    if (cartTotal) {
        cartTotal.innerHTML = `
            <tr>
                <td>Subtotal</td>
                <td>$${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Tax</td>
                <td>$${tax.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Total</td>
                <td>$${total.toFixed(2)}</td>
            </tr>
        `;
    }

  
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const id = button.getAttribute('data-id');
            cart = cart.filter(item => item.id !== parseInt(id));
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        });
    });

    document.querySelectorAll('.quantity').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = input.getAttribute('data-id');
            const value = parseInt(e.target.value);
            if (value < 1) e.target.value = 1;
            const item = cart.find(item => item.id === parseInt(id));
            if (item) {
                item.quantity = value;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
            }
        });
    });
}

// Search menqtiqi
function setupSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search products...';
    searchInput.className = 'search-bar';
    document.querySelector('.s-product .row').prepend(searchInput);

    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.toLowerCase();
        const products = await fetchProducts();
        const filtered = products.filter(product => product.title.toLowerCase().includes(query));
        const section = document.getElementById('all-products');
        section.innerHTML = filtered.map(product => `
            <div class="pro" onclick="window.location.href='product_details.html?id=${product.id}'">
                <img src="${product.image}" alt="${product.title}">
                <div class="des">
                    <span>${product.category}</span>
                    <h5>${product.title}</h5>
                    <div class="star">
                        ${'<i class="fas fa-star"></i>'.repeat(Math.round(product.rating.rate))}
                    </div>
                    <h4>$${product.price.toFixed(2)}</h4>
                </div>
                <a href="#" class="add-to-cart" data-id="${product.id}"><i class="fal fa-shopping-cart cart"></i></a>
            </div>
        `).join('');
    });
}

// Pagination ve load more
let currentPage = 1;
async function setupPagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.textContent = 'Load More';
    loadMoreBtn.className = 'load-more';
    pagination.innerHTML = '';
    pagination.appendChild(loadMoreBtn);

    loadMoreBtn.addEventListener('click', async () => {
        currentPage++;
        const products = await fetchProducts(4, currentPage);
        const section = document.getElementById('all-products');
        section.innerHTML += products.map(product => `
            <div class="pro" onclick="window.location.href='product_details.html?id=${product.id}'">
                <img src="${product.image}" alt="${product.title}">
                <div class="des">
                    <span>${product.category}</span>
                    <h5>${product.title}</h5>
                    <div class="star">
                        ${'<i class="fas fa-star"></i>'.repeat(Math.round(product.rating.rate))}
                    </div>
                    <h4>$${product.price.toFixed(2)}</h4>
                </div>
                <a href="#" class="add-to-cart" data-id="${product.id}"><i class="fal fa-shopping-cart cart"></i></a>
            </div>
        `).join('');
    });
}

// Infinite scroll mentiqi
function setupInfiniteScroll() {
    const section = document.getElementById('all-products');
    if (!section) return;

    window.addEventListener('scroll', async () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            currentPage++;
            const products = await fetchProducts(4, currentPage);
            section.innerHTML += products.map(product => `
                <div class="pro" onclick="window.location.href='product_details.html?id=${product.id}'">
                    <img src="${product.image}" alt="${product.title}">
                    <div class="des">
                        <span>${product.category}</span>
                        <h5>${product.title}</h5>
                        <div class="star">
                            ${'<i class="fas fa-star"></i>'.repeat(Math.round(product.rating.rate))}
                        </div>
                        <h4>$${product.price.toFixed(2)}</h4>
                    </div>
                    <a href="#" class="add-to-cart" data-id="${product.id}"><i class="fal fa-shopping-cart cart"></i></a>
                </div>
            `).join('');
        }
    });
}

// Filter mentiqi
async function setupFilter() {
    const filterSelect = document.createElement('select');
    filterSelect.innerHTML = `
        <option value="">Default Sort</option>
        <option value="price">Sort By Price</option>
        <option value="rating">Sort By Rating</option>
        <option value="category">Sort By Category</option>
    `;
    document.querySelector('.s-product .row').prepend(filterSelect);

    filterSelect.addEventListener('change', async (e) => {
        const sortBy = e.target.value;
        let products = await fetchProducts();
        if (sortBy === 'price') {
            products.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'rating') {
            products.sort((a, b) => b.rating.rate - a.rating.rate);
        } else if (sortBy === 'category') {
            products.sort((a, b) => a.category.localeCompare(b.category));
        }
        const section = document.getElementById('all-products');
        section.innerHTML = products.map(product => `
            <div class="pro" onclick="window.location.href='product_details.html?id=${product.id}'">
                <img src="${product.image}" alt="${product.title}">
                <div class="des">
                    <span>${product.category}</span>
                    <h5>${product.title}</h5>
                    <div class="star">
                        ${'<i class="fas fa-star"></i>'.repeat(Math.round(product.rating.rate))}
                    </div>
                    <h4>$${product.price.toFixed(2)}</h4>
                </div>
                <a href="#" class="add-to-cart" data-id="${product.id}"><i class="fal fa-shopping-cart cart"></i></a>
            </div>
        `).join('');
    });
}


document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('featured-products')) {
        populateProducts('featured-products', 4);
        populateProducts('latest-products', 4);
    }
    if (document.getElementById('all-products')) {
        populateProducts('all-products', 12);
        setupSearch();
        setupPagination();
        setupInfiniteScroll();
        setupFilter();
    }
    if (document.querySelector('.single-pro-details')) {
        populateProductDetails();
    }
    if (document.querySelector('.cart-info')) {
        updateCart();
    }
});


