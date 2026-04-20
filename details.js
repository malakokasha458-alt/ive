var valueid = new URLSearchParams(window.location.search);
var id = valueid.get("id");

let Courses = [];

function mainCourseDetails(courseId) {
  let output = document.getElementById("outDT-MainContent");
  let Doutput = document.getElementById("duration");
  let Poutput = document.getElementById("Price");
  let Moutput = document.getElementById("mentor");
  let MMoutput = document.getElementById("mentorCard");

  output.innerHTML = "";

  let selectedCourse = null;

  for (let course of Courses) {
    if (course.id == courseId) {
      selectedCourse = course;
      break;
    }
  }

  if (!selectedCourse) {
    output.innerHTML = "<p>Course not found.</p>";
    return;
  }

  output.innerHTML = `
    <div class="course-card">

     <img src="${selectedCourse.mainImage}" alt="course image" class="course-img" />
      <div class="course-rating">
        ⭐ ${selectedCourse.rating.rate} / 5.0 Rating
      </div>


      <div class="course-header">
      
      <div class="course-text">
      <h2 class="course-title">${selectedCourse.title}</h2>
      <p class="course-desc">${selectedCourse.detailedDescription}</p>
      </div>

      <div class="course-actions">
      <button class="btn enroll" onclick="addToCart(${selectedCourse.id})"> Enroll Now </button>
      </div>

      </div>
      
    </div>
   
  `;

  Doutput.innerHTML = `
    <div class="info-card">
    <img src="./imges/hourglass.png"  width="80">
      <h4>Duration</h4>
      <p class="course-desc">${selectedCourse.duration}</p>
    </div>
  `;

  Poutput.innerHTML = `
    <div class="info-card">
    <img src="./imges/coins.png"  width="80">
      <h4>Price</h4>
      <p class="course-desc">${selectedCourse.price}$</p>
    </div>
  `;

  Moutput.innerHTML = `
    <div class="info-card">
    <img src="./imges/mentoring.png"  width="80">
      <h4>Mentor</h4>
      <p class="course-desc"> ${selectedCourse.instructor.name}</p>
    </div>
  `;

  MMoutput.innerHTML = `
    <div class="mentorCard">
        <div class="mentor-image" >
          <img src="${selectedCourse.instructor.image}"  width="80"> 
        </div>
        <div class="mentor-info">
          <h2>${selectedCourse.instructor.name}</h2>
          <h3>${selectedCourse.instructor.bio}</h3>

          <br/>

          <div class="mentor-actions">
              <button class="btn portfolio">View Portfolio</button>
              <button class="btn contact">Contact Mentor</button>
           </div>
        </div>

        
      </div>
    </div>
  `;
}



function fetchDetails(courseId) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://raw.githubusercontent.com/hagerr55/courses-data/main/courses.json');

  xhr.onload = function () {
    if (xhr.status === 200) {
      let fetchedData = JSON.parse(xhr.responseText);
      Courses = fetchedData.courses; 
      mainCourseDetails(courseId);
    }
  };

  xhr.send();
}

fetchDetails(Number(id));

//----------------- enrol button ------------


function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // نجيب الكورس من الداتا
  let course = allCourses.find(c => c.id == id);


  let exists = cart.find(item => item.id == id);

  if (exists) {
    Swal.fire({
      icon: 'info',
      title: 'Already Enrolled',
      text: 'You are already enrolled in this course.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      background: '#FAFAFA',
      color: '#333'
    });
    return;
  }


  cart.push(course);

 
  localStorage.setItem("cart", JSON.stringify(cart));


  window.location.href = "cart.html";
}