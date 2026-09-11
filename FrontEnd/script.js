const worksApiUrl = "http://localhost:5678/api/works";

function updateEditingMode() {
    const token = localStorage.getItem("token");
    const editBanner = document.querySelector(".edit-banner");
    const editProjects = document.querySelector("#edit-projects");
    const loginLink = document.querySelector("#login-link");

    if (!token) return;

    editBanner.hidden = false;
    editProjects.hidden = false;
    loginLink.textContent = "logout";
    loginLink.href = "#";
    loginLink.addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("token");
        window.location.reload();
    });
}

function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";

    works.forEach((work) => {
        const figure = document.createElement("figure");
        const image = document.createElement("img");
        const caption = document.createElement("figcaption");

        image.src = work.imageUrl;
        image.alt = work.title;
        caption.textContent = work.title;

        figure.append(image, caption);
        gallery.appendChild(figure);
    });
}

async function loadWorks() {
    try {
        const response = await fetch(worksApiUrl);
        if (!response.ok) {
            throw new Error(`Erreur API : ${response.status}`);
        }

        displayWorks(await response.json());
    } catch (error) {
        console.error("Impossible de charger les projets.", error);
    }
}

updateEditingMode();
loadWorks();
