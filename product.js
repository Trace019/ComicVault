// =========================
// * PAGE CONTEXT HANDLER
// =========================

const productContainer = document.getElementById("hotManga");
const productDetailPage = document.querySelector(".product-detail");
const cartPage = document.querySelector(".cart-container");
const vaultPage = document.querySelector(".vault-layout");

const checkoutPage = document.querySelector(".base-checkout");

if (productContainer) {
    displayProducts();
} else if (productDetailPage) {
    displayProductsDetail();
} else if (cartPage) {
    displayCart();
} else if (vaultPage) {
    displayVault();
} else if (checkoutPage) {
    displayCheckout();
}



// =========================
// TODO : make better commenrts it hard to read future me
// =========================

// =========================
// ! PRODUCT LIST DISPLAY
// =========================

function displayProducts() {
    fetch("jsonfiles/product.json")
        .then(response => {
            if (!response.ok) throw new Error("Failed to load JSON");
            return response.json();
        })
        .then(data => {
            data.forEach(product => {
                const mangaCard = document.createElement("div");
                mangaCard.classList.add("manga-card");

                const latestVol = product.volume[product.volume.length - 1];
                // generates html snippet
                mangaCard.innerHTML = `
                    <img src="${latestVol.image}" alt="cover">
                    <div class="card-header">
                        <h3 class="manga-title">${product.name}</h3>
                        <p class="mangaka">${product.author}</p>
                        <div class="tags">
                            <p class="indv-tag">${product.tag01}</p>
                            <p class="indv-tag">${product.tag02}</p>
                            <p class="indv-tag">${product.tag03}</p>
                        </div>
                        <div class="card-subheader">
                            <p><i class="fa-solid fa-star"></i> ${product.rating || "5.0"}</p>
                            <p>Vol ${latestVol.volNum}</p>
                        </div>
                        <button class="view-button">View Now</button>
                    </div>
                `;

                productContainer.appendChild(mangaCard);

                const viewBtn = mangaCard.querySelector(".view-button");
                viewBtn.addEventListener("click", () => {
                    sessionStorage.setItem("selectedProduct", JSON.stringify(product));
                    window.location.href = "product-info.html";
                });
            });
        })
        .catch(error => console.error("Error:", error));
}


// =========================
// ! PRODUCT DETAIL PAGE
// =========================

function displayProductsDetail() {
    const productData = JSON.parse(sessionStorage.getItem("selectedProduct"));
    if (!productData) return;

    const mainImageCont = document.querySelector(".main-image");
    const productTitle = document.querySelector(".product-title");
    const productPrice = document.querySelector(".product-price");
    const productDesc = document.querySelector(".product-description");
    const langOptions = document.querySelector(".lang-options");
    const volOptions = document.querySelector(".volume-options");
    const addToCartBtn = document.querySelector("#add-cart-btn");
    const addtoVaultBtn = document.querySelector("#addWish");

    let selectedVolume = productData.volume[productData.volume.length - 1];
    let selectedLanguage = selectedVolume.language[0];

    // Update all visible info
    function updateProductDisplay(volumeData) {
        mainImageCont.innerHTML = `<img src="${volumeData.image}" alt="${productData.name}">`;

        // Language buttons
        langOptions.innerHTML = "";
        volumeData.language.forEach(lang => {
            const btn = document.createElement("button");
            btn.textContent = lang;
            if (lang === selectedLanguage) btn.classList.add("selected");
            btn.addEventListener("click", () => {
                selectedLanguage = lang;
                updateProductDisplay(volumeData);
            });
            langOptions.appendChild(btn);
        });

        // Volume buttons
        volOptions.innerHTML = "";
        productData.volume.forEach(vol => {
            const btn = document.createElement("button");
            btn.textContent = vol.volNum;
            if (vol.volNum === volumeData.volNum) btn.classList.add("selected");
            btn.addEventListener("click", () => {
                selectedVolume = vol;
                selectedLanguage = vol.language[0];
                updateProductDisplay(vol);
                updateVaultIcon(productData, selectedVolume.volNum);
            });
            volOptions.appendChild(btn);
        });

        // Update vault icon each re-render
        updateVaultIcon(productData, volumeData.volNum);
    }

    // Initial setup
    productTitle.textContent = productData.name;
    productPrice.textContent = `₱${productData.price}`;
    productDesc.textContent = productData.sypnosis;
    updateProductDisplay(selectedVolume);

    // Add to cart
    if (addToCartBtn && !addToCartBtn.dataset.listenerAdded) {
        addToCartBtn.addEventListener("click", () => {
            addToCart(productData, selectedVolume.volNum, selectedLanguage);
        });
        addToCartBtn.dataset.listenerAdded = "true";
    }

    // Add to wishlist
    if (addtoVaultBtn && !addtoVaultBtn.dataset.listenerAdded) {
        addtoVaultBtn.addEventListener("click", () => {
            addtoVault(productData, selectedVolume.volNum, selectedLanguage);
        });
        addtoVaultBtn.dataset.listenerAdded = "true";
    }

    // Initial vault state on load
    updateVaultIcon(productData, selectedVolume.volNum);
}


// =========================
// ! CART SYSTEM
// =========================

function addToCart(productData, volNum, language) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItem = cart.find(item =>
        String(item.id) === String(productData.id) &&
        String(item.volNum) === String(volNum) &&
        String(item.language) === String(language)
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: String(productData.id),
            name: productData.name,
            volNum: String(volNum),
            language: language,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    // * Alert msgs
    showToast(`${productData.name} Vol ${volNum} (${language}) added to cart!`);
}


// =========================
// ! WISHLIST / VAULT SYSTEM
// =========================

function addtoVault(productData, volNum, language) {
    let vault = JSON.parse(localStorage.getItem("vaulted")) || [];

    const existingIndex = vault.findIndex(item =>
        String(item.id) === String(productData.id) &&
        String(item.volNum) === String(volNum)
    );

    const volumeData = productData.volume.find(v => String(v.volNum) === String(volNum));
    const imagePath = volumeData ? volumeData.image : "";

    if (existingIndex !== -1) {
        vault.splice(existingIndex, 1);
        showToast(`${productData.name} Vol ${volNum} removed from wishlist`);
    } else {
        vault.push({
            id: String(productData.id),
            name: productData.name,
            volNum: String(volNum),
            language: language || "",
            image: imagePath
        });
        showToast(`${productData.name} Vol ${volNum} added to wishlist`);
    }

    localStorage.setItem("vaulted", JSON.stringify(vault));
    updateVaultIcon(productData, volNum);
}

function updateVaultIcon(productData, volNum) {
    const vault = JSON.parse(localStorage.getItem("vaulted")) || [];
    const vaultIcon = document.getElementById("vaultMark");

    const isVaulted = vault.some(item =>
        String(item.id) === String(productData.id) &&
        String(item.volNum) === String(volNum)
    );

    if (!vaultIcon) return;
    vaultIcon.classList.toggle("fa-solid", isVaulted);
    vaultIcon.classList.toggle("fa-regular", !isVaulted);
    vaultIcon.style.color = isVaulted ? "var(--accent)" : "var(--text-color)";
}


// =========================
// ! VAULT PAGE
// =========================

function displayVault() {
    const vault = JSON.parse(localStorage.getItem("vaulted")) || [];
    const vaultedItems = document.querySelector(".vault-items");

    vaultedItems.innerHTML = "";

    if (vault.length === 0) {
        vaultedItems.innerHTML = "<p>Your vault is empty.</p>";
        return;
    }

    vault.forEach(item => {
        const vaultCard = document.createElement("div");
        vaultCard.classList.add("item-info");
        vaultCard.innerHTML = `
            <div class="image-cont">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="text-cont">
                <h3 class="item-title">${item.name}</h3>
                <p class="item-volume">Volume ${item.volNum}</p>
            </div>
            <button class="rmvbtn" data-id="${item.id}" data-vol="${item.volNum}">Remove</button>
        `;
        vaultedItems.appendChild(vaultCard);
    });

    document.querySelectorAll(".rmvbtn").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = e.currentTarget.dataset.id;
            const vol = e.currentTarget.dataset.vol;
            removeFromVault(id, vol);
            displayVault();
        });
    });
}

function removeFromVault(id, volNum) {
    let vault = JSON.parse(localStorage.getItem("vaulted")) || [];
    vault = vault.filter(item => !(item.id === id && item.volNum == volNum));
    localStorage.setItem("vaulted", JSON.stringify(vault));
}


// =========================
// ! CART PAGE
// =========================

function displayCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItems = document.querySelector(".cart-items");
    const subtotalElem = document.querySelector(".subtotal");
    const grandTotalElem = document.querySelector(".grand-total");

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
        console.log("Cart is empty.");
        subtotalElem.textContent = "₱0";
        grandTotalElem.textContent = "₱0";
        return;
    }

    fetch("jsonfiles/product.json")
        .then(response => response.json())
        .then(products => {
        let subtotal = 0;

        cart.forEach((item, index) => {
            const product = products.find(p => String(p.id) === String(item.id));
            if (!product) {
                console.warn('Oy, ' + item + ' isnt found on product list');
                return;
            };

            // const volumeData = product.volume.find(v => String(v.volNum) === String(item.volNum));
            const volumeData = product.volume ? 
            product.volume.find(v => String(v.volNum) === String(item.volNum)) : null;

            const image = volumeData ? volumeData.image : "images/placeholder.png";
            const price = Number(product.price) || 0;
            const totalPrice = price * (item.quantity || 1);
            subtotal += totalPrice;

            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
            <div class="product">
                <img src="${image}" alt="${product.name}">
                <div class="item-data">
                <p>${product.name}</p>
                <div class="language-volnum-box">
                    <span class="lang">${item.language}</span>
                    <span class="volno">Volume ${item.volNum}</span>
                </div>
                </div>
            </div>
            <span class="price">₱${price}</span>
            <div class="quantity">
                <input type="number" value="${item.quantity}" min="1" data-index="${index}">
            </div>
            <span class="total-price">₱${totalPrice}</span>
            <button class="remove-btn" data-index="${index}">
                <i class="fa-solid fa-xmark"></i>
            </button>
            `;
            cartItems.appendChild(cartItem);
        });

        const deliveryFee = 50;
        subtotalElem.textContent = `₱${subtotal}`;
        grandTotalElem.textContent = `₱${subtotal + deliveryFee}`;

        //# removesle item in le cat
        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.addEventListener("click", e => {
            const index = e.currentTarget.dataset.index;
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            displayCart();
            });
        });

        //- Handle quantity changes
        document.querySelectorAll(".quantity input").forEach(input => {
            input.addEventListener("input", e => {
            const index = e.currentTarget.dataset.index;
            const newQty = parseInt(e.currentTarget.value);
            if (newQty > 0) {
                cart[index].quantity = newQty;
                localStorage.setItem("cart", JSON.stringify(cart));
                displayCart();
            }
            });
        });
        })
    .catch(err => {
    console.error("Error loading product data:", err);
    cartItems.innerHTML = "<p>Error loading cart data.</p>";
    });
}

// =========================
// ? CHECKOUT PAGE
// =========================
function displayCheckout() {
    const checkoutItems = JSON.parse(localStorage.getItem("cart")) || [];
    const checkoutContainer = document.querySelector(".list");

    if (!checkoutContainer) return; // safety

    checkoutContainer.innerHTML = "";

    if (checkoutItems.length === 0) {
        checkoutContainer.innerHTML = "<p>Your cart is empty.</p>";
        document.querySelector(".totalQuantity").textContent = "0";
        document.querySelector(".totalPrice").textContent = "₱0";
        document.querySelector(".totalFee").textContent = "₱50";
        document.querySelector(".totalGrandPrice").textContent = "₱50";
        return;
    }

    fetch("jsonfiles/product.json")
    .then(res => res.json())
    .then(products => {

    let totalItems = 0;
    let totalPrice = 0;

    checkoutItems.forEach(item => {
        const product = products.find(p => String(p.id) === String(item.id));
        if (!product) return;

        const volData = product.volume.find(v => String(v.volNum) === String(item.volNum));
        const image = volData ? volData.image : "images/placeholder.png";
        const price = product.price || 0;
        const total = price * item.quantity;

        totalItems += item.quantity;
        totalPrice += total;

        const card = document.createElement("div");
        card.classList.add("checkoutItem-detail");

        card.innerHTML = `
            <div class="checkoutItem-image">
                <img src="${image}">
            </div>

            <div class="checkoutItem-name">
                <span>${product.name}</span>
                <div class="item-sections">
                    <div class="item-volume">
                        <span>Volume ${item.volNum}</span>
                    </div>
                    <div class="item-language">
                        <span>${item.language}</span>
                    </div>
                </div>
            </div>

            <div class="checkoutItem-qty">
                <span>${item.quantity}</span>
            </div>

            <div class="checkoutItem-price">
                <span>₱${price}</span>
            </div>
        `;


        checkoutContainer.appendChild(card);
        });

        const deliveryFee = 50;

        document.querySelector(".totalQuantity").textContent = totalItems;
        document.querySelector(".totalPrice").textContent = `₱${totalPrice}`;
        document.querySelector(".totalFee").textContent = `₱${deliveryFee}`;
        document.querySelector(".totalGrandPrice").textContent = `₱${totalPrice + deliveryFee}`;
    });
}

// =========================
// - ORDER & INVOICE SYSTEM
// =========================

let productData = [];

async function loadProductData() {
    if (productData.length > 0) return productData;

    try {
        const response = await fetch("jsonfiles/product.json");
        productData = await response.json();
        return productData;
    } catch (error) {
        console.log("Error loading product data:", error);
        return [];
    }
}

function submitOrder() {
    const name = document.getElementById("name").value;
    const contactInfo = document.getElementById("phone-autoB").value;
    const address = document.getElementById("address-autoB").value;
    const payment = document.getElementById("payment").value;

    if (!name || !contactInfo || !address || !payment || payment === "N/A") {
        showToast("Please fill in all the required fields...");
        return false;
    }
    const orderID = "ORD-" + Date.now();
    const orderInfo = {
        orderID,
        customerInfo: {
            name,
            contact: contactInfo,
            address,
            payment
        },
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString(),
        cart: JSON.parse(localStorage.getItem("cart")) || [],
        status: "processing"
    };

    saveOrderToStorage(orderInfo);
    localStorage.setItem("cart", JSON.stringify([]));
    setTimeout(() => {
        window.location.href = `invoice.html?order=${orderID}`;
    }, 500);
    return true;
}

function saveOrderToStorage(orderInfo) {
    let allOrders = JSON.parse(localStorage.getItem("allOrders")) || [];

    // Remove duplicates with same ID
    allOrders = allOrders.filter(o => o.orderID !== orderInfo.orderID);

    allOrders.push(orderInfo);

    // newest first
    allOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    localStorage.setItem("allOrders", JSON.stringify(allOrders));
}

function getOrderFromStorage(orderID) {
    const allOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
    return allOrders.find(o => o.orderID === orderID);
}
function toReceipt() {
    if ((JSON.parse(localStorage.getItem("cart")) || []).length === 0) {
        showToast("The cart is empty");
        return;
    }

    if (submitOrder()) {
        showToast("Your Order is now processing...");
    }
}

// =========================
// ! GENERATE INVOICE PAGE
// =========================

async function generateInvoice() {

    const params = new URLSearchParams(window.location.search);
    const orderID = params.get("order");

    if (!orderID) {
        window.location.href = "orders.html";
        return;
    }

    const orderData = getOrderFromStorage(orderID);

    if (!orderData) {
        document.body.innerHTML = `<h2>Order Not Found</h2>`;
        return;
    }

    document.getElementById("invoice-name").textContent =
        "Name: " + orderData.customerInfo.name;

    // document.getElementById("invoice-email").textContent =
    //     "Email: " + orderData.customerEmail.email;

    document.getElementById("invoice-contact").textContent =
        orderData.customerInfo.contact;

    document.getElementById("invoice-address").textContent =
        orderData.customerInfo.address;

    document.getElementById("invoice-id").textContent =
        orderData.orderID;

    document.getElementById("invoice-date").textContent =
        orderData.date;

    const products = await loadProductData();

    const invoiceContainer = document.querySelector(".invoice-items");
    invoiceContainer.innerHTML = "";

    let subtotal = 0;

    orderData.cart.forEach(item => {
        const product = products.find(p => String(p.id) === String(item.id));
        if (!product) return;

        const price = Number(product.price);
        const total = price * item.quantity;
        subtotal += total;

        const div = document.createElement("div");
        div.classList.add("invoice-content");

        div.innerHTML = `
            <span>${product.name}</span>
            <span>${item.volNum}</span>
            <span>${item.language}</span>
            <span>₱${price}</span>
            <span>${item.quantity}</span>
            <span>₱${total}</span>
        `;

        invoiceContainer.appendChild(div);
    });

    const delivery = 50;
    const grand = subtotal + delivery;

    document.querySelector(".invoice-subtotal p:last-child").textContent = "₱" + subtotal;
    document.querySelector(".invoice-deliveryFee p:last-child").textContent = "₱" + delivery;
    document.querySelector(".invoice-grandtotal p:last-child").textContent = "₱" + grand;

    sessionStorage.setItem(
        "currentInvoiceData",
        JSON.stringify({ orderData, products, subtotal, grand })
    );
}

// =============================
//  PDF DOWNLOAD
// =============================
async function downloadPDF() {
    const invoiceSection = document.querySelector(".printed-receipt");

    if (!invoiceSection) {
        showToast("Invoice section not found.");
        return;
    }

    // Turn the invoice HTML into a canvas
    const canvas = await html2canvas(invoiceSection, {
        scale: 2,
        useCORS: true,
        logging: false
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jspdf.jsPDF("p", "pt", "a4");

    // Fit invoice inside PDF
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${Date.now()}.pdf`);
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadOrders();
});

let productCache = null;

async function loadProductData() {
if (productCache) return productCache;

try {
    const response = await fetch("jsonfiles/product.json");
    productCache = await response.json();
    return productCache;
} catch (error) {
    console.error("Error loading product data:", error);
    return [];
}
}

function getAllOrders() {
return JSON.parse(localStorage.getItem("allOrders")) || [];
}

async function calculateOrderTotal(order) {
    const products = await loadProductData();
    return order.cart.reduce((sum, item) => {
        const product = products.find(p => String(p.id) === String(item.id));
        if (!product) return sum;
        return sum + (Number(product.price) * (item.quantity || 1));
    }, 0);
}

async function loadOrders() {
    const orders = getAllOrders();
    const ordersList = document.getElementById('orders-list');
    const noOrders = document.getElementById('no-orders');

    if (!ordersList || !noOrders) return;

    if (orders.length === 0) {
        ordersList.style.display = 'none';
        noOrders.style.display = 'block';
        return;
    }

    ordersList.style.display = 'block';
    noOrders.style.display = 'none';
    ordersList.innerHTML = '';

    for (const order of orders) {
        const orderTotal = await calculateOrderTotal(order);
        const orderElement = document.createElement('div');
        orderElement.className = 'order-card';
        orderElement.innerHTML = `
            <div class="order-header">
                <h3>Order: ${order.orderID}</h3>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><strong>Date:</strong> ${order.date}</p>
                <p><strong>Items:</strong> ${order.cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} item(s)</p>
                <p><strong>Total:</strong> ₱${orderTotal}</p>
                <p><strong>Payment:</strong> ${order.customerInfo.payment}</p>
            </div>
            <div class="order-actions">
                <button onclick="viewInvoice('${order.orderID}')" class="view-invoice-btn">
                    View Invoice
                </button>
                <button onclick="deleteInvoice('${order.orderID}')" class="delete-invoice-btn">
                    Delete Order
                </button>
            </div>
        `;
        ordersList.appendChild(orderElement);
    }
}

function viewInvoice(orderID) {
    window.location.href = `invoice.html?order=${orderID}`;
}

function deleteInvoice(orderID) {
    if (!orderID) return;

    let allOrders = getAllOrders();
    allOrders = allOrders.filter(order => order.orderID !== orderID);
    localStorage.setItem("allOrders", JSON.stringify(allOrders));
    loadOrders();
    showToast(`Invoice has been deleted.`);
}

// =========================
// ! RETURN TO PAGES
// =========================

function backToRecent() {
    window.location.href = "homepage.html"
}

function toCheckout() {
    if((JSON.parse(localStorage.getItem("cart")) || []).length === 0){
        showToast("The cart is empty");
    } else {
        window.location.href = "checkout.html"
    }
}

document.querySelector(".clearAll").addEventListener("click", () =>{
    localStorage.setItem("vaulted", JSON.stringify([]));
    showToast("Vault cleared!");

    const vaultedItems = document.querySelector(".vault-items");
    if (vaultedItems) vaultedItems.innerHTML = "<p>Your vault is empty.</p>";
});

// =========================
// ! CUSTOM ALERT MESSAGE
// =========================

function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = "toast-message";
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

