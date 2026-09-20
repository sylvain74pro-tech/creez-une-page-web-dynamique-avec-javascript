const API_URL = "http://localhost:5678/api";

const gallery = typeof document !== "undefined" ? document.querySelector(".gallery") : null;
let selectedCategory = "all";

function getUnexpiredToken() {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return null;

    try {
        const parts = storedToken.split(".");
        if (parts.length !== 3 || parts.some((part) => !part)) throw new Error("Format incorrect");

        const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const paddedPayload = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
        const { exp } = JSON.parse(atob(paddedPayload));

        if (Number.isFinite(exp) && exp * 1000 > Date.now()) return storedToken;
    } catch {}

    localStorage.removeItem("token");
    return null;
}

const token = getUnexpiredToken();

const editBanner = typeof document !== "undefined" ? document.getElementById("edit-banner") : null;
const editProjects = typeof document !== "undefined" ? document.getElementById("edit-projects") : null;
const loginLink = typeof document !== "undefined" ? document.getElementById("login-link") : null;
const filtersContainer = typeof document !== "undefined" ? document.querySelector(".filter-buttons") : null;

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

async function loadWorks() {
    try {
        const response = await fetch(`${API_URL}/works`);
        if (!response.ok) throw new Error("Erreur réseau");

        const works = await response.json();
        displayWorks(works);
    } catch (error) {
        console.error(error);
        if (gallery) gallery.innerHTML = "<p role='status'>Impossible de charger les projets.</p>";
    }
}

function displayWorks(works) {
    if (!gallery) return;

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

function setupFilters(categories) {
    if (!filtersContainer) return;

    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter-button");
    allButton.dataset.category = "all";
    allButton.addEventListener("click", () => applyFilter("all", allButton));
    filtersContainer.appendChild(allButton);

    categories.forEach((cat) => {
        const btn = document.createElement("button");
        btn.textContent = cat.name;
        btn.classList.add("filter-button");
        btn.dataset.category = String(cat.id);
        btn.addEventListener("click", () => applyFilter(String(cat.id), btn));
        filtersContainer.appendChild(btn);
    });
}

function applyFilter(categoryId, activeBtn) {
    selectedCategory = categoryId;

    if (typeof document === "undefined") return;

    document.querySelectorAll(".filter-button").forEach((btn) => btn.classList.remove("active"));
    activeBtn.classList.add("active");

    document.querySelectorAll(".gallery figure").forEach((figure) => {
        const matches = selectedCategory === "all" || figure.dataset.category === selectedCategory;
        figure.hidden = !matches;
    });
}

if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        loadWorks();
        loadCategories();
    });
}

// Validation du formulaire de contact.
const contactForm = document.querySelector("#contact-form");
if (contactForm) {
    const contactError = document.querySelector("#contact-error");
    const fields = ["name", "email", "message"].map(id => document.getElementById(id));
    const missingMessages = ["Veuillez renseigner votre nom.", "Veuillez renseigner votre e-mail.", "Veuillez écrire votre message."];
    let submitted = false;
    contactForm.noValidate = true;
    contactError.setAttribute("role", "alert");
    fields.forEach(field => {
        field.required = true;
        field.setAttribute("aria-describedby", "contact-error");
    });

    function validateContact() {
        const errors = [];
        let firstInvalid = null;
        fields.forEach((field, index) => {
            let error = "";
            if (!field.value.trim()) error = missingMessages[index];
            else if (field.id === "email" && !field.validity.valid) error = "Veuillez saisir une adresse e-mail valide.";
            field.setAttribute("aria-invalid", String(Boolean(error)));
            if (error) {
                errors.push(error);
                firstInvalid ||= field;
            }
        });
        contactError.textContent = errors.join(" ");
        return firstInvalid;
    }

    contactForm.addEventListener("submit", event => {
        event.preventDefault();
        submitted = true;
        const firstInvalid = validateContact();
        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }
        // Aucun service d'envoi n'est configuré pour ce formulaire (action="#").
        contactError.textContent = "Les champs sont valides, mais l’envoi du message n’est pas encore configuré.";
    });
    fields.forEach(field => field.addEventListener("input", () => {
        if (submitted) validateContact();
    }));
}