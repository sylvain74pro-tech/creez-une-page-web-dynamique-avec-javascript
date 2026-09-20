// URL de l’API
const API_URL = "http://localhost:5678/api";

// Sélection de la galerie (protégée pour Jest)
const gallery = typeof document !== "undefined"
    ? document.querySelector(".gallery")
    : null;

let selectedCategory = "all";

// Vérification du token
function getUnexpiredToken() {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return null;

    try {
        const parts = storedToken.split(".");
        if (parts.length !== 3 || parts.some((part) => !part)) {
            throw new Error("Format incorrect");
        }

        const payload = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const paddedPayload = payload.padEnd(
            Math.ceil(payload.length / 4) * 4,
            "="
        );

        const { exp } = JSON.parse(atob(paddedPayload));

        if (Number.isFinite(exp) && exp * 1000 > Date.now()) {
            return storedToken;
        }
    } catch {}

    localStorage.removeItem("token");
    return null;
}

const token = getUnexpiredToken();

// Sélection des éléments du mode édition
const editBanner = typeof document !== "undefined"
    ? document.getElementById("edit-banner")
    : null;

const editProjects = typeof document !== "undefined"
    ? document.getElementById("edit-projects")
    : null;

const loginLink = typeof document !== "undefined"
    ? document.getElementById("login-link")
    : null;

const filtersContainer = typeof document !== "undefined"
    ? document.querySelector(".filter-buttons")
    : null;

// Activation du mode édition
if (token && typeof document !== "undefined") {
    if (editBanner) editBanner.hidden = false;
    if (editProjects) editProjects.hidden = false;
    if (filtersContainer) filtersContainer.hidden = true;

    if (loginLink) {
        loginLink.textContent = "logout";
        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            window.location.reload();
        });
    }
}

// Chargement des projets
async function loadWorks() {
    try {
        const response = await fetch(`${API_URL}/works`);
        if (!response.ok) throw new Error("Erreur réseau");

        const works = await response.json();
        displayWorks(works);
    } catch (error) {
        console.error(error);

        if (gallery) {
            gallery.innerHTML =
                "<p role='status'>Impossible de charger les projets.</p>";
        }
    }
}

// Affichage des projets
function displayWorks(works) {
    if (!gallery) return;

    const fragment = document.createDocumentFragment();

    works.forEach((work) => {
        const figure = document.createElement("figure");

        figure.dataset.workId = String(work.id);
        figure.dataset.category = String(work.categoryId);

        figure.hidden =
            selectedCategory !== "all" &&
            figure.dataset.category !== selectedCategory;

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

// Chargement des catégories
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error("Erreur catégories");

        const categories = await response.json();
        setupFilters(categories);
    } catch (error) {
        console.error(error);
    }
}

// Création des boutons de filtre
function setupFilters(categories) {
    if (!filtersContainer) return;

    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter-btn", "is-active");
    allButton.dataset.category = "all";

    allButton.addEventListener("click", () => {
        applyFilter("all", allButton);
    });

    filtersContainer.appendChild(allButton);

    categories.forEach((cat) => {
        const btn = document.createElement("button");

        btn.textContent = cat.name;
        btn.classList.add("filter-btn");
        btn.dataset.category = String(cat.id);

        btn.addEventListener("click", () => {
            applyFilter(String(cat.id), btn);
        });

        filtersContainer.appendChild(btn);
    });
}

// Application du filtre
function applyFilter(categoryId, activeBtn) {
    selectedCategory = categoryId;

    if (typeof document === "undefined") return;

    document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("is-active");
    });

    activeBtn.classList.add("is-active");

    document.querySelectorAll(".gallery figure").forEach((figure) => {
        const matches =
            selectedCategory === "all" ||
            figure.dataset.category === selectedCategory;

        figure.hidden = !matches;
    });
}

// Chargement initial
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        loadWorks();
        loadCategories();
    });
}
