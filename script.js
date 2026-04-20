
let homeLink = document.getElementById('home-link');
let aboutLink = document.getElementById('about-link');
let cartLink = document.getElementById('cart-link');

let currentURL = window.location.href;

// console.log(window.location.pathname);

if (currentURL.endsWith('index.html') || currentURL.endsWith('/')) {
  homeLink.classList.add('active');
} 
else if (currentURL.endsWith('about.html')) {
  aboutLink.classList.add('active');
} 
else if (currentURL.endsWith('cart.html')) {
  cartLink.classList.add('active');
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const output = document.getElementById("output");

let allCourses = [];

function fetchData() {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://raw.githubusercontent.com/hagerr55/courses-data/main/courses.json');

  xhr.onload = function () {
    if (xhr.status == 200) {
      let fetchedData = JSON.parse(xhr.responseText);
      let courses = fetchedData.courses;
      allCourses = courses;

      for (let course of courses) {


        output.innerHTML += `
          <div class="Hmcards"  onclick="toDetails(${course.id})">
            <img src="${course.mainImage}" alt="not found" />

            <div id="titleCard">${course.title}</div>
            <div id="desCard">${course.shortDescription}</div>
             
             <br />
            <hr />
            

            <div id="levelRate">
              <div id="levelCard">${course.level}</div>
              <div class="rating">
                ${'<i>★</i>'.repeat(Math.round(course.rating.rate))}
                ${'<i>☆</i>'.repeat(5 - Math.round(course.rating.rate))}
                <span>(${course.rating.rate})</span>
              </div>
            </div>

            <div class="desCard">
          
              Duration: ${course.duration}
            </div>

          </div>
        `;
      }}

  };

  xhr.send();
}

fetchData();


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function toDetails(id){

  window.location.href = `details.html?id=${id}`;

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



searchInput.addEventListener("input", function () {

    let value = searchInput.value.toLowerCase();

    let filteredCourses = allCourses.filter(function (course) {
        return course.title.toLowerCase().includes(value);
    });

    display(filteredCourses);
});


function display(courses){
  output.innerHTML = "";

  for (let course of courses) {
    output.innerHTML += `
      <div class="Hmcards" onclick="toDetails(${course.id})">
        <img src="${course.mainImage}" />

            <div id="titleCard">${course.title}</div>
            <div id="desCard">${course.shortDescription}</div>
             
             <br />
            <hr />
            

            <div id="levelRate">
              <div id="levelCard">${course.level}</div>
              <div class="rating">
                ${'<i>★</i>'.repeat(Math.round(course.rating.rate))}
                ${'<i>☆</i>'.repeat(5 - Math.round(course.rating.rate))}
                <span>(${course.rating.rate})</span>
              </div>
            </div>

            <div class="desCard">
          
              Duration: ${course.duration}
            </div>


      </div>
    `;
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
