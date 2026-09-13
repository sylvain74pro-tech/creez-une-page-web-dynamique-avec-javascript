// Sélection du formulaire
const form = document.querySelector("#login-form");

form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Empêche le rechargement

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    // Appel API
    const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (result.token) {
        // Stockage du token
        localStorage.setItem("token", result.token);

        // Redirection vers la page suivante
        window.location.href = "index.html";
    } else {
        alert("Identifiants incorrects");
    }
});
