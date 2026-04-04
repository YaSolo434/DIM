const first_name = document.getElementById('firstName');
const last_name = document.getElementById('lastName');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirm_password = document.getElementById('confirmPassword');
const registerForm = document.getElementById('registerForm');
const registerButton = document.getElementById('registerBtn');

registerForm.addEventListener('input', () => {
    
    const passwordsMatch = password.value === confirm_password.value;

    
    const allFieldsFilled = first_name.value.trim() !== "" &&
        last_name.value.trim() !== "" &&
        email.value.trim() !== "" &&
        password.value.trim() !== "" &&
        confirm_password.value.trim() !== "";

    
    const isFormValid = registerForm.checkValidity();

    
    registerButton.disabled = !passwordsMatch || !allFieldsFilled || !isFormValid;
});



async function register() {
    const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            first_name: first_name.value,
            last_name: last_name.value,
            email: email.value,
            password: password.value
        })
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
        
        alert('Registration successful! Please log in.');
        window.location.href = 'login.html';
    } else {
        
        alert(data.message || 'Registration failed');
    }
}

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    await register();
});

console.log(registerForm);