const loginApiUrl = 'http://localhost:5678/api/users/login';
const loginForm = document.querySelector('#login-form');
const loginError = document.querySelector('#login-error');

function showLoginError(message) {
  loginError.textContent = message;
  loginError.hidden = false;
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.hidden = true;

  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  try {
    const response = await fetch(loginApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('E-mail ou mot de passe incorrect.');
    }

    const { token } = await response.json();
    localStorage.setItem('token', token);
    window.location.assign('./index.html');
  } catch (error) {
    showLoginError(error.message);
  }
});
