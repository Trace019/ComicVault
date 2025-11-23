// ! Logo Redirect

document.querySelector(".logo").addEventListener("click", () => {
  window.location.href = "homepage.html";
});

// ! Current Theme
const themeValue = ["ender", "bio", "pastel"];

// ! Theme Applier 
function applyTheme(theme, save = true) {
    document.body.classList.remove(...themeValue.map(t => "theme-" + t))

    if(themeValue.includes(theme)) {
        document.body.classList.add("theme-" + theme);
        if(save) {
            localStorage.setItem("theme", theme);
        }
    } else {
        if(save) {
            localStorage.removeItem("theme");
        }
    }
}

// ! Theme Loader

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && themeValue.includes(savedTheme)) {
        applyTheme(savedTheme, false);
    }

    const select = document.getElementById("themeSelect");
    if (select) {
        select.value = savedTheme || "";
        select.addEventListener("change", () => {
            applyTheme(select.value);
        });
    }
});

//  - Auto Fill on setting.html

const autoSync = "autoSync";
function setupAutoSave() {
    const inputs = document.querySelectorAll("input[id$='-autoA']");
    inputs.forEach(input => {
        input.addEventListener("input", () => {
            const savedData = JSON.parse(localStorage.getItem(autoSync)) || {};
            const key = input.id.replace("-autoA", "");
            savedData[key] = input.value;
            localStorage.setItem(autoSync, JSON.stringify(savedData));
        });
    });
}

// * autoFill for address/phone-autoa and B on checkout.html
function setupAutoFill() {
    const savedData = JSON.parse(localStorage.getItem(autoSync)) || {};
    const inputs = document.querySelectorAll("input[id$='-autoA']" );
    const outputs = document.querySelectorAll("input[id$='-autoB']" );

    inputs.forEach(input => {
        const inputKey = input.id.replace("-autoA", "");
        if (savedData[inputKey]) {
            input.value = savedData[inputKey];
        }
    });

    outputs.forEach(input => {
        const outputKey = input.id.replace("-autoB", "");
        if (savedData[outputKey]) {
            input.value = savedData[outputKey];
        }
    });
}

// - Onload
document.addEventListener("DOMContentLoaded", () => {
    setupAutoSave();
    setupAutoFill();
});