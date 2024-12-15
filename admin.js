function getCurrentAdminRole() {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
        const auth = JSON.parse(adminAuth);
        return auth.role;
    }
    return null;
}

function isSuperAdmin() {
    return getCurrentAdminRole() === 'superadmin';
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof DB !== 'undefined') {
        DB.initialize();
        showPage('dashboard');
        updateDashboardStats();
        
        if (!isSuperAdmin()) {
            const adminNavItem = document.querySelector('.nav-item[onclick="showPage(\'administrators\')"]');
            if (adminNavItem) {
                adminNavItem.style.display = 'none';
            }
        }
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('onclick').match(/'(.*?)'/)[1];
            showPage(pageId);
        });
    });
});

function showPage(pageId) {
    if (pageId === 'administrators' && !isSuperAdmin()) {
        showNotification('Access denied. Super Admin privileges required.', 'error');
        return;
    }

    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }

    const selectedNavItem = document.querySelector(`.nav-item[onclick="showPage('${pageId}')"]`);
    if (selectedNavItem) {
        selectedNavItem.classList.add('active');
    }

    switch(pageId) {
        case 'dashboard':
            updateDashboardStats();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'gems':
            loadGems();
            break;
        case 'administrators':
            loadAdministrators();
            break;
    }
}

function updateDashboardStats() {
    const stats = DB.getStats();
    document.getElementById('total-gems').textContent = stats.totalGems;
    document.getElementById('total-categories').textContent = stats.totalCategories;
    
    const currentDate = new Date().toLocaleDateString();
    document.getElementById('current-date').textContent = currentDate;
    
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
        const auth = JSON.parse(adminAuth);
        const username = auth.username;
        const role = auth.role;
        document.getElementById('current-user').textContent = `${username} (${role})`;
    }
    
    updateActivityLog();
}

function updateActivityLog() {
    const activityLog = document.getElementById('activity-log');
    if (!activityLog) return;

    const db = JSON.parse(localStorage.getItem('gemDB'));
    const activities = [];

    if (db.gems) {
        db.gems.forEach(gem => {
            if (gem.createdAt) {
                activities.push({
                    type: 'gem',
                    action: 'added',
                    name: gem.name,
                    timestamp: new Date(gem.createdAt),
                    icon: 'gem'
                });
            }
            if (gem.updatedAt) {
                activities.push({
                    type: 'gem',
                    action: 'updated',
                    name: gem.name,
                    timestamp: new Date(gem.updatedAt),
                    icon: 'edit'
                });
            }
        });
    }

    if (db.categories) {
        db.categories.forEach(category => {
            if (category.createdAt) {
                activities.push({
                    type: 'category',
                    action: 'added',
                    name: category.name,
                    timestamp: new Date(category.createdAt),
                    icon: 'tags'
                });
            }
            if (category.updatedAt) {
                activities.push({
                    type: 'category',
                    action: 'updated',
                    name: category.name,
                    timestamp: new Date(category.updatedAt),
                    icon: 'edit'
                });
            }
        });
    }

    activities.sort((a, b) => b.timestamp - a.timestamp);

    const recentActivities = activities.slice(0, 10);

    activityLog.innerHTML = recentActivities.length ? recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-${activity.icon}"></i>
            </div>
            <div class="activity-details">
                <span class="activity-text">
                    ${activity.type === 'gem' ? '💎' : '🏷️'} 
                    ${activity.action === 'added' ? 'Added new' : 'Updated'} 
                    ${activity.type}: <strong>${activity.name}</strong>
                </span>
                <span class="activity-time">${formatTimestamp(activity.timestamp)}</span>
            </div>
        </div>
    `).join('') : '<p class="no-activity">No recent activity</p>';
}

function formatTimestamp(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    
    if (diff < 60000) {
        return 'Just now';
    }
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    return timestamp.toLocaleDateString();
}

function loadCategories() {
    const categories = DB.getCategories();
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) return;

    categoriesList.innerHTML = categories.map(category => `
        <div class="category-card">
            <h3>${category.name}</h3>
            <p>${category.description}</p>
            <div class="category-stats">
                <span>${DB.getGemsByCategory(category.name).length} gems</span>
            </div>
            <div class="card-actions">
                <button onclick="editCategory('${category.id}')" class="edit-btn">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteCategory('${category.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function loadGems() {
    const gems = DB.getGems();
    const gemsList = document.getElementById('gems-list');
    if (!gemsList) return;

    const gemsHTML = gems.map(gem => `
        <tr>
            <td>
                <img src="${gem.image}" alt="${gem.name}" 
                     onerror="this.src='images/default-gem.jpg'">
            </td>
            <td>${gem.name}</td>
            <td>${gem.category}</td>
            <td>${gem.hardness}</td>
            <td>
                <button onclick="editGem('${gem.id}')" class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteGem('${gem.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    gemsList.innerHTML = gemsHTML;
}

function openCategoryModal(categoryId = null) {
    const modal = document.getElementById('category-modal');
    const form = document.getElementById('category-form');
    form.reset();

    if (categoryId) {
        const category = DB.getCategoryById(categoryId);
        if (category) {
            document.getElementById('category-id').value = category.id;
            document.getElementById('category-name').value = category.name;
            document.getElementById('category-description').value = category.description;
            document.querySelector('#category-modal h2').textContent = 'Edit Category';
        }
    } else {
        document.getElementById('category-id').value = '';
        document.querySelector('#category-modal h2').textContent = 'Add New Category';
    }

    modal.style.display = 'block';
}

function openGemModal(gemId = null) {
    const modal = document.getElementById('gem-modal');
    const form = document.getElementById('gem-form');
    const preview = document.getElementById('image-preview');
    const placeholder = document.querySelector('.upload-placeholder');
    
    form.reset();
    updateCategorySelect();
    
    preview.src = '#';
    preview.style.display = 'none';
    if (placeholder) {
        placeholder.style.display = 'flex';
    }

    if (gemId) {
        const gem = DB.getGemById(gemId);
        if (gem) {
            document.getElementById('gem-id').value = gem.id;
            document.getElementById('gem-name').value = gem.name;
            document.getElementById('gem-category').value = gem.category;
            document.getElementById('gem-hardness').value = gem.hardness;
            document.getElementById('gem-crystal').value = gem.crystalSystem;
            document.getElementById('gem-description').value = gem.description;
            
            preview.src = gem.image;
            preview.style.display = 'block';
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            
            document.querySelector('#gem-modal h2').textContent = 'Edit Gem';
        }
    } else {
        document.getElementById('gem-id').value = '';
        document.querySelector('#gem-modal h2').textContent = 'Add New Gem';
    }

    modal.style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

document.getElementById('category-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('category-name').value,
        description: document.getElementById('category-description').value
    };
    const categoryId = document.getElementById('category-id').value;

    try {
        if (categoryId) {
            DB.updateCategory(categoryId, formData);
            showNotification('Category updated successfully');
        } else {
            DB.addCategory(formData);
            showNotification('Category added successfully');
        }
        closeModal('category-modal');
        loadCategories();
        updateDashboardStats();
        notifyMainPage();
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

document.getElementById('gem-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const imagePreview = document.getElementById('image-preview');
    
    try {
        const formData = {
            name: document.getElementById('gem-name').value,
            category: document.getElementById('gem-category').value,
            hardness: document.getElementById('gem-hardness').value,
            crystalSystem: document.getElementById('gem-crystal').value,
            description: document.getElementById('gem-description').value,
            image: imagePreview.src || 'images/default-gem.jpg'
        };

        const gemId = document.getElementById('gem-id').value;

        if (gemId) {
            DB.updateGem(gemId, formData);
            showNotification('Gem updated successfully');
        } else {
            DB.addGem(formData);
            showNotification('Gem added successfully');
        }
        
        closeModal('gem-modal');
        loadGems();
        updateDashboardStats();
        notifyMainPage();
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

function updateCategorySelect() {
    const select = document.getElementById('gem-category');
    if (!select) return;

    const categories = DB.getCategories();
    select.innerHTML = categories.map(category => 
        `<option value="${category.name}">${category.name}</option>`
    ).join('');
}

function updateCategoryFilter() {
    const select = document.getElementById('category-filter');
    if (!select) return;

    const categories = DB.getCategories();
    select.innerHTML = `
        <option value="">All Categories</option>
        ${categories.map(category => 
            `<option value="${category.name}">${category.name}</option>`
        ).join('')}
    `;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}-notification`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
        <span>${message}</span>
    `;
    document.getElementById('notification-container').appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function notifyMainPage() {
    window.dispatchEvent(new CustomEvent('adminDataUpdated', {
        detail: {
            gems: DB.getGems(),
            categories: DB.getCategories()
        }
    }));
}

window.showPage = showPage;
window.openCategoryModal = openCategoryModal;
window.openGemModal = openGemModal;
window.closeModal = closeModal;
window.editCategory = openCategoryModal;
window.editGem = openGemModal;
window.deleteCategory = function(id) {
    if (confirm('Are you sure you want to delete this category?')) {
        try {
            DB.deleteCategory(id);
            showNotification('Category deleted successfully');
            loadCategories();
            updateDashboardStats();
            notifyMainPage();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
};
window.deleteGem = function(id) {
    if (confirm('Are you sure you want to delete this gem?')) {
        try {
            DB.deleteGem(id);
            showNotification('Gem deleted successfully');
            loadGems();
            updateDashboardStats();
            notifyMainPage();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
};

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let width = img.width;
                let height = img.height;
                const maxSize = 800;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);
                const compressedImage = canvas.toDataURL('image/jpeg', 0.7);

                const preview = document.getElementById('image-preview');
                const placeholder = document.querySelector('.upload-placeholder');
                
                preview.src = compressedImage;
                preview.style.display = 'block';
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
            };
        };
        reader.readAsDataURL(file);
    }
}

document.getElementById('gem-image').addEventListener('change', handleImageUpload);

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminAuth');
        
        showNotification('Logged out successfully');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

window.handleLogout = handleLogout;

function loadAdministrators() {
    if (!isSuperAdmin()) {
        return;
    }

    const administrators = DB.getAdministrators();
    const adminsList = document.getElementById('administrators-list');
    if (!adminsList) return;

    if (administrators.length === 0) {
        adminsList.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">
                    No administrators found. Add your first administrator!
                </td>
            </tr>
        `;
        return;
    }

    adminsList.innerHTML = administrators.map(admin => `
        <tr>
            <td>${admin.username}</td>
            <td>
                <span class="role-badge role-${admin.role.toLowerCase()}">
                    ${admin.role}
                </span>
            </td>
            <td>${admin.email}</td>
            <td>
                <span class="status-badge status-${admin.status.toLowerCase()}">
                    ${admin.status}
                </span>
            </td>
            <td>${formatDate(admin.lastLogin)}</td>
            <td>
                ${isSuperAdmin() ? `
                    <button onclick="editAdministrator('${admin.id}')" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteAdministrator('${admin.id}')" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function openAdminModal(adminId = null) {
    if (!isSuperAdmin()) {
        showNotification('Access denied. Super Admin privileges required.', 'error');
        return;
    }

    const modal = document.getElementById('admin-modal');
    const form = document.getElementById('admin-form');
    form.reset();

    if (adminId) {
        const admin = DB.getAdministratorById(adminId);
        if (admin) {
            document.getElementById('admin-id').value = admin.id;
            document.getElementById('admin-username').value = admin.username;
            document.getElementById('admin-email').value = admin.email;
            document.getElementById('admin-role').value = admin.role;
            document.getElementById('admin-password').required = false;
            document.getElementById('admin-confirm-password').required = false;
            document.querySelector('#admin-modal h2').textContent = 'Edit Administrator';
        }
    } else {
        document.getElementById('admin-id').value = '';
        document.getElementById('admin-password').required = true;
        document.getElementById('admin-confirm-password').required = true;
        document.querySelector('#admin-modal h2').textContent = 'Add New Administrator';
    }

    modal.style.display = 'block';
}

function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (password.length < minLength) return 'weak';
    if (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar) return 'strong';
    return 'medium';
}

document.getElementById('admin-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!isSuperAdmin()) {
        showNotification('Access denied. Super Admin privileges required.', 'error');
        return;
    }

    const adminId = document.getElementById('admin-id').value;
    const password = document.getElementById('admin-password').value;
    const confirmPassword = document.getElementById('admin-confirm-password').value;

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    const formData = {
        username: document.getElementById('admin-username').value,
        email: document.getElementById('admin-email').value,
        role: document.getElementById('admin-role').value,
        status: 'Active',
        lastLogin: new Date().toISOString()
    };

    if (password) {
        formData.password = password;
    }

    try {
        if (adminId) {
            DB.updateAdministrator(adminId, formData);
            showNotification('Administrator updated successfully');
        } else {
            DB.addAdministrator(formData);
            showNotification('Administrator added successfully');
        }
        closeModal('admin-modal');
        loadAdministrators();
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

function deleteAdministrator(id) {
    if (!isSuperAdmin()) {
        showNotification('Access denied. Super Admin privileges required.', 'error');
        return;
    }

    if (confirm('Are you sure you want to delete this administrator?')) {
        try {
            DB.deleteAdministrator(id);
            showNotification('Administrator deleted successfully');
            loadAdministrators();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
}

document.getElementById('admin-password').addEventListener('input', function() {
    const strength = validatePassword(this.value);
    const strengthIndicator = this.parentElement.querySelector('.password-strength');
    if (!strengthIndicator) {
        const indicator = document.createElement('div');
        indicator.className = `password-strength strength-${strength}`;
        this.parentElement.appendChild(indicator);
    } else {
        strengthIndicator.className = `password-strength strength-${strength}`;
    }
});

window.openAdminModal = openAdminModal;
window.deleteAdministrator = deleteAdministrator;

function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
}

function editAdministrator(id) {
    openAdminModal(id);
}

document.getElementById('admin-search').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const administrators = DB.getAdministrators();
    const filteredAdmins = administrators.filter(admin => 
        admin.username.toLowerCase().includes(searchTerm) ||
        admin.email.toLowerCase().includes(searchTerm) ||
        admin.role.toLowerCase().includes(searchTerm)
    );
    
    const adminsList = document.getElementById('administrators-list');
    if (!adminsList) return;

    if (filteredAdmins.length === 0) {
        adminsList.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">
                    No administrators found matching your search.
                </td>
            </tr>
        `;
        return;
    }

    adminsList.innerHTML = filteredAdmins.map(admin => `
        <tr>
            <td>${admin.username}</td>
            <td>
                <span class="role-badge role-${admin.role.toLowerCase()}">
                    ${admin.role}
                </span>
            </td>
            <td>${admin.email}</td>
            <td>
                <span class="status-badge status-${admin.status.toLowerCase()}">
                    ${admin.status}
                </span>
            </td>
            <td>${formatDate(admin.lastLogin)}</td>
            <td>
                <button onclick="editAdministrator('${admin.id}')" class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteAdministrator('${admin.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
});

window.editAdministrator = editAdministrator;
window.formatDate = formatDate;