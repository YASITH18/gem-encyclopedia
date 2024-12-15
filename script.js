document.addEventListener('DOMContentLoaded', function() {
    // Initialize database and load data
    if (typeof DB !== 'undefined') {
        DB.initialize();
        loadGemsAndCategories();
    }

    // Handle loading animation
    const loader = document.querySelector('.loading');
    if (loader) {
        setTimeout(() => {
            loader.style.display = 'none';
        }, 3000);
    }

    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');
    const exploreButton = document.querySelector('.cta-button');

    // Show home section by default and hide others
    sections.forEach(section => {
        if (section.id === 'home') {
            section.style.display = 'flex';
        } else {
            section.style.display = 'none';
        }
    });

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // If it's an external link (like community.html), let it behave normally
            if (this.getAttribute('href').includes('.html')) {
                return;
            }

            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');

            // Get the target section id from href
            const targetId = this.getAttribute('href').split('#')[1];

            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // Show the target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                if (targetId === 'home') {
                    targetSection.style.display = 'flex';
                } else {
                    targetSection.style.display = 'block';
                }
            }
        });
    });

    // Handle hash changes for direct links
    function handleHashChange() {
        const hash = window.location.hash;
        if (hash) {
            const targetId = hash.substring(1);
            const targetSection = document.getElementById(targetId);
            const targetLink = document.querySelector(`a[href="#${targetId}"]`);

            if (targetSection && targetLink) {
                // Hide all sections
                sections.forEach(section => {
                    section.style.display = 'none';
                });

                // Show target section
                if (targetId === 'home') {
                    targetSection.style.display = 'flex';
                } else {
                    targetSection.style.display = 'block';
                }

                // Update active link
                navLinks.forEach(link => link.classList.remove('active'));
                targetLink.classList.add('active');
            }
        }
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Handle initial hash on page load
    handleHashChange();

    // Gem category filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const gemCards = document.querySelectorAll('.gem-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');

            // Filter gems with animation
            gemCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                }, 300);
            });
        });
    });

    // Animate elements on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.gem-card, .section-title, .about-content, .contact-form');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animate');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);

    // Handle contact form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = this.querySelector('#name').value;
            const email = this.querySelector('#email').value;
            const message = this.querySelector('#message').value;

            // Simple validation
            if (name && email && message) {
                alert('Thank you for your message! We will get back to you soon.');
                this.reset();
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
        const hero = document.querySelector('#home');
        if (hero) {
            const scrolled = window.pageYOffset;
            hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
        }
    });

    // Initialize animations for gem cards
    gemCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Add this to your existing script.js
    window.addEventListener('adminDataUpdated', function(e) {
        loadGemsAndCategories();
    });

    function loadGemsAndCategories() {
        const gems = DB.getGems();
        const categories = DB.getCategories();
        
        // Update category filters
        updateCategoryFilters(categories);
        
        // Update gem grid
        updateGemGrid(gems);
    }

    function updateCategoryFilters(categories) {
        const filterContainer = document.querySelector('.category-filters');
        if (!filterContainer) return;

        filterContainer.innerHTML = `
            <button class="filter-btn active" data-filter="all">All Gems</button>
            ${categories.map(category => `
                <button class="filter-btn" data-filter="${category.name.toLowerCase()}">
                    ${category.name}
                </button>
            `).join('')}
        `;

        // Reattach filter event listeners
        attachFilterListeners();
    }

    function updateGemGrid(gems) {
        const gemGrid = document.getElementById('gem-display');
        if (!gemGrid) return;

        if (gems.length === 0) {
            gemGrid.innerHTML = `
                <div class="no-gems-message">
                    <i class="fas fa-gem"></i>
                    <p>No gems available yet.</p>
                </div>
            `;
            return;
        }

        gemGrid.innerHTML = gems.map(gem => `
            <div class="gem-card" data-category="${gem.category.toLowerCase()}">
                <div class="gem-image">
                    <img src="${gem.image}" alt="${gem.name}" onerror="this.src='images/default-gem.jpg'">
                </div>
                <div class="gem-info">
                    <h3>${gem.name}</h3>
                    <p class="gem-property">Hardness: ${gem.hardness} Mohs</p>
                    <p class="gem-property">Crystal System: ${gem.crystalSystem}</p>
                    <p class="gem-description">${gem.description}</p>
                </div>
            </div>
        `).join('');
    }

    function attachFilterListeners() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const gemCards = document.querySelectorAll('.gem-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');

                const filterValue = this.getAttribute('data-filter');

                // Filter gems with animation
                gemCards.forEach(card => {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                            card.style.display = 'block';
                            setTimeout(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'scale(1)';
                            }, 50);
                        } else {
                            card.style.display = 'none';
                        }
                    }, 300);
                });
            });
        });
    }

    // Function to fetch and update content
    function loadContent(section) {
        const sectionElement = document.getElementById(section);
        if (!sectionElement) return;

        // Show loading state
        sectionElement.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';

        // For the about section, we'll use the static content
        if (section === 'about') {
            sectionElement.style.display = 'block';
            return;
        }

        // For other sections that might need dynamic content
        fetch(`/api/content/${section}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch content');
                return response.json();
            })
            .then(data => {
                if (data && data.content) {
                    sectionElement.innerHTML = data.content;
                }
            })
            .catch(error => {
                console.error('Error loading content:', error);
                sectionElement.innerHTML = '<div class="error-message">Failed to load content. Please try again later.</div>';
            });
    }

    // Load content when page loads
    document.addEventListener('DOMContentLoaded', () => {
        // Load content for different sections
        loadContent('about');
        loadContent('products');
        // Add other sections as needed
    });

    // Optional: Periodically check for updates
    setInterval(() => {
        loadContent('about');
        loadContent('products');
        // Add other sections as needed
    }, 60000); // Check every minute

    // Add this to your existing DOMContentLoaded event listener
    async function loadGemsFromServer() {
        try {
            const response = await fetch('/api/gems');
            const gems = await response.json();
            updateGemGrid(gems);
        } catch (error) {
            console.error('Error loading gems:', error);
        }
    }

    // Listen for updates from admin panel
    window.addEventListener('gemsUpdated', () => {
        loadGemsFromServer();
    });

    // Initial load
    loadGemsFromServer();

    // Update the section display function
    function showSection(sectionId) {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.style.display = 'block';
                if (section.id === 'about') {
                    // Trigger animation when showing about section
                    const features = section.querySelectorAll('.feature');
                    features.forEach((feature, index) => {
                        feature.style.animationDelay = `${index * 0.2}s`;
                        feature.classList.add('animate');
                    });
                }
            } else {
                section.style.display = 'none';
            }
        });
    }

    // Add this to your existing click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').includes('.html')) return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href').split('#')[1];
            showSection(targetId);
            
            // Update active link
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
        });
    });
}); 