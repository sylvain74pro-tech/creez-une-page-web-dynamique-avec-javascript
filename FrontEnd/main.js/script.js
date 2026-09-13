const API_URL = "http://localhost:5678/api";
const gallery = document.querySelector(".gallery");
const filterButtons = document.querySelectorAll(".filter-button");
const token = localStorage.getItem("token");
const editBanner = document.querySelector(".edit-banner");
const editProjects = document.querySelector("#edit-projects");
const loginLink = document.querySelector("#login-link");
const filters = document.querySelector(".filter-buttons");

function displayWorks(works) {
  gallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.dataset.category = String(work.categoryId);

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

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedCategory = button.dataset.category;
    const projectCards = document.querySelectorAll(".gallery figure");

    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    projectCards.forEach((card) => {
      card.hidden = selectedCategory !== "all" && card.dataset.category !== selectedCategory;
    });
  });
});

loadWorks();
