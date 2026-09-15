/* =================================================================
 * 1. CONSTANTS & GLOBALS
 * ================================================================= */
const API_URL = "http://localhost:5678/api";
const gallery = document.querySelector(".gallery");
let selectedCategory = "all";
const token = localStorage.getItem("token");
const editBanner = document.querySelector(".edit-banner");
const editProjects = document.querySelector("#edit-projects");
const loginLink = document.querySelector("#login-link");
const filters = document.querySelector(".filter-buttons");

/* =================================================================
 * 2. WORKS DISPLAY & FETCHING
 * ================================================================= */
function displayWorks(works) {
  gallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.dataset.workId = String(work.id);
    figure.dataset.category = String(work.categoryId);
    figure.hidden = selectedCategory !== "all" && figure.dataset.category !== selectedCategory;

    const image = document.createElement("img");
    image.src = work.imageUrl;
    image.alt = work.title;

    const caption = document.createElement("figcaption");
    caption.textContent = work.title;

    figure.append(image, caption);
    gallery.appendChild(figure);
  });
}

async function loadWorks() {
  try {
    const response = await fetch(`${API_URL}/works`);
    if (!response.ok) throw new Error("Impossible de récupérer les projets.");
    displayWorks(await response.json());
  } catch (error) {
    gallery.innerHTML = "<p>Les projets ne sont pas disponibles pour le moment.</p>";
    console.error(error);
  }
}

/* =================================================================
 * 3. AUTHENTICATION & ADMIN MODE MANAGEMENT
 * ================================================================= */
if (token) {
  editBanner.hidden = false;
  editProjects.hidden = false;
  filters.hidden = true;
  loginLink.textContent = "logout";
  loginLink.href = "#";

  loginLink.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    window.location.reload();
  });
}

/* =================================================================
 * 4. CATEGORIES FILTERING
 * ================================================================= */
function applyFilter(category) {
  selectedCategory = category;
  filters.querySelectorAll(".filter-button").forEach((button) => {
    const active = button.dataset.category === category;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  gallery.querySelectorAll("figure").forEach((card) => {
    card.hidden = category !== "all" && card.dataset.category !== category;
  });
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-button");
  if (button && filters.contains(button)) applyFilter(button.dataset.category);
});

async function loadCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error("Impossible de récupérer les catégories.");
    const categories = await response.json();
    
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-button";
      button.dataset.category = String(category.id);
      button.textContent = category.name;
      button.setAttribute("aria-pressed", "false");
      filters.appendChild(button);
    });
  } catch (error) {
    const message = document.createElement("p");
    message.setAttribute("role", "status");
    message.textContent = "Les filtres par catégorie sont indisponibles. Tous les projets restent consultables.";
    filters.appendChild(message);
    console.error(error);
  }
}

/* =================================================================
 * 5. INITIALIZATION & DATA LOADING
 * ================================================================= */
loadWorks();
loadCategories();

/* =================================================================
 * 6. CONTACT FORM VALIDATION
 * ================================================================= */
const contactForm = document.querySelector("#contact form");

if (contactForm) {
  // Affiche les erreurs directement dans le formulaire.
  contactForm.noValidate = true;
  const contactError = document.querySelector("#contact-error");

  contactForm.addEventListener("submit", (event) => {
    contactError.textContent = "";
    const fields = [
      contactForm.querySelector("#name"),
      contactForm.querySelector("#email"),
      contactForm.querySelector("#message")
    ];
    const emptyField = fields.find((field) => field.value.trim() === "");

    if (emptyField) {
      event.preventDefault();
      contactError.textContent = "Veuillez renseigner tous les champs avant de soumettre votre message.";
      emptyField.focus();
      return;
    }

    if (!contactForm.checkValidity()) {
      event.preventDefault();
      contactError.textContent = "Veuillez saisir une adresse e-mail valide.";
      contactForm.querySelector("#email").focus();
    }
  });
}