// CONSTANTES ET SÉLECTION DES ÉLÉMENTS HTML
const form = document.querySelector("#login-form");
const errorMessage = document.querySelector("#login-error");
const submitButton = form.querySelector('[type="submit"]');
let isSubmitting = false;

// SOUMISSION DU FORMULAIRE ET AUTHENTIFICATION
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;
    submitButton.disabled = true;
    errorMessage.textContent = "";

    // 1. RÉCUPÉRATION DES IDENTIFIANTS
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    // 2. ENVOI DE LA DEMANDE DE CONNEXION
    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        // 3. GESTION DES ERREURS DU CLIENT ET DU SERVEUR
        if (response.status === 401 || response.status === 404) {
            errorMessage.textContent = "E-mail ou mot de passe incorrect.";
            return;
        }

        if (!response.ok) {
            throw new Error("Erreur du serveur");
        }

        // 4. CONNEXION RÉUSSIE ET REDIRECTION
        const result = await response.json();

        if (typeof result?.token !== "string" || !result.token.trim()) {
            errorMessage.textContent = "Réponse du serveur invalide. Veuillez réessayer.";
            return;
        }

        localStorage.setItem("token", result.token);
        window.location.href = "index.html";

    } catch (error) {
        // 5. GESTION DES ERREURS RÉSEAU OU INATTENDUES
        errorMessage.textContent = "Connexion impossible pour le moment. Veuillez réessayer.";
    } finally {
        isSubmitting = false;
        submitButton.disabled = false;
    }
});