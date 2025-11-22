// ! Current Theme's
const themeValue = ["ender", "bio", "pastel"];

// ! Theme Applier
function applyTheme(theme, save = true) {
  document.body.classList.remove(...themeValue.map(t => "theme-" + t));

  if (themeValue.includes(theme)) {
    document.body.classList.add("theme-" + theme);
    if (save) localStorage.setItem("theme", theme);
  } else {
    if (save) localStorage.removeItem("theme");
  }
}

// - Load on Page =}
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

//- Auto Fill

