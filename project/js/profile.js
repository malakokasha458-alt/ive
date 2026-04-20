// ============================================
// PROFILE.JS - User Profile Page Logic
// ============================================

// Display user activities
const Profile = {
    init: () => {
        Profile.displayUserInfo();
        Profile.displayActivities();
        Profile.setupEventListeners();
    },
    
    displayUserInfo: () => {
        const user = Auth.getCurrentUser();
        
        if (user) {
            const userNameEl = document.querySelector('#profile-user-name');
            const userEmailEl = document.querySelector('#profile-user-email');
            
            if (userNameEl) userNameEl.textContent = user.userName;
            if (userEmailEl) userEmailEl.textContent = user.email;
        }
    },
    
    displayActivities: () => {
        const activities = JSON.parse(localStorage.getItem('activities')) || [];
        const container = document.querySelector('#activities-container');
        
        if (!container) return;
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="text-center p-5">
                    <i class="fas fa-history" style="font-size: 48px; color: var(--text-light); margin-bottom: 20px;"></i>
                    <h3>No Activities Yet</h3>
                    <p>Start learning to see your activity here!</p>
                    <a href="index.html" class="btn btn-primary mt-3">Browse Courses</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-info">
                    <img src="${activity.mainImage || './imges/img2.jpg'}" alt="${activity.title}" class="activity-icon" onerror="this.src='./imges/img2.jpg'">
                    <div class="activity-details">
                        <h4>${activity.title}</h4>
                        <div class="activity-meta">
                            <span class="activity-date">
                                <i class="far fa-calendar-alt"></i> ${activity.date}
                            </span>
                            <span class="activity-price">${Utils.formatPrice(activity.price)}</span>
                        </div>
                    </div>
                </div>
                <div class="activity-status ${activity.status === 'Completed' ? 'status-completed' : 'status-pending'}">
                    ${activity.status === 'Completed' ? '✓ Completed' : '⏳ In Progress'}
                </div>
            </div>
        `).join('');
    },
    
    setupEventListeners: () => {
        // Edit profile button
        const editBtn = document.querySelector('#edit-profile');
        if (editBtn) {
            editBtn.addEventListener('click', Profile.editProfile);
        }
        
        // Settings button
        const settingsBtn = document.querySelector('#settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                Utils.showNotification('Settings feature coming soon!', 'info');
            });
        }
    },
    
    editProfile: () => {
        Swal.fire({
            title: 'Edit Profile',
            html: `
                <input id="swal-name" class="swal2-input" placeholder="Full Name" value="${Auth.getCurrentUser()?.userName || ''}">
                <input id="swal-email" class="swal2-input" placeholder="Email" value="${Auth.getCurrentUser()?.email || ''}">
            `,
            focusConfirm: false,
            preConfirm: () => {
                const name = document.querySelector('#swal-name').value;
                const email = document.querySelector('#swal-email').value;
                
                if (!name || !email) {
                    Swal.showValidationMessage('Please fill all fields');
                    return false;
                }
                
                if (!Validators.isEmail(email)) {
                    Swal.showValidationMessage('Please enter a valid email');
                    return false;
                }
                
                return { name, email };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const user = Auth.getCurrentUser();
                user.userName = result.value.name;
                user.email = result.value.email;
                localStorage.setItem('registeredUser', JSON.stringify(user));
                
                Profile.displayUserInfo();
                Auth.updateNavbar();
                
                Utils.showNotification('Profile updated successfully!');
            }
        });
    }
};

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
    Profile.init();
});