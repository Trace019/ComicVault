const productContainer = document.getElementById("hotManga");
const productDetailPage = document.querySelector(".product-detail");

if (productContainer) {
    displayProducts();
} /* else if (productDetailPage){
    displayProductsDetail();
} */

function displayProducts() {
    fetch("jsonfiles/product.json") //fetching jason data
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load JSON");
            }
            return response.json();
        })
        .then(data => {
            data.forEach(product => {
                const mangaCard = document.createElement("div");
                mangaCard.classList.add("manga-card");

                const latestVol = product.volume[product.volume.length - 1];

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
                    // to optimize going to a product info page 
                });
            });
        })
        .catch(error => {
            console.error(" Error:", error);
        });
}


function displayProductsDetail() {
    const productData = JSON.parse(sessionStorage.getItem("selectedProduct"));
    if (!productData) return;

    const mainImageCont  = document.querySelector(".main-image");
    const productTitle   = document.querySelector(".product-title");
    const productPrice   = document.querySelector(".product-price");
    const productDesc    = document.querySelector(".product-description");
    const langOptions    = document.querySelector(".lang-options");
    const volOptions     = document.querySelector(".volume-options");
    const addToCartBtn   = document.querySelector("#add-cart-btn");

    // Start with latest volume
    let selectedVolume = productData.volume[productData.volume.length - 1];
    let selectedLanguage = selectedVolume.language[0];

    function updateProductDisplay(volumeData) {
        mainImageCont.innerHTML = `<img src="${volumeData.image}" alt="${productData.name}">`;

        langOptions.innerHTML = "";
        volumeData.language.forEach(lang => {
            const btn = document.createElement("button");
            btn.textContent = lang;
            if (lang === selectedLanguage) {
                btn.classList.add("selected");
            }

            btn.addEventListener("click", () => {
                selectedLanguage = lang;
                updateProductDisplay(volumeData);
            });

            langOptions.appendChild(btn);
        });

        volOptions.innerHTML = "";
        productData.volume.forEach(vol => {
            const btn = document.createElement("button");
            btn.textContent = vol.volNum;
            if (vol.volNum === volumeData.volNum) {
                btn.classList.add("selected");
            }

            btn.addEventListener("click", () => {
                selectedVolume = vol;
                selectedLanguage = vol.language[0];
                updateProductDisplay(vol);
            });

            volOptions.appendChild(btn);
        });
    }

    productTitle.textContent = productData.name;
    productPrice.textContent = `₱${productData.price}`;
    productDesc.textContent = productData.sypnosis;

    updateProductDisplay(selectedVolume);

    addToCartBtn.addEventListener("click", () => {
        alert(`${productData.name} Vol ${selectedVolume.volNum} (${selectedLanguage}) added to cart!`);
    });
    
    console.log("Loading volume:", volumeData.volNum, "→", volumeData.image);

    mainImageCont.innerHTML = `<img src="${volumeData.image}" alt="${productData.name}">`;

}

document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".product-detail")) {
        displayProductsDetail();
    }
});

function backToRecent() {
    history.back();
}

const addWish = document.getElementById("addWish");
if (addWish) {
    addWish.addEventListener("click", () => {
        addWish.classList.replace("fa-regular", "fa-solid");
        alert("Added to Wishlist!");
    });
}
