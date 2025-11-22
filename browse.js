// =========================
// ! BROWSING FUNCTIONALITY
// =========================

const grid = document.getElementById("browseGrid");
const searchBar = document.getElementById("searchBar");
const tagFilter = document.getElementById("tagFilter");
const sortFilter = document.getElementById("sortFilter");
let mangaList = [];

fetch("jsonfiles/product.json")
    .then(res => res.json())
    .then(data => {
        mangaList = data;
        renderManga(mangaList);
    });

//- MAnga Render
function renderManga(list) {
    grid.innerHTML = "";

    list.forEach(product => {
        const latestVolume = product.volume[product.volume.length - 1];

        const card = document.createElement("div");
        card.classList.add("manga-card");

        card.innerHTML = `
            <img src="${latestVolume.image}" alt="cover">
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
                    <p>Vol ${latestVolume.volNum}</p>
                </div>

                <button class="view-button">View Now</button>
            </div>
        `;

        card.addEventListener("click", () => {
            sessionStorage.setItem("selectedProduct", JSON.stringify(product));
            window.location.href = "product-info.html";
        });
        grid.appendChild(card);
    });
}

searchBar.addEventListener("input", filterAll);

tagFilter.addEventListener("change", filterAll);

sortFilter.addEventListener("change", filterAll);

function filterAll() {
    let filtered = [...mangaList];

    const searchVal = searchBar.value.toLowerCase();
    const tagVal = tagFilter.value;
    const sortVal = sortFilter.value;

    if (searchVal) {
        filtered = filtered.filter(m =>
            m.name.toLowerCase().includes(searchVal) ||
            m.author.toLowerCase().includes(searchVal)
        );
    }

    if (tagVal) {
        filtered = filtered.filter(m =>
            m.tag01 === tagVal ||
            m.tag02 === tagVal ||
            m.tag03 === tagVal
        );
    }

    if (sortVal === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortVal === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    //- So it renders the filtered manga's
    renderManga(filtered);
}
