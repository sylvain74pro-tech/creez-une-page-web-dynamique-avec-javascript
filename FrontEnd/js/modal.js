const modale = document.querySelector("#modal");
const ouvrirModale = document.querySelector("#edit-projects");

ouvrirModale.addEventListener("click", function () {
  // Revenir à la galerie à chaque ouverture de la modale.
  vueAjout.hidden = true;
  vueGalerie.hidden = false;
  modale.setAttribute("aria-labelledby", "modal-title");
  modale.style.display = "flex";
  modale.setAttribute("aria-hidden", "false");
  fermerModale.focus();
});
const fermerModale = document.querySelector(".modal-close");
fermerModale.addEventListener("click", function () {
  modale.style.display = "none";
  modale.setAttribute("aria-hidden", "true");
  ouvrirModale.focus();
});
document.addEventListener("keydown", function (evenement) {
  if (evenement.key === "Escape" && modale.style.display === "flex") {
    modale.style.display = "none";
    modale.setAttribute("aria-hidden", "true");
    ouvrirModale.focus();
  }
});
modale.addEventListener("click", function (evenement) {
    if (evenement.target === modale) {
        modale.style.display = "none";
        modale.setAttribute("aria-hidden", "true");
        ouvrirModale.focus();
    }
});

async function chargerPhotosModale() {
  try {
    const reponse = await fetch("http://localhost:5678/api/works");

    if (!reponse.ok) {
      throw new Error("Impossible de charger les photos.");
    }

    const projets = await reponse.json();
    const galerieModale = document.querySelector(".modal-gallery");

    galerieModale.replaceChildren();

    projets.forEach(function (projet) {
      const figure = document.createElement("figure");
      const image = document.createElement("img");

      image.src = projet.imageUrl;
      image.alt = projet.title;

      const boutonSupprimer = document.createElement("button");
      boutonSupprimer.type = "button";
      const iconeSupprimer = document.createElement("i");
      iconeSupprimer.className = "fa-solid fa-trash-can";
      iconeSupprimer.setAttribute("aria-hidden", "true");
      boutonSupprimer.append(iconeSupprimer);
      boutonSupprimer.setAttribute("aria-label", "Supprimer " + projet.title);

      // Supprimer uniquement après confirmation, avec la preuve de connexion.
      boutonSupprimer.addEventListener("click", async function () {
        if (boutonSupprimer.disabled) return;
        const tokenConnexion = sessionStorage.getItem("token");

        if (!tokenConnexion) {
          alert("Connecte-toi pour supprimer un projet.");
          return;
        }

        if (!confirm("Supprimer le projet : " + projet.title + " ?")) return;
        boutonSupprimer.disabled = true;

        try {
          const reponse = await fetch(
            "http://localhost:5678/api/works/" + projet.id,
            {
              method: "DELETE",
              headers: { Authorization: "Bearer " + tokenConnexion }
            }
          );

          if (!reponse.ok) {
            if (reponse.status === 401 || reponse.status === 403) {
              throw new Error("Connexion expirée ou accès refusé. Reconnecte-toi.");
            }
            throw new Error("La suppression a échoué.");
          }

          // Recharger la galerie principale et celle de la modale.
          await chargerProjets();
          await chargerPhotosModale();
        } catch (erreur) {
          alert(erreur.message);
        } finally {
          boutonSupprimer.disabled = false;
        }
      });

      figure.append(image, boutonSupprimer);
      galerieModale.append(figure);
    });
  } catch (erreur) {
    console.error(erreur.message);
  }
}

chargerPhotosModale();

// Récupérer les deux vues et leurs boutons.
const boutonAjouter = document.querySelector(".add-photo-btn");
const vueGalerie = document.querySelector(".modal-content");
const vueAjout = document.querySelector("#ajout-photo");
const boutonRetour = document.querySelector("#retour-galerie");

// Afficher le formulaire d’ajout.
boutonAjouter.addEventListener("click", function () {
  vueGalerie.hidden = true;
  vueAjout.hidden = false;

  modale.setAttribute("aria-labelledby", "titre-ajout");
  document.querySelector("#photo").focus();
});

// Revenir aux photos.
boutonRetour.addEventListener("click", function () {
  vueAjout.hidden = true;
  vueGalerie.hidden = false;

  modale.setAttribute("aria-labelledby", "modal-title");
  boutonAjouter.focus();
});
// Charger les catégories dans la liste du formulaire.
async function chargerCategories() {
  const liste = document.querySelector("#categorie-photo");
  const message = document.querySelector("#erreur-ajout");

  try {
    const reponse = await fetch("http://localhost:5678/api/categories");

    if (!reponse.ok) {
      throw new Error("Impossible de charger les catégories.");
    }

    const categories = await reponse.json();

    // Conserver une option vide pour demander un choix.
    const choix = document.createElement("option");
    choix.value = "";
    choix.textContent = "Choisir une catégorie";
    liste.replaceChildren(choix);

    categories.forEach(function (categorie) {
      const option = document.createElement("option");

      option.value = categorie.id;
      option.textContent = categorie.name;

      liste.append(option);
    });
  } catch (erreur) {
    message.textContent = erreur.message;
  }
}

chargerCategories();
// Récupérer le champ fichier et l’image d’aperçu.
const champPhoto = document.querySelector("#photo");
const apercuPhoto = document.querySelector("#apercu-photo");

let adresseApercu = null;

champPhoto.addEventListener("change", function () {
  // Libérer l’ancienne adresse temporaire.
  if (adresseApercu) {
    URL.revokeObjectURL(adresseApercu);
    adresseApercu = null;
  }

  apercuPhoto.hidden = true;
  apercuPhoto.removeAttribute("src");

  messageAjout.textContent = "";
  const fichier = champPhoto.files[0];

  if (!fichier) {
    return;
  }

  // Un document ou un autre format ne doit pas créer un aperçu cassé.
  if (!["image/jpeg", "image/png"].includes(fichier.type)) {
    messageAjout.textContent = "Choisis une image JPG ou PNG.";
    return;
  }
  if (fichier.size > 4 * 1024 * 1024) {
    messageAjout.textContent = "Choisis une image de 4 Mo maximum.";
    return;
  }

  // Afficher le fichier choisi sans l’envoyer au serveur.
  adresseApercu = URL.createObjectURL(fichier);
  apercuPhoto.src = adresseApercu;
  apercuPhoto.hidden = false;
});

// Envoyer une nouvelle photo, son titre et sa catégorie au serveur.
const formulaireAjout = document.querySelector("#form-ajout-photo");
const titrePhoto = document.querySelector("#titre-photo");
const categoriePhoto = document.querySelector("#categorie-photo");
const messageAjout = document.querySelector("#erreur-ajout");
const boutonValider = formulaireAjout.querySelector('button[type="submit"]');
let envoiEnCours = false;

// Le bouton devient actif seulement lorsque le formulaire est prêt.
function actualiserBoutonValider() {
  const fichier = champPhoto.files[0];
  const photoValide = fichier
    && ["image/jpeg", "image/png"].includes(fichier.type)
    && fichier.size <= 4 * 1024 * 1024;
  boutonValider.disabled = envoiEnCours || !photoValide
    || !titrePhoto.value.trim() || !categoriePhoto.value;
}
formulaireAjout.addEventListener("input", actualiserBoutonValider);
formulaireAjout.addEventListener("change", actualiserBoutonValider);
actualiserBoutonValider();


formulaireAjout.addEventListener("submit", async function (evenement) {
  evenement.preventDefault();
  if (boutonValider.disabled) return;
  messageAjout.textContent = "";

  const tokenConnexion = sessionStorage.getItem("token");
  const fichier = champPhoto.files[0];
  const titre = titrePhoto.value.trim();
  const categorie = categoriePhoto.value;

  if (!tokenConnexion) {
    messageAjout.textContent = "Reconnecte-toi pour ajouter une photo.";
    return;
  }
  if (!fichier || !titre || !categorie) {
    messageAjout.textContent = "Choisis une photo, un titre et une catégorie.";
    return;
  }
  if (!["image/jpeg", "image/png"].includes(fichier.type)) {
    messageAjout.textContent = "Choisis une image JPG ou PNG.";
    return;
  }

  // Refuser les images dépassant la limite de la maquette.
  if (fichier.size > 4 * 1024 * 1024) {
    messageAjout.textContent = "Choisis une image de 4 Mo maximum.";
    return;
  }

  // FormData transporte le fichier et les champs ensemble.
  const donnees = new FormData();
  donnees.append("image", fichier);
  donnees.append("title", titre);
  donnees.append("category", categorie);

  envoiEnCours = true;
  actualiserBoutonValider();
  const texteBouton = boutonValider.textContent;
  boutonValider.textContent = "Envoi en cours…";

  try {
    const reponse = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: { Authorization: "Bearer " + tokenConnexion },
      // Le navigateur ajoute lui-même le Content-Type de FormData.
      body: donnees
    });

    if (!reponse.ok) {
      if (reponse.status === 401 || reponse.status === 403) {
        throw new Error("Connexion expirée ou accès refusé. Reconnecte-toi.");
      }
      throw new Error("Le serveur a refusé l’ajout de la photo.");
    }

    formulaireAjout.reset();
    if (adresseApercu) {
      URL.revokeObjectURL(adresseApercu);
      adresseApercu = null;
    }
    apercuPhoto.hidden = true;
    apercuPhoto.removeAttribute("src");

    await chargerProjets();
    await chargerPhotosModale();
    boutonRetour.click();
    alert("Photo ajoutée avec succès !");
  } catch (erreur) {
    messageAjout.textContent = erreur instanceof TypeError
      ? "Impossible de contacter le serveur. Vérifie que le serveur est démarré."
      : erreur.message;
  } finally {
    envoiEnCours = false;
    actualiserBoutonValider();
    boutonValider.textContent = texteBouton;
  }
});

// Garder la navigation avec Tab dans la modale.
document.addEventListener("keydown", function (evenement) {
  if (
    evenement.key !== "Tab" ||
    modale.getAttribute("aria-hidden") !== "false"
  ) return;

  const elements = Array.from(
    modale.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]'
    )
  ).filter(function (element) {
    return !element.disabled && element.tabIndex >= 0
      && element.getClientRects().length > 0;
  });

  // Chaque appui déplace explicitement le focus dans la fenêtre.
  evenement.preventDefault();
  if (elements.length === 0) return;

  const positionActuelle = elements.indexOf(document.activeElement);
  const sens = evenement.shiftKey ? -1 : 1;
  const positionSuivante = positionActuelle === -1
    ? (evenement.shiftKey ? elements.length - 1 : 0)
    : (positionActuelle + sens + elements.length) % elements.length;

  elements[positionSuivante].focus();
}, true);
