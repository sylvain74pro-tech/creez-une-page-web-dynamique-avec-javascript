const formulaire = document.querySelector("#login-form");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const erreur = document.querySelector("#login-error");
const boutonConnexion = formulaire.querySelector('input[type="submit"]');

formulaire.addEventListener("submit", async function (evenement) {
  evenement.preventDefault();
  if (boutonConnexion.disabled) return;
  boutonConnexion.disabled = true;
  erreur.textContent = "";

  try {
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

    if (!reponse.ok) {
      erreur.textContent = [401, 404].includes(reponse.status)
        ? "E-mail ou mot de passe incorrect."
        : "Le serveur ne peut pas traiter la connexion. Réessaie plus tard.";
      return;
    }

    // Lire les informations renvoyées par le serveur.
    const donnees = await reponse.json();

    // Vérifier que le serveur a bien fourni une preuve de connexion.
    if (typeof donnees.token !== "string" || !donnees.token.trim()) {
      erreur.textContent = "La réponse du serveur ne contient pas de token valide.";
      return;
    }

    // Conserver le token dans cet onglet pour les autres pages.
    sessionStorage.setItem("token", donnees.token);

    // Revenir à la page des projets après la connexion.
    window.location.href = "index.html";
  } catch (probleme) {
    erreur.textContent = "Impossible de contacter le serveur.";
  } finally {
    boutonConnexion.disabled = false;
  }
});

