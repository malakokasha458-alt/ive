const loginForm =document.querySelector('#login-form');
const emailInput = document.querySelector('#login-email');
const passwordInput = document.querySelector('#login-password');

// localStorage.setItem('isLoggedIn', 'true');



// const userData ={
//   email: 'admin@2025',
//   password: '123456',
//   userName: 'user'
// }

// localStorage.setItem('registeredUser', JSON.stringify(userData))

if (localStorage.getItem('isLoggedIn') === 'true'){
  window.location.href = 'index.html'
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault(); 

  const emailValue = emailInput.value;
  const passwordValue = passwordInput.value;
  
  if (emailValue === '' || passwordValue === '') {
    Swal.fire({
        icon: 'info',
        title: 'Please note',
        text: 'Fields cannot be empty.',
        color: '#1D242B',
        confirmButtonColor: '#0077C0',
        background: '#FAFAFA'
    });
    return;
}

  const user = JSON.parse(localStorage.getItem('registeredUser'));

  if (user && emailValue === user.email && passwordValue === user.password) {
      
      localStorage.setItem('isLoggedIn', 'true');
      
      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: 'Redirecting to home...',
        background: '#FAFAFA',
        color: '#1D242B',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
    }).then(() => {
        window.location.href = 'index.html'; 
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Authentication Failed',
      text: 'Invalid email or password. Please try again.',
      confirmButtonText: 'Try Again',
      confirmButtonColor: '#d33',
      background: '#FAFAFA'
  });  }
});
