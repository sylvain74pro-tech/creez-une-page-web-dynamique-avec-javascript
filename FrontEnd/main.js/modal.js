// ===============================
// 1. Sélection des éléments
// ===============================

const modal = document.querySelector(".modal");
const modalContent = document.querySelector(".modal-content");
let modalGallery = document.querySelector(".modal-gallery");
const closeBtn = document.querySelector(".modal-close");
const addPhotoBtn = document.querySelector(".add-photo-btn");
const editProjectsBtn = document.querySelector("#edit-projects");

// ===============================
// 2. Ouverture / fermeture de la modale
// ===============================

function openModal() {
    modal.style.display = "flex";
    if (modal.querySelector(".modal-gallery")) {
        displayModalGallery();
    } else {
        showGallery();
    }
}

function closeModal() {
    modal.style.display = "none";
}

// Ouverture depuis le bouton « modifier » du mode édition.
editProjectsBtn?.addEventListener("click", openModal);

// Fermeture en cliquant sur X
closeBtn.addEventListener("click", closeModal);

// Fermeture en cliquant hors de la modale
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// ===============================
// 3. Récupération des travaux
// ===============================

async function getWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    return await response.json();
}

// ===============================
// 4. Affichage des travaux dans la modale
// ===============================

async function displayModalGallery() {
    const works = await getWorks();
    modalGallery.innerHTML = "";

    works.forEach(work => {
        const figure = document.createElement("figure");
        figure.classList.add("modal-item");

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

        deleteBtn.addEventListener("click", () => deleteWork(work.id));

        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        modalGallery.appendChild(figure);
    });
}

// ===============================
// 5. Suppression d’une photo
// ===============================

async function deleteWork(id) {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    displayModalGallery(); // rafraîchir la galerie
}

// ===============================
// 6. Passage à la modale "Ajouter une photo"
// ===============================

function showAddPhotoForm() {
    modalContent.innerHTML = `
        <button class="modal-back" type="button" aria-label="Retour à la galerie">←</button>
        <h2 id="modal-title">Ajout photo</h2>

        <form id="add-photo-form" class="add-photo-form">
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
                <option value="1">Objets</option>
                <option value="2">Appartements</option>
                <option value="3">Hôtels & restaurants</option>
            </select>

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
    const updateSubmitState = () => {
        submitButton.disabled = !(fileInput.files.length && titleInput.value.trim() && categoryInput.value);
    };

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
            preview.src = URL.createObjectURL(file);
            preview.hidden = false;
        }
        updateSubmitState();
    });
    titleInput.addEventListener("input", updateSubmitState);
    categoryInput.addEventListener("change", updateSubmitState);
    modalContent.querySelector(".modal-back").addEventListener("click", showGallery);
    form.addEventListener("submit", uploadPhoto);
}

function showGallery() {
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
}

addPhotoBtn.addEventListener("click", showAddPhotoForm);

// ===============================
// 7. Upload d’une nouvelle photo
// ===============================

async function uploadPhoto(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("image", document.querySelector("#photo-file").files[0]);
    formData.append("title", document.querySelector("#photo-title").value);
    formData.append("category", document.querySelector("#photo-category").value);

    await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    alert("Photo ajoutée !");
    window.location.reload();
}

// ===============================
// 8. Initialisation
// ===============================
