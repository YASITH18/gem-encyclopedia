const DB = {
    initialize: function() {
        if (!localStorage.getItem('gemDB')) {
            const initialData = {
                gems: [
                    {
                        id: '1',
                        name: 'Diamond',
                        category: 'precious',
                        hardness: '10',
                        crystalSystem: 'Cubic',
                        description: 'The hardest natural substance on Earth.',
                        image: 'images/diamond.jpg'
                    }
                ],
                categories: [
                    {
                        id: '1',
                        name: 'Precious',
                        description: 'High-value gemstones'
                    },
                    {
                        id: '2',
                        name: 'Semi-Precious',
                        description: 'Medium-value gemstones'
                    }
                ],
                administrators: [
                    {
                        id: '1',
                        username: 'user',
                        email: 'admin@example.com',
                        role: 'superadmin',
                        status: 'Active',
                        password: 'admin@321',
                        createdAt: new Date().toISOString(),
                        lastLogin: new Date().toISOString()
                    }
                ],
                stats: {
                    totalGems: 1,
                    totalCategories: 2,
                    totalAdministrators: 1,
                    lastUpdated: new Date().toISOString(),
                    gemsByCategory: {}
                }
            };
            localStorage.setItem('gemDB', JSON.stringify(initialData));
        } else {
            const db = JSON.parse(localStorage.getItem('gemDB'));
            if (!db.administrators || !db.administrators.some(admin => 
                admin.username === 'user' && 
                admin.password === 'admin@321' && 
                admin.role === 'superadmin'
            )) {
                if (!db.administrators) {
                    db.administrators = [];
                }
                db.administrators.push({
                    id: '1',
                    username: 'user',
                    email: 'admin@example.com',
                    role: 'superadmin',
                    status: 'Active',
                    password: 'admin@321',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                });
                localStorage.setItem('gemDB', JSON.stringify(db));
            }
        }
        this.updateStats();
    },

    // Stats Management
    updateStats: function() {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.stats) {
            db.stats = {
                totalGems: 0,
                totalCategories: 0,
                totalAdministrators: 0,
                lastUpdated: new Date().toISOString(),
                gemsByCategory: {}
            };
        }
        
        db.stats.lastUpdated = new Date().toISOString();
        db.stats.totalGems = db.gems.length;
        db.stats.totalCategories = db.categories.length;
        db.stats.totalAdministrators = db.administrators ? db.administrators.length : 0;
        db.stats.gemsByCategory = this.getGemCountByCategory();
        
        localStorage.setItem('gemDB', JSON.stringify(db));
        return db.stats;
    },

    getGemCountByCategory: function() {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        const counts = {};
        db.categories.forEach(category => {
            counts[category.name] = db.gems.filter(gem => 
                gem.category.toLowerCase() === category.name.toLowerCase()
            ).length;
        });
        return counts;
    },

    // Gem Operations
    getGems: function() {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        return db.gems || [];
    },

    addGem: function(gemData) {
        try {
            clearOldData(); // Clear old data before adding new
            const db = JSON.parse(localStorage.getItem('gemDB'));
            if (!db.gems) db.gems = [];
            
            const newGem = {
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                ...gemData
            };
            db.gems.push(newGem);
            localStorage.setItem('gemDB', JSON.stringify(db));
            this.updateStats();
            return newGem;
        } catch (error) {
            throw new Error('Storage limit reached. Please delete some old entries first.');
        }
    },

    updateGem: function(id, gemData) {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.gems) return null;
        
        const index = db.gems.findIndex(gem => gem.id === id);
        if (index !== -1) {
            db.gems[index] = {
                ...db.gems[index],
                ...gemData,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('gemDB', JSON.stringify(db));
            this.updateStats();
            return db.gems[index];
        }
        return null;
    },

    deleteGem: function(id) {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.gems) return;
        
        db.gems = db.gems.filter(gem => gem.id !== id);
        localStorage.setItem('gemDB', JSON.stringify(db));
        this.updateStats();
    },

    getGemById: function(id) {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.gems) return null;
        return db.gems.find(gem => gem.id === id);
    },

    // Category Operations
    getCategories: function() {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        return db.categories || [];
    },

    addCategory: function(categoryData) {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.categories) db.categories = [];
        
        const newCategory = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            ...categoryData
        };
        db.categories.push(newCategory);
        localStorage.setItem('gemDB', JSON.stringify(db));
        this.updateStats();
        return newCategory;
    },

    updateCategory: function(id, categoryData) {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.categories) return null;
        
        const index = db.categories.findIndex(category => category.id === id);
        if (index !== -1) {
            db.categories[index] = {
                ...db.categories[index],
                ...categoryData,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('gemDB', JSON.stringify(db));
            this.updateStats();
            return db.categories[index];
        }
        return null;
    },

    deleteCategory: function(id) {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.categories) return;
        
        const category = db.categories.find(c => c.id === id);
        if (category) {
            // Check if category has gems
            const hasGems = db.gems && db.gems.some(gem => 
                gem.category.toLowerCase() === category.name.toLowerCase()
            );
            if (hasGems) {
                throw new Error('Cannot delete category that contains gems');
            }
            db.categories = db.categories.filter(c => c.id !== id);
            localStorage.setItem('gemDB', JSON.stringify(db));
            this.updateStats();
        }
    },

    getCategoryById: function(id) {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.categories) return null;
        return db.categories.find(category => category.id === id);
    },

    // Stats Functions
    getStats: function() {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.stats) {
            this.updateStats();
            return this.getStats();
        }
        return {
            ...db.stats,
            gemsByCategory: this.getGemCountByCategory(),
            totalGems: db.gems ? db.gems.length : 0,
            totalCategories: db.categories ? db.categories.length : 0,
            lastUpdated: new Date().toISOString()
        };
    },

    // Search Functions
    searchGems: function(query) {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.gems) return [];
        
        const searchTerm = query.toLowerCase();
        return db.gems.filter(gem => 
            gem.name.toLowerCase().includes(searchTerm) ||
            gem.description.toLowerCase().includes(searchTerm)
        );
    },

    getGemsByCategory: function(categoryName) {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.gems) return [];
        
        return db.gems.filter(gem => 
            gem.category.toLowerCase() === categoryName.toLowerCase()
        );
    },

    // Administrator Management Functions
    getAdministrators: function() {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.administrators) {
            db.administrators = [];
            localStorage.setItem('gemDB', JSON.stringify(db));
        }
        return db.administrators;
    },

    addAdministrator: function(adminData) {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.administrators) {
            db.administrators = [];
        }

        // Check if username or email already exists
        const existingAdmin = db.administrators.find(
            admin => admin.username === adminData.username || admin.email === adminData.email
        );
        if (existingAdmin) {
            throw new Error('Username or email already exists');
        }

        const newAdmin = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            status: 'Active',
            ...adminData
        };

        db.administrators.push(newAdmin);
        localStorage.setItem('gemDB', JSON.stringify(db));
        return newAdmin;
    },

    updateAdministrator: function(id, adminData) {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.administrators) return null;

        const index = db.administrators.findIndex(admin => admin.id === id);
        if (index === -1) {
            throw new Error('Administrator not found');
        }

        // Check if username or email already exists (excluding current admin)
        const existingAdmin = db.administrators.find(
            admin => admin.id !== id && 
            (admin.username === adminData.username || admin.email === adminData.email)
        );
        if (existingAdmin) {
            throw new Error('Username or email already exists');
        }

        db.administrators[index] = {
            ...db.administrators[index],
            ...adminData,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('gemDB', JSON.stringify(db));
        return db.administrators[index];
    },

    deleteAdministrator: function(id) {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.administrators) return;

        // Prevent deleting the last super admin
        const adminToDelete = db.administrators.find(admin => admin.id === id);
        if (adminToDelete.role === 'superadmin') {
            const superAdmins = db.administrators.filter(
                admin => admin.role === 'superadmin' && admin.id !== id
            );
            if (superAdmins.length === 0) {
                throw new Error('Cannot delete the last super administrator');
            }
        }

        db.administrators = db.administrators.filter(admin => admin.id !== id);
        localStorage.setItem('gemDB', JSON.stringify(db));
    },

    getAdministratorById: function(id) {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db.administrators) return null;
        return db.administrators.find(admin => admin.id === id);
    }
};

// Initialize database when the file loads
DB.initialize();

// Add this function to database.js
function clearOldData() {
    try {
        const db = JSON.parse(localStorage.getItem('gemDB'));
        if (!db) return;

        // Keep only the last 50 gems
        if (db.gems && db.gems.length > 50) {
            db.gems = db.gems.slice(-50);
        }

        localStorage.setItem('gemDB', JSON.stringify(db));
    } catch (error) {
        console.error('Error clearing old data:', error);
    }
}