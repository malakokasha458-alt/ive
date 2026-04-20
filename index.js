function navbar(){
  const isLoggedIn = localStorage.getItem('isLoggedIn') ==='true';
  const users = document.querySelectorAll('.user');
  const guests = document.querySelectorAll('.guest');

  const user = JSON.parse(localStorage.getItem('registeredUser'));
  const userName = document.querySelector('#user-name')

  if(isLoggedIn){
    userName.textContent = user.userName

    for(const user of users){
      user.style.display = 'flex';
    }
    for(const guest of guests){
      guest.style.display = 'none';
    }
  }
  else{
    for(const user of users){
      user.style.display = 'none';
    }
    for(const guest of guests){
      guest.style.display = 'flex';
    }
  }

}
navbar()

const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {

        localStorage.setItem('isLoggedIn', 'false');

        window.location.href = 'index.html';
    });
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////


const counter = document.querySelector(".counter");

function updateCartCounter() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  counter.innerText = cart.length;
}

updateCartCounter();