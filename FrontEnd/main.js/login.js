// Sélection du formulaire et du message d'erreur
const form = document.querySelector("#login-form");
const errorMessage = document.querySelector("#login-error");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = "";

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (response.status === 401 || response.status === 404) {
            errorMessage.textContent = "E-mail ou mot de passe incorrect.";
            return;
        }

        if (!response.ok) {
            throw new Error("Erreur du serveur");
        }

        const result = await response.json();
        if (!result.token) {
            errorMessage.textContent = "E-mail ou mot de passe incorrect.";
            return;
        }

        localStorage.setItem("token", result.token);
        window.location.href = "index.html";
    } catch (error) {
        errorMessage.textContent = "Connexion impossible pour le moment. Veuillez réessayer.";
    }
});
