window.onload = function () {
  let user = JSON.parse(localStorage.getItem("registeredUser"));

  if (!user) {
    console.log("No user found in localStorage");
    return;
  }

  document.getElementById("userName").innerText = user.userName;
  document.getElementById("userEmail").innerText = user.email;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function displayActivities() {
  let activities = JSON.parse(localStorage.getItem("activities")) || [];

  let container = document.querySelector(".info2");

  container.innerHTML = "";

  activities.forEach((act) => {
    container.innerHTML += `
      <div class="item">
        <div class="Editoria">
          <div class="spark-img">
          <img src="${act.mainImage || "./img2.jpg"}" alt="course">
          </div>

          <div class="text">
            <p>${act.title}</p>
            <p>${act.date}</p>
          </div>
        </div>
      </div>

      <div class="item">
        <div class="new">
          <div class="pri"><p>$${act.price}</p></div>
          <div class="back"><p>${act.status}</p></div>
        </div>
      </div>
    `;
  });
}

displayActivities();

// localStorage.removeItem("activities")
