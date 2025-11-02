// =========================
// * PAGE CONTEXT HANDLER
// =========================

const productContainer = document.getElementById("hotManga");
const productDetailPage = document.querySelector(".product-detail");
const cartPage = document.querySelector(".cart-container");
const vaultPage = document.querySelector(".vault-layout");

// so it displays when a specific class is loaded
if (productContainer) {
    displayProducts();
} else if (productDetailPage) {
    displayProductsDetail();
} else if (cartPage) {
    displayCart();
} else if (vaultPage) {
    displayVault();
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
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];

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

    sessionStorage.setItem("cart", JSON.stringify(cart));
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
  const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  const cartItems = document.querySelector(".cart-items");
  const subtotalElem = document.querySelector(".subtotal");
  const grandTotalElem = document.querySelector(".grand-total");

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    subtotalElem.textContent = "₱0";
    grandTotalElem.textContent = "₱0";
    return;
  }

  // Fetch product info for images and price
  fetch("jsonfiles/product.json")
    .then(response => response.json())
    .then(products => {
      let subtotal = 0;

      cart.forEach((item, index) => {
        const product = products.find(p => String(p.id) === String(item.id));
        if (!product) return;

        const volumeData = product.volume.find(v => String(v.volNum) === String(item.volNum));
        const image = volumeData ? volumeData.image : "images/placeholder.png";
        const price = product.price || 0;
        const totalPrice = price * item.quantity;
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

      // Handle removal
      document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const index = e.currentTarget.dataset.index;
          cart.splice(index, 1);
          sessionStorage.setItem("cart", JSON.stringify(cart));
          displayCart();
        });
      });

      // Handle quantity changes
      document.querySelectorAll(".quantity input").forEach(input => {
        input.addEventListener("input", e => {
          const index = e.currentTarget.dataset.index;
          const newQty = parseInt(e.currentTarget.value);
          if (newQty > 0) {
            cart[index].quantity = newQty;
            sessionStorage.setItem("cart", JSON.stringify(cart));
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
// ! RETURN TO HOMEPAGE
// =========================

function backToRecent() {
    window.location.href = "homepage.html"
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
