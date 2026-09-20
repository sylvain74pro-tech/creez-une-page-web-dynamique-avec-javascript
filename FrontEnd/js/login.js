// URL de l’API
const API_URL = "http://localhost:5678/api";

// Sélection du formulaire (protégé pour Jest)
const loginForm = typeof document !== "undefined"
    ? document.getElementById("login-form")
    : null;

// Gestion de la soumission du formulaire
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const errorDiv = document.getElementById("login-error");

        if (!emailInput || !passwordInput) return;

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) throw new Error("Identifiants incorrects");

            const data = await response.json();
            localStorage.setItem("token", data.token);

            if (typeof window !== "undefined") {
                window.location.href = "index.html";
            }
        } catch (error) {
            if (errorDiv) {
                errorDiv.textContent = "Erreur dans l'identifiant ou le mot de passe.";
            }
        }
    });
}
