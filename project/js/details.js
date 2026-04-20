// ============================================
// DETAILS.JS - Course Details Page Logic
// ============================================

// Get course ID from URL
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id');

// State
let currentCourse = null;

// DOM Elements
const courseMainContainer = document.querySelector('#course-main');
const courseInfoContainer = document.querySelector('#course-info');
const whatLearnContainer = document.querySelector('#what-learn');
const curriculumContainer = document.querySelector('#curriculum');
const mentorContainer = document.querySelector('#mentor');

// ============================================
// Render Course Details
// ============================================

const DetailsUI = {
    // Render main course info
    renderMainContent: (course) => {
        if (!courseMainContainer) return;
        
        courseMainContainer.innerHTML = `
            <div class="course-details-card">
                <img src="${course.mainImage}" alt="${course.title}" class="course-details-image">
                <div class="course-details-content">
                    <div class="rating mb-2">
                        ${Utils.renderStars(course.rating.rate)}
                        <span>(${course.rating.rate} / 5.0 Rating)</span>
                        <span>(${course.rating.count} reviews)</span>
                    </div>
                    <div class="course-details-header">
                        <div>
                            <h1 class="course-title">${course.title}</h1>
                            <p class="course-description">${course.detailedDescription || course.shortDescription}</p>
                        </div>
                        <button class="btn btn-primary" onclick="DetailsActions.addToCart(${course.id})">
                            <i class="fas fa-shopping-cart"></i> Enroll Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Render info cards (duration, price, mentor)
    renderInfoCards: (course) => {
        if (!courseInfoContainer) return;
        
        courseInfoContainer.innerHTML = `
            <div class="info-card">
                <img src="./imges/hourglass.png" alt="Duration">
                <h4>Duration</h4>
                <p>${course.duration}</p>
            </div>
            <div class="info-card">
                <img src="./imges/coins.png" alt="Price">
                <h4>Price</h4>
                <p>${Utils.formatPrice(course.price)}</p>
            </div>
            <div class="info-card">
                <img src="./imges/mentoring.png" alt="Mentor">
                <h4>Mentor</h4>
                <p>${course.instructor?.name || 'Expert Instructor'}</p>
            </div>
        `;
    },
    
    // Render what you'll learn section
    renderWhatLearn: (course) => {
        if (!whatLearnContainer) return;
        
        const defaultTopics = [
            'Master core concepts and fundamentals',
            'Build real-world projects from scratch',
            'Learn industry best practices',
            'Get hands-on experience with modern tools',
            'Develop problem-solving skills'
        ];
        
        const topics = course.whatYouWillLearn || defaultTopics;
        
        whatLearnContainer.innerHTML = `
            <h3><i class="fas fa-graduation-cap"></i> What You'll Learn</h3>
            <ul class="learn-list">
                ${topics.map(topic => `<li><i class="fas fa-check-circle"></i> ${topic}</li>`).join('')}
            </ul>
        `;
    },
    
    // Render curriculum section
    renderCurriculum: (course) => {
        if (!curriculumContainer) return;
        
        const modules = course.curriculum || [
            { title: 'Introduction to the Course', duration: '2 hours', lessons: 4 },
            { title: 'Core Concepts', duration: '4 hours', lessons: 8 },
            { title: 'Advanced Topics', duration: '3 hours', lessons: 6 },
            { title: 'Final Project', duration: '2 hours', lessons: 3 }
        ];
        
        curriculumContainer.innerHTML = `
            <h3><i class="fas fa-book-open"></i> Curriculum</h3>
            <div class="curriculum-list">
                ${modules.map((module, index) => `
                    <div class="curriculum-item">
                        <div class="curriculum-header">
                            <span class="module-number">Module ${index + 1}</span>
                            <h4>${module.title}</h4>
                            <span class="module-duration">⏱ ${module.duration}</span>
                        </div>
                        <p>${module.lessons} lessons</p>
                    </div>
                `).join('')}
            </div>
            <a href="#" class="view-full-curriculum">View Full Curriculum →</a>
        `;
    },
    
    // Render mentor section
    renderMentor: (course) => {
        if (!mentorContainer) return;
        
        const instructor = course.instructor || {
            name: 'Expert Instructor',
            bio: 'Industry expert with years of experience in the field',
            image: './imges/img_avatar.png'
        };
        
        mentorContainer.innerHTML = `
            <div class="mentor-image">
                <img src="${instructor.image}" alt="${instructor.name}">
            </div>
            <div class="mentor-info">
                <h3>Your Instructor</h3>
                <h2>${instructor.name}</h2>
                <p>${instructor.bio}</p>
                <div class="mentor-actions">
                    <button class="btn btn-outline" onclick="DetailsActions.viewPortfolio()">
                        <i class="fas fa-briefcase"></i> View Portfolio
                    </button>
                    <button class="btn btn-outline" onclick="DetailsActions.contactMentor()">
                        <i class="fas fa-envelope"></i> Contact Mentor
                    </button>
                </div>
            </div>
        `;
    },
    
    // Render error message
    renderError: (message) => {
        const containers = [courseMainContainer, courseInfoContainer, whatLearnContainer, curriculumContainer, mentorContainer];
        containers.forEach(container => {
            if (container) {
                container.innerHTML = `
                    <div class="text-center p-5">
                        <p>${message}</p>
                        <a href="index.html" class="btn btn-primary mt-3">Back to Home</a>
                    </div>
                `;
            }
        });
    }
};

// ============================================
// Actions
// ============================================

const DetailsActions = {
    // Add course to cart
    addToCart: (id) => {
        if (!currentCourse) return;
        
        const added = Cart.add(currentCourse);
        if (added) {
            // Optional: redirect to cart or stay on page
            setTimeout(() => {
                Swal.fire({
                    title: 'Added to Cart!',
                    text: 'Would you like to go to checkout?',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonColor: '#0077C0',
                    confirmButtonText: 'Go to Cart',
                    cancelButtonText: 'Continue Shopping'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'cart.html';
                    }
                });
            }, 500);
        }
    },
    
    // View portfolio (placeholder)
    viewPortfolio: () => {
        Utils.showNotification('Portfolio feature coming soon!', 'info');
    },
    
    // Contact mentor (placeholder)
    contactMentor: () => {
        Utils.showNotification('Contact feature coming soon!', 'info');
    }
};

// ============================================
// Load Course Data
// ============================================

const loadCourseDetails = async () => {
    if (!courseId) {
        DetailsUI.renderError('No course selected. Please go back and choose a course.');
        return;
    }
    
    // Fetch courses if not already loaded
    if (allCourses.length === 0) {
        await CourseAPI.fetchAll();
    }
    
    currentCourse = CourseAPI.getById(courseId);
    
    if (!currentCourse) {
        DetailsUI.renderError('Course not found. Please try again.');
        return;
    }
    
    // Render all sections
    DetailsUI.renderMainContent(currentCourse);
    DetailsUI.renderInfoCards(currentCourse);
    DetailsUI.renderWhatLearn(currentCourse);
    DetailsUI.renderCurriculum(currentCourse);
    DetailsUI.renderMentor(currentCourse);
    
    // Update page title
    document.title = `${currentCourse.title} | Ivecom Academy`;
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', loadCourseDetails);