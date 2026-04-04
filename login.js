const email = document.getElementById('email');
const password = document.getElementById('password');
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    await login();
});

async function login() {
    const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
        
        window.location.href = 'DIM.html';
    } else {
        
        alert(data.message || 'Login failed');
    }
}