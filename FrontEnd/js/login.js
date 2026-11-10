// Retrouver le formulaire et les champs.
const formulaire = document.querySelector("#login-form");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const erreur = document.querySelector("#login-error");
const boutonConnexion = formulaire.querySelector('input[type="submit"]');

// Traiter la connexion à la validation du formulaire.
formulaire.addEventListener("submit", async function (evenement) {
  evenement.preventDefault();
  if (boutonConnexion.disabled) return;
  boutonConnexion.disabled = true;
  erreur.textContent = "";

  try {
    // Envoyer les identifiants au serveur.
    const reponse = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email.value.trim(),
        password: password.value
      })
    });

    // Afficher une erreur si la connexion est refusée.
    if (!reponse.ok) {
      erreur.textContent = [401, 404].includes(reponse.status)
        ? "E-mail ou mot de passe incorrect."
        : "Le serveur ne peut pas traiter la connexion. Réessaie plus tard.";
      return;
    }

    // Lire les données reçues du serveur.
    const donnees = await reponse.json();

    // Vérifier le token reçu.
    if (typeof donnees.token !== "string" || !donnees.token.trim()) {
      erreur.textContent = "La réponse du serveur ne contient pas de token valide.";
      return;
    }

    // Garder le token pour la session de cet onglet.
    sessionStorage.setItem("token", donnees.token);

    // Revenir à la page des projets.
    window.location.href = "index.html";
  } catch (probleme) {
    erreur.textContent = "Impossible de contacter le serveur.";
  } finally {
    boutonConnexion.disabled = false;
  }
});
