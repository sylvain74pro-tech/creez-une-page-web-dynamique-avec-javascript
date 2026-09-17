// 1. Variables principales
const API_URL = "http://localhost:5678/api";
const gallery = document.querySelector(".gallery");
let selectedCategory = "all";
// Ce contrôle améliore l'affichage ; seul le serveur valide la signature et les droits.
function getUnexpiredToken() {
  const storedToken = localStorage.getItem("token");
  if (!storedToken) return null;

  try {
    const parts = storedToken.split(".");
    if (parts.length !== 3 || parts.some((part) => !part)) {
      throw new Error("Format de token incorrect.");
    }
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const { exp } = JSON.parse(atob(paddedPayload));
    if (Number.isFinite(exp) && exp * 1000 > Date.now()) return storedToken;
  } catch {
    // Une session illisible doit être remplacée par une nouvelle connexion.
  }

  localStorage.removeItem("token");
  return null;
}

const token = getUnexpiredToken();
const editBanner = document.querySelector(".edit-banner");
const editProjects = document.querySelector("#edit-projects");
const loginLink = document.querySelector("#login-link");
const filters = document.querySelector(".filter-buttons");

// 2. Affichage et chargement des projets
function displayWorks(works) {
  const fragment = document.createDocumentFragment();

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
    fragment.appendChild(figure);
  });

  gallery.replaceChildren(fragment);
}

async function loadWorks() {
  try {
    const response = await fetch(`${API_URL}/works`);
    if (!response.ok) throw new Error("Impossible de récupérer les projets.");
    const works = await response.json();
    displayWorks(works);
  } catch (error) {
    const message = document.createElement("p");
    message.setAttribute("role", "status");
    message.textContent = "Les projets sont indisponibles. Veuillez réessayer plus tard.";
    gallery.replaceChildren(message);
    console.error(error);
  }
}

// 3. Mode édition et déconnexion
if (token) {
  editBanner.hidden = false;
  editProjects.hidden = false;
  filters.hidden = true;
  loginLink.textContent = "logout";
  loginLink.href = "#";

  loginLink.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "index.html"; 
  });
}

// 4. Filtres des catégories
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
    const fragment = document.createDocumentFragment();

    categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-button";
      button.dataset.category = String(category.id);
      button.textContent = category.name;
      button.setAttribute("aria-pressed", "false");
      fragment.appendChild(button);
    });

    filters.appendChild(fragment);
  } catch (error) {
    const message = document.createElement("p");
    message.setAttribute("role", "status");
    message.textContent = "Les filtres par catégorie sont indisponibles. Tous les projets restent consultables.";
    filters.appendChild(message);
    console.error(error);
  }
}

// 5. Chargement initial
loadWorks();
loadCategories();

// 6. Vérification du formulaire de contact
const contactForm = document.querySelector("#contact form");
const contactError = document.querySelector("#contact-error");
const contactFields = ["name", "email", "message"].map((id) =>
  contactForm.querySelector(`#${id}`)
);

// Afficher les erreurs dans la page, y compris pour un champ rempli d'espaces.
contactForm.noValidate = true;
contactFields.forEach((field) => {
  field.required = true;
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const emptyFields = contactFields.filter((field) => !field.value.trim());
  contactFields.forEach((field) => field.removeAttribute("aria-invalid"));
  contactError.textContent = "";

  if (emptyFields.length) {
    contactError.textContent = "Veuillez remplir les trois champs : nom, e-mail et message.";
    emptyFields.forEach((field) => field.setAttribute("aria-invalid", "true"));
    emptyFields[0].focus();
    return;
  }

  const emailField = contactFields[1];
  if (!emailField.validity.valid) {
    contactError.textContent = "Veuillez saisir une adresse e-mail valide.";
    emailField.setAttribute("aria-invalid", "true");
    emailField.focus();
    return;
  }

  // Aucun service d'envoi de messages n'est disponible dans l'API actuelle.
  contactError.textContent = "L'envoi de messages n'est pas encore disponible. Votre message n'a pas été envoyé.";
});
