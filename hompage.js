const banner = document.querySelector(".banner");
let slides = document.querySelectorAll(".banner .slide");

let slideIndex = 1;
let intervalId = null;

const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);

firstClone.id = "first-clone";
lastClone.id = "last-clone";

banner.appendChild(firstClone);
banner.insertBefore(lastClone, slides[0]);

slides = document.querySelectorAll(".banner .slide");
banner.style.transform = `translateX(-${slideIndex * 100}%)`;

function initializeSlider() {
  if (slides.length > 0) {
    intervalId = setInterval(nextSlide, 5000); //5 seconds
  }
}

function showSlide() {
  banner.style.transition = "transform 0.6s ease-in-out";
  banner.style.transform = `translateX(-${slideIndex * 100}%)`;
}

function nextSlide() {
  if (slideIndex >= slides.length - 1) return;
  slideIndex++;
  showSlide();
}

function prevSlide() {
  clearInterval(intervalId);
  if (slideIndex <= 0) return;
  slideIndex--;
  showSlide();
}

banner.addEventListener("transitionend", () => {
  if (slides[slideIndex].id === "first-clone") {
    banner.style.transition = "none";
    slideIndex = 1;
    banner.style.transform = `translateX(-${slideIndex * 100}%)`;
  }

  if (slides[slideIndex].id === "last-clone") {
    banner.style.transition = "none";
    slideIndex = slides.length - 2;
    banner.style.transform = `translateX(-${slideIndex * 100}%)`;
  }
});

document.addEventListener("DOMContentLoaded", initializeSlider);
