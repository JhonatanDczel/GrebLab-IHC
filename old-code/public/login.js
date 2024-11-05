document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (result.success) {
        window.location.href = 'index.html'; // Redirige a la página principal
    } else {
        alert(result.message);
    }
});
