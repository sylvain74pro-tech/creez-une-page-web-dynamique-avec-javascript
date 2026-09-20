// Sélection des éléments de la modale (protégés pour Jest)
const modal = typeof document !== "undefined" ? document.getElementById("modal") : null;
const editProjectsBtn = typeof document !== "undefined" ? document.getElementById("edit-projects") : null;
const closeModalBtns = typeof document !== "undefined" ? document.querySelectorAll(".js-modal-close") : [];
const modalGalleryView = typeof document !== "undefined" ? document.getElementById("modal-gallery-view") : null;
const modalAddView = typeof document !== "undefined" ? document.getElementById("modal-add-view") : null;
const addPhotoBtn = typeof document !== "undefined" ? document.getElementById("add-photo-btn") : null;
const backBtn = typeof document !== "undefined" ? document.querySelector(".js-modal-back") : null;

// Ouverture de la modale
if (editProjectsBtn && modal) {
    editProjectsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        loadModalGallery();
    });
}

// Fermeture de la modale
function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    resetAddForm();
}

closeModalBtns.forEach(btn => btn.addEventListener("click", closeModal));

if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
}

// Passage à la vue "ajout"
if (addPhotoBtn && modalGalleryView && modalAddView) {
    addPhotoBtn.addEventListener("click", () => {
        modalGalleryView.style.display = "none";
        modalAddView.style.display = "block";
        loadCategoriesInSelect();
    });
}

// Retour à la galerie
if (backBtn && modalGalleryView && modalAddView) {
    backBtn.addEventListener("click", () => {
        modalAddView.style.display = "none";
        modalGalleryView.style.display = "block";
        resetAddForm();
    });
}

// Chargement de la galerie dans la modale
async function loadModalGallery() {
    if (!modal) return;

    try {
        const response = await fetch(`${API_URL}/works`);
        const works = await response.json();

        const modalGallery = modal.querySelector(".modal-gallery");
        if (!modalGallery) return;

        modalGallery.innerHTML = "";

        works.forEach(work => {
            const figure = document.createElement("figure");
            figure.innerHTML = `
                <img src="${work.imageUrl}" alt="${work.title}">
                <button class="delete-btn" data-id="${work.id}" aria-label="Supprimer">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            modalGallery.appendChild(figure);
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();

                const workId = btn.dataset.id;
                const authToken = localStorage.getItem("token");

                try {
                    const deleteRes = await fetch(`${API_URL}/works/${workId}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${authToken}` }
                    });

                    if (deleteRes.ok) {
                        loadModalGallery();
                        loadWorks();
                    }
                } catch (err) {
                    console.error("Erreur suppression", err);
                }
            });
        });
    } catch (err) {
        console.error("Erreur chargement modale", err);
    }
}

// Chargement des catégories dans le select
async function loadCategoriesInSelect() {
    if (typeof document === "undefined") return;

    const select = document.getElementById("work-category");
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected></option>';

    try {
        const res = await fetch(`${API_URL}/categories`);
        const categories = await res.json();

        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Erreur catégories select", err);
    }
}

// Gestion du formulaire d’ajout
const fileInput = typeof document !== "undefined" ? document.getElementById("file-upload") : null;
const filePreview = typeof document !== "undefined" ? document.getElementById("file-preview") : null;
const uploadBox = typeof document !== "undefined" ? document.querySelector(".upload-box") : null;
const addWorkForm = typeof document !== "undefined" ? document.getElementById("add-work-form") : null;
const validateBtn = typeof document !== "undefined" ? document.getElementById("validate-btn") : null;
const titleInput = typeof document !== "undefined" ? document.getElementById("work-title") : null;
const categorySelect = typeof document !== "undefined" ? document.getElementById("work-category") : null;

// Prévisualisation du fichier
if (fileInput && uploadBox && filePreview) {
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];

        if (file) {
            filePreview.src = URL.createObjectURL(file);
            filePreview.style.display = "block";

            uploadBox.querySelector(".fa-image").style.display = "none";
            uploadBox.querySelector(".upload-btn").style.display = "none";
            uploadBox.querySelector("p").style.display = "none";

            checkFormValidity();
        }
    });
}

// Vérification du formulaire
if (titleInput && categorySelect) {
    [titleInput, categorySelect].forEach(element => {
        element.addEventListener("input", checkFormValidity);
        element.addEventListener("change", checkFormValidity);
    });
}

function checkFormValidity() {
    if (!fileInput || !titleInput || !categorySelect || !validateBtn) return;

    const isValid =
        fileInput.files[0] &&
        titleInput.value.trim() !== "" &&
        categorySelect.value !== "";

    if (isValid) {
        validateBtn.style.backgroundColor = "#1D6154";
        validateBtn.removeAttribute("disabled");
    } else {
        validateBtn.style.backgroundColor = "#A7A7A7";
        validateBtn.setAttribute("disabled", "true");
    }
}

// Soumission du formulaire
if (addWorkForm) {
    addWorkForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("image", fileInput.files[0]);
        formData.append("title", titleInput.value);
        formData.append("category", categorySelect.value);

        const authToken = localStorage.getItem("token");
        const errorMsg = document.getElementById("form-error");

        try {
            const res = await fetch(`${API_URL}/works`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${authToken}` },
                body: formData
            });

            if (res.ok) {
                closeModal();
                loadWorks();
            } else {
                if (errorMsg) {
                    errorMsg.textContent = "Erreur lors de l'ajout.";
                }
            }
        } catch (err) {
            console.error(err);
        }
    });
}

// Réinitialisation du formulaire
function resetAddForm() {
    if (!addWorkForm) return;

    addWorkForm.reset();

    if (filePreview) {
        filePreview.style.display = "none";
    }

    if (uploadBox) {
        uploadBox.querySelector(".fa-image").style.display = "block";
        uploadBox.querySelector(".upload-btn").style.display = "block";
        uploadBox.querySelector("p").style.display = "block";
    }

    if (validateBtn) {
        validateBtn.style.backgroundColor = "#A7A7A7";
        validateBtn.setAttribute("disabled", "true");
    }

    const errorMsg = typeof document !== "undefined"
        ? document.getElementById("form-error")
        : null;

    if (errorMsg) {
        errorMsg.textContent = "";
    }
}
