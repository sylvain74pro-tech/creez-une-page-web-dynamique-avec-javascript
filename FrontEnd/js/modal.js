// Afficher une confirmation ou une erreur.
function afficherMessageGalerie(texte, succes = false) {
  let message = document.querySelector("#erreur-suppression");
  if (!message) {
    message = document.createElement("p");
    message.id = "erreur-suppression";
    message.className = "error-msg";
    message.setAttribute("role", "status");
    document.querySelector(".modal-content").append(message);
  }
  message.className = succes ? "modal-status" : "error-msg";
  message.style.color = succes ? "#1d6154" : "";
  message.style.textAlign = "center";
  message.style.marginTop = "12px";
  message.textContent = texte;
}
// Retrouver la fenêtre de modification.
const modale = document.querySelector("#modal");
const ouvrirModale = document.querySelector("#edit-projects");
// Ouvrir la modale sur la galerie.
ouvrirModale.addEventListener("click", function () {
  afficherMessageGalerie("");

  vueAjout.hidden = true;
  vueGalerie.hidden = false;
  modale.setAttribute("aria-labelledby", "modal-title");
  modale.style.display = "flex";
  modale.setAttribute("aria-hidden", "false");
  fermerModale.focus();
});
// Fermer la modale avec la croix.
const fermerModale = document.querySelector(".modal-close");
fermerModale.addEventListener("click", function () {
  modale.style.display = "none";
  modale.setAttribute("aria-hidden", "true");
  ouvrirModale.focus();
});
// Fermer la modale avec Échap.
document.addEventListener("keydown", function (evenement) {
  if (evenement.key === "Escape" && modale.style.display === "flex") {
    modale.style.display = "none";
    modale.setAttribute("aria-hidden", "true");
    ouvrirModale.focus();
  }
});
// Fermer la modale en cliquant sur le fond.
modale.addEventListener("click", function (evenement) {
  if (evenement.target === modale) {
    modale.style.display = "none";
    modale.setAttribute("aria-hidden", "true");
    ouvrirModale.focus();
  }
});


// Charger les photos dans la modale.
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

      // Demander la suppression de cette photo.
      boutonSupprimer.addEventListener("click", async function () {
        if (boutonSupprimer.disabled) return;

        const tokenConnexion = sessionStorage.getItem("token");

        if (!tokenConnexion) {
          afficherMessageGalerie("Connecte-toi pour supprimer un projet.");
          return;
        }


        afficherMessageGalerie("");
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


          await chargerProjets();
          await chargerPhotosModale();
          afficherMessageGalerie("Photo supprimée.", true);
        } catch (erreur) {
          afficherMessageGalerie(erreur.message);
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

// Retrouver les deux vues et leurs boutons.
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

// Revenir à la galerie.
boutonRetour.addEventListener("click", function () {
  vueAjout.hidden = true;
  vueGalerie.hidden = false;

  modale.setAttribute("aria-labelledby", "modal-title");
  boutonAjouter.focus();
});
// Remplir la liste des catégories.
async function chargerCategories() {
  const liste = document.querySelector("#categorie-photo");
  const message = document.querySelector("#erreur-ajout");

  try {
    const reponse = await fetch("http://localhost:5678/api/categories");

    if (!reponse.ok) {
      throw new Error("Impossible de charger les catégories.");
    }

    const categories = await reponse.json();


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
// Retrouver le champ photo et son aperçu.
const champPhoto = document.querySelector("#photo");
const apercuPhoto = document.querySelector("#apercu-photo");


// Garder l’adresse temporaire de l’aperçu.
let adresseApercu = null;
// Vérifier la photo et afficher son aperçu.
champPhoto.addEventListener("change", function () {

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


  if (!["image/jpeg", "image/png"].includes(fichier.type)) {
    messageAjout.textContent = "Choisis une image JPG ou PNG.";
    return;
  }
  if (fichier.size > 4 * 1024 * 1024) {
    messageAjout.textContent = "Choisis une image de 4 Mo maximum.";
    return;
  }


  adresseApercu = URL.createObjectURL(fichier);
  apercuPhoto.src = adresseApercu;
  apercuPhoto.hidden = false;
});

// Retrouver les champs du formulaire d’ajout.
const formulaireAjout = document.querySelector("#form-ajout-photo");
const titrePhoto = document.querySelector("#titre-photo");
const categoriePhoto = document.querySelector("#categorie-photo");
const messageAjout = document.querySelector("#erreur-ajout");
const boutonValider = formulaireAjout.querySelector('button[type="submit"]');
let envoiEnCours = false;



// Activer Valider quand le formulaire est complet.
function actualiserBoutonValider(evenement) {
  const fichier = champPhoto.files[0];
  const photoValide = fichier
    && ["image/jpeg", "image/png"].includes(fichier.type)
    && fichier.size <= 4 * 1024 * 1024;
  boutonValider.disabled = envoiEnCours || !photoValide
    || !titrePhoto.value.trim() || !categoriePhoto.value;



  if (evenement && !envoiEnCours && (!fichier || photoValide)) {
    const champsManquants = [];
    if (!fichier) champsManquants.push("une photo");
    if (!titrePhoto.value.trim()) champsManquants.push("un titre");
    if (!categoriePhoto.value) champsManquants.push("une catégorie");

    messageAjout.textContent = champsManquants.length
      ? "Complète le formulaire : " + champsManquants.join(", ") + "."
      : "";
  }
}
formulaireAjout.addEventListener("input", actualiserBoutonValider);
formulaireAjout.addEventListener("change", actualiserBoutonValider);
actualiserBoutonValider();



// Contrôler les champs avant l’envoi.
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

  if (fichier.size > 4 * 1024 * 1024) {
    messageAjout.textContent = "Choisis une image de 4 Mo maximum.";
    return;
  }

  // Rassembler la photo, le titre et la catégorie.
  const donnees = new FormData();
  donnees.append("image", fichier);
  donnees.append("title", titre);
  donnees.append("category", categorie);

  envoiEnCours = true;
  actualiserBoutonValider();
  const texteBouton = boutonValider.textContent;
  boutonValider.textContent = "Envoi en cours…";

  try {

    // Envoyer la photo avec le token.
    const reponse = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: { Authorization: "Bearer " + tokenConnexion },

      body: donnees
    });

    if (!reponse.ok) {
      if (reponse.status === 401 || reponse.status === 403) {
        throw new Error("Connexion expirée ou accès refusé. Reconnecte-toi.");
      }
      throw new Error("Le serveur a refusé l’ajout de la photo.");
    }

    // Vider le formulaire et actualiser les galeries.
    formulaireAjout.reset();
    if (adresseApercu) {
      URL.revokeObjectURL(adresseApercu);
      adresseApercu = null;
    }
    apercuPhoto.hidden = true;
    apercuPhoto.removeAttribute("src");

    await chargerProjets();
    await chargerPhotosModale();
    if (modale.getAttribute("aria-hidden") === "false") {
      boutonRetour.click();
    }
    afficherMessageGalerie("Photo ajoutée avec succès.", true);
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

// Garder la navigation au clavier dans la modale.
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

  evenement.preventDefault();
  if (elements.length === 0) return;

  const positionActuelle = elements.indexOf(document.activeElement);
  const sens = evenement.shiftKey ? -1 : 1;
  const positionSuivante = positionActuelle === -1
    ? (evenement.shiftKey ? elements.length - 1 : 0)
    : (positionActuelle + sens + elements.length) % elements.length;

  elements[positionSuivante].focus();
}, true);
