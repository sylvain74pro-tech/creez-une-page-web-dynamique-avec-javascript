/* =================================================================
 * CONSTANTS & DOM ELEMENTS SELECTION
 * ================================================================= */
const form = document.querySelector("#login-form");
const errorMessage = document.querySelector("#login-error");
const submitButton = form.querySelector('button[type="submit"]');
let isSubmitting = false;

/* =================================================================
 * EVENT LISTENER: FORM SUBMISSION & AUTHENTICATION
 * ================================================================= */
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;
    submitButton.disabled = true;
    errorMessage.textContent = "";

    /* -------------------------------------------------------------
     * 1. RETRIEVE INPUT VALUES
     * ------------------------------------------------------------- */
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });



        /* -------------------------------------------------------------
         * 3. HANDLE CLIENT / SERVER ERRORS
         * ------------------------------------------------------------- */
        if (response.status === 401 || response.status === 404) {
            errorMessage.textContent = "E-mail ou mot de passe incorrect.";
            return;
        }

        if (!response.ok) {
            throw new Error("Erreur du serveur");
        }

        /* -------------------------------------------------------------
         * 4. HANDLE SUCCESSFUL AUTHENTICATION & REDIRECTION
         * ------------------------------------------------------------- */
        const result = await response.json();
        
        if (typeof result?.token !== "string" || !result.token.trim()) {
            errorMessage.textContent = "Réponse du serveur invalide. Veuillez réessayer.";
            return;
        }

        localStorage.setItem("token", result.token);
        window.location.href = "index.html";

    } catch (error) {
        /* -------------------------------------------------------------
         * 5. CATCH NETWORK / UNEXPECTED ERRORS
         * ------------------------------------------------------------- */
        errorMessage.textContent = "Connexion impossible pour le moment. Veuillez réessayer.";
    } finally {
        isSubmitting = false;
        submitButton.disabled = false;
    }
});