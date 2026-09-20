// 1. SÉLECTION DES ÉLÉMENTS HTML
const modal = document.querySelector(".modal");
const modalContent = document.querySelector(".modal-content");
let modalGallery = document.querySelector(".modal-gallery");
const closeBtn = document.querySelector(".modal-close");
const addPhotoBtn = document.querySelector(".add-photo-btn");
const editProjectsBtn = document.querySelector("#edit-projects");

// 2. OUVERTURE / FERMETURE DE LA MODALE
let modalReturnFocus = null;

function openModal() {
    modalReturnFocus = document.activeElement;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    closeBtn.focus();
    if (modal.querySelector(".modal-gallery")) {
        displayModalGallery();
    } else {
        showGallery();
    }
}

function closeModal() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    clearPhotoPreview();
    if (modalReturnFocus?.isConnected) modalReturnFocus.focus();
}

function clearPhotoPreview() {
    const preview = modalContent.querySelector(".upload-preview");
    if (preview?.getAttribute("src")) {
        URL.revokeObjectURL(preview.src);
        preview.removeAttribute("src");
        preview.hidden = true;
    }
}

// Garder la navigation au clavier dans la fenêtre ouverte.
document.addEventListener("keydown", (event) => {
    if (modal.style.display === "none") return;
    if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(modal.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]'
    )).filter((element) => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first) {
        event.preventDefault();
        return;
    }
    if (!modal.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
});

// Ouverture depuis le bouton « modifier » du mode édition.
editProjectsBtn?.addEventListener("click", openModal);

// Fermeture en cliquant sur X
closeBtn.addEventListener("click", closeModal);

// Fermeture en cliquant hors de la modale
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// 3. RÉCUPÉRATION DES PROJETS
async function getWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) throw new Error("Impossible de charger les projets.");
    const works = await response.json();
    if (!Array.isArray(works)) throw new Error("Liste des projets invalide.");
    return works;
}

// 4. AFFICHAGE DES PROJETS DANS LA MODALE
async function displayModalGallery() {
    const targetGallery = modalGallery;
    try {
        const works = await getWorks();
        if (!targetGallery.isConnected) return;
        targetGallery.innerHTML = "";

        works.forEach(work => {
            const figure = document.createElement("figure");
            figure.classList.add("modal-item");
            figure.dataset.workId = String(work.id);

            const img = document.createElement("img");
            img.src = work.imageUrl;
            img.alt = work.title;

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.setAttribute("aria-label", `Supprimer ${work.title}`);
            deleteBtn.innerHTML = `
                <svg aria-hidden="true" width="10" height="12" viewBox="0 0 448 512" fill="currentColor">
                    <path d="M135.2 17.7 140.6 0h166.8l5.4 17.7L328 32h88c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64s14.3-32 32-32h88l15.2-14.3zM32 128h384l-21.2 339.4C393.5 493 372.2 512 346.7 512H101.3c-25.5 0-46.8-19-48.1-44.6L32 128zm112 80v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16s-16 7.2-16 16zm128 0v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16s-16 7.2-16 16z" />
                </svg>`;

            deleteBtn.addEventListener("click", () => deleteWork(work.id, deleteBtn));

            figure.appendChild(img);
            figure.appendChild(deleteBtn);
            targetGallery.appendChild(figure);
        });
    } catch (error) {
        if (!targetGallery.isConnected) return;
        const message = document.createElement("p");
        message.setAttribute("role", "alert");
        message.textContent = "Impossible de charger les projets. Fermez puis rouvrez la fenêtre pour réessayer.";
        targetGallery.replaceChildren(message);
        console.error(error);
    }
}

// 5. SUPPRESSION D'UNE PHOTO
async function deleteWork(id, button) {
    if (button?.disabled) return;
    if (button) button.disabled = true;
    modalContent.querySelector(".delete-error")?.remove();

    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Veuillez vous reconnecter pour supprimer un projet.");

        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(response.status === 401 || response.status === 403
                ? "Votre connexion ne permet pas cette suppression. Veuillez vous reconnecter."
                : "La suppression a échoué. Veuillez réessayer.");
        }

        // Retirer les deux représentations uniquement après confirmation du serveur.
        document.querySelectorAll(".gallery figure, .modal-gallery figure").forEach((card) => {
            if (card.dataset.workId === String(id)) card.remove();
        });
    } catch (error) {
        modalContent.querySelector(".delete-error")?.remove();
        const message = document.createElement("p");
        message.className = "delete-error";
        message.setAttribute("role", "alert");
        message.textContent = error instanceof TypeError
            ? "Le serveur est inaccessible. Veuillez réessayer."
            : error.message;
        modalContent.appendChild(message);
        console.error(error);
    } finally {
        if (button) button.disabled = false;
    }
}

// 6. PASSAGE À LA MODALE "AJOUTER UNE PHOTO" ET NAVIGATION
function showAddPhotoForm() {
    modalContent.innerHTML = `
        <button class="modal-back" type="button" aria-label="Retour à la galerie">
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5l-7 7 7 7M5 12h14" />
            </svg>
        </button>
        <h2 id="modal-title">Ajout photo</h2>

        <form id="add-photo-form" class="add-photo-form" novalidate>
            <div class="upload-area">
                <svg class="upload-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                    <circle cx="8.5" cy="9" r="1.5"></circle>
                    <path d="m21 15-5-5L5 20"></path>
                </svg>
                <label for="photo-file">+ Ajouter photo</label>
                <input type="file" id="photo-file" accept="image/png, image/jpeg" required>
                <small>jpg, png : 4 Mo max</small>
                <img class="upload-preview" alt="Aperçu de la photo" hidden>
            </div>

            <label for="photo-title">Titre</label>
            <input type="text" id="photo-title" required>

            <label for="photo-category">Catégorie</label>
            <select id="photo-category" required>
                <option value="" selected disabled></option>
            </select>

            <p class="upload-error" role="alert"></p>
            <div class="add-photo-submit">
                <button type="submit" disabled>Valider</button>
            </div>
        </form>
    `;

    const form = modalContent.querySelector("#add-photo-form");
    const fileInput = modalContent.querySelector("#photo-file");
    const titleInput = modalContent.querySelector("#photo-title");
    const categoryInput = modalContent.querySelector("#photo-category");
    const submitButton = form.querySelector("button[type='submit']");
    const preview = modalContent.querySelector(".upload-preview");
    const message = form.querySelector(".upload-error");

    const updateSubmitState = () => {
        const error = validatePhotoForm(form);
        submitButton.disabled = Boolean(error) || form.dataset.sending === "true";
        message.textContent = message.dataset.categoryError || error;
    };

    fileInput.addEventListener("change", () => {
        if (preview.getAttribute("src")) URL.revokeObjectURL(preview.src);
        preview.removeAttribute("src");
        preview.hidden = true;
        const file = fileInput.files[0];
        if (file && !validatePhotoFile(file)) {
            preview.src = URL.createObjectURL(file);
            preview.hidden = false;
        }
        updateSubmitState();
    });

    titleInput.addEventListener("input", updateSubmitState);
    categoryInput.addEventListener("change", updateSubmitState);
    loadPhotoCategories(categoryInput, message);
    modalContent.querySelector(".modal-back").addEventListener("click", showGallery);
    form.addEventListener("submit", uploadPhoto);
    modalContent.querySelector(".modal-back").focus();
}

function showGallery() {
    clearPhotoPreview();
    modalContent.innerHTML = `
        <h2 id="modal-title">Galerie photo</h2>
        <div class="modal-gallery"></div>
        <div class="modal-actions">
            <button class="add-photo-btn" type="button">Ajouter une photo</button>
        </div>
    `;
    modalGallery = modalContent.querySelector(".modal-gallery");
    modalContent.querySelector(".add-photo-btn").addEventListener("click", showAddPhotoForm);
    displayModalGallery();
    modalContent.querySelector(".add-photo-btn").focus();
}

addPhotoBtn?.addEventListener("click", showAddPhotoForm);

// 7. ENVOI ET VALIDATION D'UNE NOUVELLE PHOTO
function validatePhotoFile(file) {
    if (!file) return "Sélectionnez une image.";
    if (!["image/jpeg", "image/png"].includes(file.type)) return "Choisissez une image JPG ou PNG.";
    if (file.size > 4 * 1024 * 1024) return "L’image ne doit pas dépasser 4 Mo.";
    if (!file.size) return "Le fichier image est vide.";
    return "";
}

function validatePhotoForm(form) {
    const fileError = validatePhotoFile(form.querySelector("#photo-file").files[0]);
    if (fileError) return fileError;
    if (!form.querySelector("#photo-title").value.trim()) return "Renseignez un titre.";
    const select = form.querySelector("#photo-category");
    if (!select.value || !Array.from(select.options).some(option => !option.disabled && option.value === select.value)) {
        return "Choisissez une catégorie.";
    }
    return "";
}

async function loadPhotoCategories(select, message) {
    select.disabled = true;
    delete message.dataset.categoryError;
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) throw new Error("Impossible de charger les catégories. Rouvrez le formulaire pour réessayer.");
        const categories = await response.json();

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = String(category.id);
            option.textContent = category.name;
            select.appendChild(option);
        });

        if (!categories.length) throw new Error("Aucune catégorie disponible.");
        select.disabled = false;
    } catch (error) {
        message.dataset.categoryError = "Impossible de charger les catégories. Rouvrez le formulaire pour réessayer.";
        message.textContent = message.dataset.categoryError;
        console.error(error);
    }
}

async function uploadPhoto(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.sending === "true") return;

    const message = form.querySelector(".upload-error");
    const validationError = validatePhotoForm(form);
    message.textContent = validationError;
    if (validationError) return;

    const submit = form.querySelector("button[type='submit']");
    form.dataset.sending = "true";
    submit.disabled = true;

    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Veuillez vous reconnecter pour ajouter un projet.");

        const formData = new FormData();
        formData.append("image", form.querySelector("#photo-file").files[0]);
        formData.append("title", form.querySelector("#photo-title").value.trim());
        formData.append("category", form.querySelector("#photo-category").value);

        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) {
            throw new Error(response.status === 401 || response.status === 403
                ? "Veuillez vous reconnecter pour ajouter un projet."
                : "L’ajout a échoué. Vérifiez les champs et réessayez.");
        }

        // Le serveur confirme l’enregistrement avant le retour à la galerie.
        window.location.reload();
    } catch (error) {
        message.textContent = error instanceof TypeError
            ? "Le serveur est inaccessible. Veuillez réessayer."
            : error.message;
        console.error(error);
    } finally {
        form.dataset.sending = "false";
        submit.disabled = Boolean(validatePhotoForm(form));
    }
}