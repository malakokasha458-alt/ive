
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function displayCart() {
  let output = document.querySelector(".cart-Container");

  if (!output) {
    console.log("container not found");
    return;
  }

  output.innerHTML = "";

 for (let i = 0; i < cart.length; i++) {
  let course = cart[i];
    output.innerHTML += `
      <div class="card-img">
        
        <div class="img-card">
          <img src="${course.mainImage || './img2.jpg'}" alt="course">
        </div>

        <div class="info">
          <h6>${course.level || "Beginner"}</h6>
          <h5>${course.title || "No Title"}</h5>
          <p>${course.instructor.name || "Unknown"} • ${course.duration || ""}</p>
        </div>

        <div class="price">

         
          <p  onclick="deleteCourse(this, ${i})" ><i class="fa-solid fa-trash-can"></i></p>
          <span>$${course.price || "0.00"}</span>
        </div>

      </div>
    `;
  }
}

displayCart();
updateSummary();


//////////////////////////////////////////////////////////////////////////////////////////////

function deleteCourse(btn, index){

    
    cart.splice(index, 1);

   
    localStorage.setItem("cart", JSON.stringify(cart));

   
    displayCart();

    
    updateSummary();

    updateCartCounter();


}

function updateSummary(){

    const priceElements = document.querySelectorAll('.price span');
    let newSubtotal = 0;

    priceElements.forEach(priceEl => {
        let price = parseFloat(priceEl.innerText.replace('$',''));
        newSubtotal += price;
    });

    let fee = 12.00;
    let discount = 25.00;

    if(newSubtotal === 0){
        fee = 0;
        discount = 0;
    }

    let finalTotal = newSubtotal + fee - discount;

    document.getElementById('subtotal-val').innerText = `$${newSubtotal.toFixed(2)}`;
    document.getElementById('fee-val').innerText = `$${fee.toFixed(2)}`;
    document.getElementById('discount-val').innerText = `-$${discount.toFixed(2)}`;
    document.getElementById('total-val').innerText = `$${finalTotal.toFixed(2)}`;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const payForm = document.querySelector('#payment-form');
const checkoutBtn = document.querySelector('#checkout-btn');

const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

checkoutBtn.addEventListener("click", function (e) {
  e.preventDefault();

  let cart = JSON.parse(localStorage.getItem("cart")) || [];


  if (cart.length === 0) {
    Swal.fire({
      title: 'Your cart is empty',
      text: "Add some courses before proceeding to payment.",
      icon: 'warning',
      confirmButtonColor: '#0077C0',
      background: '#FAFAFA',
      color: '#1D242B'
    });
    return;
  }

  if (isLoggedIn) {
    window.location.href = 'payment.html';
  } else {
    Swal.fire({
      title: 'Sign-in Required',
      text: "You need to log in to your account to complete the purchase.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#0077C0',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Login Now',
      cancelButtonText: 'Maybe Later',
      background: '#FAFAFA',
      color: '#1D242B'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = 'login.html';
      }
    });
  }
});
