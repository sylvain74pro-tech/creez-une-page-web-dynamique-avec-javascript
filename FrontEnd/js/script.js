// Afficher le mode édition si un token est présent.
const token = sessionStorage.getItem("token");
const banniere = document.querySelector("#edit-banner");
const boutonModifier = document.querySelector("#edit-projects");

if (token) {
  banniere.hidden = false;
  boutonModifier.hidden = false;
}

// Récupérer les projets et remplir la galerie.
async function chargerProjets() {
  try {
    const reponse = await fetch("http://localhost:5678/api/works");

    if (!reponse.ok) {
      throw new Error("Impossible de récupérer les projets.");
    }

    const projets = await reponse.json();
    const galerie = document.querySelector(".gallery");
    galerie.replaceChildren();

    // Créer une image et un titre pour chaque projet.
    projets.forEach(function (projet) {
      const figure = document.createElement("figure");
      figure.dataset.categorie = String(projet.categoryId);
      const image = document.createElement("img");
      const titre = document.createElement("figcaption");

      image.src = projet.imageUrl;
      image.alt = projet.title;
      titre.textContent = projet.title;

      figure.append(image, titre);
      galerie.append(figure);
      figure.hidden = categorieActive !== "tous" && figure.dataset.categorie !== categorieActive;
    });
  } catch (erreur) {
    console.error(erreur.message);
  }
}

// Mémoriser le filtre choisi.
let categorieActive = "tous";

let filtreSelectionne = null;
const zoneFiltres = document.querySelector(".filter-buttons");

zoneFiltres.hidden = Boolean(token);

// Afficher les projets de la catégorie choisie.
function filtrerProjets(categorie, clicUtilisateur = false) {
  if (clicUtilisateur) filtreSelectionne = String(categorie);
  categorieActive = String(categorie);

  document.querySelectorAll(".gallery figure").forEach(function (figure) {
    figure.hidden = categorieActive !== "tous"
      && figure.dataset.categorie !== categorieActive;
  });

  zoneFiltres.querySelectorAll("button").forEach(function (bouton) {
    const actif = bouton.dataset.categorie === filtreSelectionne;
    bouton.classList.toggle("active", actif);
    bouton.setAttribute("aria-pressed", String(actif));
  });
}

// Créer un bouton de filtre.
function creerBoutonFiltre(nom, categorie) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "filter-button";
  bouton.textContent = nom;
  bouton.dataset.categorie = String(categorie);
  bouton.addEventListener("click", function () {
    filtrerProjets(categorie, true);
  });
  zoneFiltres.append(bouton);
}

// Charger les catégories et leurs boutons.
async function chargerFiltres() {
  zoneFiltres.replaceChildren();
  creerBoutonFiltre("Tous", "tous");
  filtrerProjets(categorieActive);

  try {
    const reponse = await fetch("http://localhost:5678/api/categories");
    if (!reponse.ok) {
      throw new Error("Impossible de charger les filtres.");
    }
    const categories = await reponse.json();
    categories.forEach(function (categorie) {
      creerBoutonFiltre(categorie.name, categorie.id);
    });
    filtrerProjets(categorieActive);
  } catch (erreur) {
    console.error(erreur.message);
  }
}

// Lancer le chargement de la page.
chargerProjets();

chargerFiltres();

// Permettre la déconnexion.
const lienConnexion = document.querySelector("#login-link");

if (token) {
  lienConnexion.textContent = "logout";

  lienConnexion.addEventListener("click", function (evenement) {
    evenement.preventDefault();

    sessionStorage.removeItem("token");

    window.location.href = "index.html";
  });
}
