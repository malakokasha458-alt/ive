const registerForm =document.querySelector('#register-form');
const emailInput = document.querySelector('#register-email');
const passwordInput = document.querySelector('#register-password');
const confPass = document.querySelector('#confirm-pass');
const nameInput = document.querySelector('#register-name');



if (localStorage.getItem('isLoggedIn') === 'true'){
  window.location.href = 'index.html'
}

registerForm.addEventListener('submit',(e)=>{
  e.preventDefault();

  const emailValue = emailInput.value;
  const passwordValue =passwordInput.value;
  const confirmPass = confPass.value;
  const nameValue = nameInput.value;

  if(!emailInput.checkValidity()){
    alert("Please enter a valid email format.");
    return
  }
  if (passwordValue.length < 6) { 
    alert("Password must be at least 6 characters.");
    return;
  }
  if(passwordValue !== confirmPass){
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Passwords do not match!',
      confirmButtonColor: '#0077C0'
  });
  return;
  }

  const userData ={
    email: emailValue,
    password: passwordValue,
    userName: nameValue

  }

  localStorage.setItem('registeredUser', JSON.stringify(userData))
  localStorage.setItem('isLoggedIn','true')
  Swal.fire({
    icon: 'success',
    title: 'Account Created!',
    text: 'Your account has been registered successfully. Redirecting...',
    background: '#FAFAFA',
    color: '#1D242B',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true
  }).then(() => {
    window.location.href = 'index.html'; 
  });
});