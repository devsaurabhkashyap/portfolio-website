// Enhanced Theme Management with Header Fix
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    init() {
        this.applyTheme();
        this.bindEvents();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeToggle = document.getElementById('themeToggle');
        const header = document.querySelector('.header');
        
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        // Force header style update
        if (header) {
            if (this.theme === 'light') {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
            } else {
                header.style.background = 'rgba(10, 10, 10, 0.95)';
            }
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
        
        // Trigger a custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: this.theme } 
        }));
    }

    bindEvents() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// Simple Circle Loader Management
class LoaderManager {
    constructor() {
        this.loader = document.getElementById('loader');
        this.loadingDuration = 3000; // 3 seconds
        this.init();
    }

    init() {
        if (this.loader) {
            this.startLoader();
        }
    }

    startLoader() {
        // Add entrance animation
        this.loader.style.display = 'flex';
        
        // Hide loader after specified duration
        setTimeout(() => {
            this.hideLoader();
        }, this.loadingDuration);
    }

    hideLoader() {
        // Add exit animation
        this.loader.style.animation = 'loaderFadeOut 0.8s ease-out forwards';
        
        // Remove loader from DOM after animation
        setTimeout(() => {
            this.loader.classList.add('hidden');
            document.body.style.overflow = 'visible';
            
            // Completely remove from DOM
            setTimeout(() => {
                if (this.loader) {
                    this.loader.style.display = 'none';
                }
            }, 800);
        }, 100);
    }
}

// Add fade out animation
const loaderStyle = document.createElement('style');
loaderStyle.textContent = `
    @keyframes loaderFadeOut {
        0% { 
            opacity: 1; 
            transform: scale(1); 
        }
        100% { 
            opacity: 0; 
            transform: scale(0.9); 
        }
    }
`;
document.head.appendChild(loaderStyle);



// Typing Effect
class TypingEffect {
    constructor(element, texts, speed = 100) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.init();
    }

    init() {
        if (this.element) {
            this.type();
        }
    }

    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let typeSpeed = this.speed;
        if (this.isDeleting) typeSpeed /= 2;

        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Skill Bar Animation
class SkillBarAnimator {
    constructor() {
        this.skillBars = document.querySelectorAll('.skill-progress');
        this.init();
    }

    init() {
        this.observeSkillBars();
    }

    observeSkillBars() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSkillBar(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.skillBars.forEach(bar => observer.observe(bar));
    }

    animateSkillBar(bar) {
        const width = bar.getAttribute('data-width');
        bar.style.width = width;
    }
}

// Counter Animation
class CounterAnimator {
    constructor() {
        this.counters = document.querySelectorAll('.stat-number');
        this.init();
    }

    init() {
        this.observeCounters();
    }

    observeCounters() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(progress * target);
            counter.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Enhanced Mobile Menu Class - FIXED VERSION
class MobileMenu {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        console.log('Mobile menu initializing...'); // Debug log
        console.log('Hamburger element:', this.hamburger); // Debug log
        console.log('Nav menu element:', this.navMenu); // Debug log
        
        if (this.hamburger && this.navMenu) {
            this.bindEvents();
        } else {
            console.error('Hamburger or navigation menu elements not found!');
        }
    }

    bindEvents() {
        // Multiple event types for better mobile compatibility
        ['click', 'touchstart'].forEach(eventType => {
            this.hamburger.addEventListener(eventType, (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`${eventType} event triggered on hamburger`); // Debug log
                this.toggleMenu();
            }, { passive: false });
        });

        // Close menu when clicking on navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                !this.hamburger.contains(e.target) && 
                !this.navMenu.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isMenuOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        console.log('Toggle menu called, current state:', this.isMenuOpen); // Debug log
        
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        console.log('Opening menu...'); // Debug log
        this.navMenu.classList.add('active');
        this.hamburger.classList.add('active');
        this.isMenuOpen = true;
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        console.log('Closing menu...'); // Debug log
        this.navMenu.classList.remove('active');
        this.hamburger.classList.remove('active');
        this.isMenuOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Smooth Scrolling
class SmoothScroller {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core functionality
    new ThemeManager();
    new LoaderManager();
    new MobileMenu();
    new SmoothScroller();
    new SkillBarAnimator();
    new CounterAnimator();

    // Initialize typing effect if element exists
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        new TypingEffect(typingElement, [
            'Frontend Developer',
            'UI/UX Designer',
            'React Developer',
            'Creative Coder',
            'Data Analyst'
        ]);
    }
});

// Enhanced scroll animations with proper theme handling
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (window.scrollY > 100) {
        if (currentTheme === 'light') {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(10, 10, 10, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        }
    } else {
        if (currentTheme === 'light') {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        } else {
            header.style.background = 'rgba(10, 10, 10, 0.95)';
            header.style.boxShadow = 'none';
        }
    }
});

// Add this class to script.js for home and contact pages
class GlobalAuthManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }

    init() {
        this.updateUI();
        this.bindLogout();
    }

    generateAvatar(name) {
        if (!name) return 'https://ui-avatars.com/api/?name=User&background=00d4ff&color=fff&size=128';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00d4ff&color=fff&size=128&rounded=true&bold=true`;
    }

    bindLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.showMessage('Successfully logged out!', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        const userWelcomeSection = document.getElementById('userWelcomeSection');
        const bodyWelcomeText = document.getElementById('bodyWelcomeText');
        const bodyUserAvatar = document.getElementById('bodyUserAvatar');
        
        if (this.currentUser) {
            // Update header
            if (userInfo && userName) {
                userInfo.style.display = 'flex';
                userName.textContent = `Welcome, ${this.currentUser.name}`;
                if (userAvatar) {
                    userAvatar.src = this.currentUser.avatar || this.generateAvatar(this.currentUser.name);
                }
            }
            
            // Update body welcome section (for home page)
            if (bodyWelcomeText) {
                bodyWelcomeText.textContent = `Hi, ${this.currentUser.name}!`;
            }
            if (bodyUserAvatar) {
                bodyUserAvatar.src = this.currentUser.avatar || this.generateAvatar(this.currentUser.name);
            }
            if (userWelcomeSection) {
                userWelcomeSection.style.display = 'block';
            }
        } else {
            if (userInfo) userInfo.style.display = 'none';
            if (userWelcomeSection) userWelcomeSection.style.display = 'none';
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
        messageDiv.style.cssText = `
            position: fixed; top: 100px; right: 20px; background: #10b981; color: white;
            padding: 1rem 2rem; border-radius: 12px; z-index: 3000;
            display: flex; align-items: center; gap: 0.5rem; animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }
}

// Enhanced initialization with mobile menu fixes
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing components...'); // Debug log
    
    // Initialize core functionality
    new ThemeManager();
    new LoaderManager();
    new SmoothScroller();
    new SkillBarAnimator();
    new CounterAnimator();
    new GlobalAuthManager();

    // Initialize mobile menu with delay to ensure DOM is ready
    setTimeout(() => {
        new MobileMenu();
    }, 100);

    // Initialize typing effect if element exists
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        new TypingEffect(typingElement, [
            'Frontend Developer',
            'UI/UX Designer', 
            'React Specialist',
            'Creative Coder'
        ]);
    }
});

// Advanced Resume Viewer Class
class AdvancedResumeViewer {
    constructor() {
        this.viewResumeBtn = document.getElementById('viewResumeBtn');
        this.downloadResumeBtn = document.getElementById('downloadResumeBtn');
        this.shareResumeBtn = document.getElementById('shareResumeBtn');
        this.closeResumeBtn = document.getElementById('closeResumeBtn');
        this.cvPlaceholder = document.getElementById('cvPlaceholder');
        this.cvInteractive = document.getElementById('cvInteractiveAdvanced');
        this.navTabs = document.querySelectorAll('.nav-tab');
        this.resumeSections = document.querySelectorAll('.resume-section');
        this.isResumeVisible = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.animateStats();
        this.animateProgressBars();
        this.animateSkillBars();
    }

    bindEvents() {
        if (this.viewResumeBtn) {
            this.viewResumeBtn.addEventListener('click', () => this.toggleResumeView());
        }

        if (this.downloadResumeBtn) {
            this.downloadResumeBtn.addEventListener('click', () => this.downloadResume());
        }

        if (this.shareResumeBtn) {
            this.shareResumeBtn.addEventListener('click', () => this.shareResume());
        }

        if (this.closeResumeBtn) {
            this.closeResumeBtn.addEventListener('click', () => this.closeResumeView());
        }

        // Navigation tabs
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const sectionId = tab.getAttribute('data-section');
                this.switchSection(sectionId);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isResumeVisible) {
                this.closeResumeView();
            }
        });
    }

    toggleResumeView() {
        if (!this.isResumeVisible) {
            this.showResumeView();
        } else {
            this.closeResumeView();
        }
    }

    showResumeView() {
        this.cvPlaceholder.style.display = 'none';
        this.cvInteractive.style.display = 'block';
        this.viewResumeBtn.innerHTML = `
            <span class="btn-text">
                <i class="fas fa-times"></i>
                Close Resume
            </span>
            <div class="btn-particles"></div>
        `;
        this.viewResumeBtn.classList.remove('btn-primary');
        this.viewResumeBtn.classList.add('btn-secondary');
        this.isResumeVisible = true;

        // Trigger animations
        setTimeout(() => {
            this.animateSkillBars();
        }, 500);
    }

    closeResumeView() {
        this.cvInteractive.style.display = 'none';
        this.cvPlaceholder.style.display = 'flex';
        this.viewResumeBtn.innerHTML = `
            <span class="btn-text">
                <i class="fas fa-eye"></i>
                View Interactive Resume
            </span>
            <div class="btn-particles"></div>
        `;
        this.viewResumeBtn.classList.remove('btn-secondary');
        this.viewResumeBtn.classList.add('btn-primary');
        this.isResumeVisible = false;

        // Reset to overview section
        this.switchSection('overview');
    }

    switchSection(sectionId) {
        // Update navigation tabs
        this.navTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-section') === sectionId) {
                tab.classList.add('active');
            }
        });

        // Update sections
        this.resumeSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });

        // Trigger section-specific animations
        if (sectionId === 'skills') {
            setTimeout(() => this.animateSkillBars(), 100);
        }
    }

    animateStats() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-number').forEach(counter => {
            observer.observe(counter);
        });
    }

    animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeProgress = progress * (2 - progress);
            const current = Math.floor(easeProgress * target);
            
            counter.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    animateProgressBars() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target.querySelector('.progress-bar');
                    if (progressBar) {
                        const width = progressBar.getAttribute('data-width');
                        progressBar.style.width = width;
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.highlight-item-advanced').forEach(item => {
            observer.observe(item);
        });
    }

    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-bar-advanced');
        skillBars.forEach((bar, index) => {
            setTimeout(() => {
                const width = bar.getAttribute('data-width');
                bar.style.width = width;
            }, index * 200);
        });
    }

    downloadResume() {
        // Create download link
        const link = document.createElement('a');
        link.href = 'assets/cv/John_Doe_CV.pdf';
        link.download = 'John_Doe_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message
        this.showNotification('Resume downloaded successfully!', 'success');
    }

    shareResume() {
        if (navigator.share) {
            navigator.share({
                title: 'John Doe - Frontend Developer Resume',
                text: 'Check out my professional resume and portfolio',
                url: window.location.href
            }).then(() => {
                this.showNotification('Resume shared successfully!', 'success');
            }).catch(() => {
                this.fallbackShare();
            });
        } else {
            this.fallbackShare();
        }
    }

    fallbackShare() {
        // Copy URL to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            this.showNotification('Resume link copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Unable to share resume', 'error');
        });
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInFromTop 0.3s ease;
            font-weight: 600;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutToTop 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize Advanced Resume Viewer
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedResumeViewer();
});

// Additional CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInFromTop {
        from {
            opacity: 0;
            transform: translateY(-50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideOutToTop {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-50px);
        }
    }
`;
document.head.appendChild(notificationStyles);
