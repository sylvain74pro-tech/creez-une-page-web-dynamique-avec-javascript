// Afficher les éléments du mode édition si un token est présent.
const token = sessionStorage.getItem("token");
const banniere = document.querySelector("#edit-banner");
const boutonModifier = document.querySelector("#edit-projects");

if (token) {
  banniere.hidden = false;
  boutonModifier.hidden = false;
}

// Récupérer les projets du serveur et les afficher dans la galerie.
async function chargerProjets() {
  try {
    const reponse = await fetch("http://localhost:5678/api/works");

    if (!reponse.ok) {
      throw new Error("Impossible de récupérer les projets.");
    }

    const projets = await reponse.json();
    const galerie = document.querySelector(".gallery");
    galerie.replaceChildren();

    // Créer une photo et un titre pour chaque projet.
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

// Garder la catégorie choisie, même après ajout ou suppression de photo.
let categorieActive = "tous";
// Aucun bouton coloré avant le premier clic.
let filtreSelectionne = null;
const zoneFiltres = document.querySelector(".filter-buttons");
// Masquer les filtres en mode édition.
zoneFiltres.hidden = Boolean(token);

// Afficher uniquement les projets de la catégorie choisie.
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

// Créer un bouton de filtre et son action au clic.
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

// Récupérer les catégories réelles du serveur.
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

// Lancer le chargement à l’ouverture de la page.
chargerProjets();

chargerFiltres();


// Adapter le menu et permettre la déconnexion.
const lienConnexion = document.querySelector("#login-link");

if (token) {
  lienConnexion.textContent = "logout";

  lienConnexion.addEventListener("click", function (evenement) {
    evenement.preventDefault();

    // Retirer uniquement la preuve de connexion de cet onglet.
    sessionStorage.removeItem("token");

    // Recharger la page en mode visiteur.
    window.location.href = "index.html";
  });
}


