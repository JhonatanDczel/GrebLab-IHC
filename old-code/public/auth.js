// auth.js
async function checkAuth() {
    const response = await fetch('/check-auth');
    const result = await response.json();
    if (!result.authenticated) {
        window.location.href = 'login.html'; // Redirige a la página de login si no está autenticado
    }
}

checkAuth();
