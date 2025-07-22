// contact.js - Enhanced Contact Form with Firebase
class ContactFormManager {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.dbService = window.dbService;
        this.auth = window.auth;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        this.addFormInteractions();
    }

    addFormInteractions() {
        const inputs = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');
        
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', (e) => {
                if (!e.target.value) {
                    e.target.parentElement.classList.remove('focused');
                }
            });
            
            if (input.value) {
                input.parentElement.classList.add('focused');
            }
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Add additional metadata
        data.timestamp = new Date();
        data.userAgent = navigator.userAgent;
        data.referrer = document.referrer;
        data.userId = this.auth.currentUser ? this.auth.currentUser.uid : 'anonymous';
        data.userEmail = this.auth.currentUser ? this.auth.currentUser.email : data.email;

        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // Save to Firebase
            await this.dbService.saveContactSubmission(data);
            
            // Log user activity if authenticated
            if (this.auth.currentUser) {
                await this.dbService.logUserActivity(
                    this.auth.currentUser.uid, 
                    'contact_form_submitted'
                );
            }
            
            this.showMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
            this.form.reset();
            
            // Remove focused classes
            document.querySelectorAll('.form-group.focused').forEach(group => {
                group.classList.remove('focused');
            });
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.showMessage('Failed to send message. Please try again or contact me directly.', 'error');
        } finally {
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showMessage(message, type) {
        // Remove existing messages
        document.querySelectorAll('.contact-message').forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `contact-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            font-weight: 600;
        `;

        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }

    updateTime() {
        const timeElement = document.querySelector('.quick-stats .stat-item:last-child p');
        if (timeElement && timeElement.textContent.includes('EST')) {
            const now = new Date();
            const estTime = now.toLocaleTimeString('en-US', {
                timeZone: 'America/New_York',
                hour12: true,
                hour: 'numeric',
                minute: '2-digit'
            });
            timeElement.textContent = `EST ${estTime}`;
        }
    }
}

// Enhanced Mobile Menu for Contact
class ContactMobileMenu {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        document.addEventListener('click', (e) => {
            if (!this.hamburger.contains(e.target) && !this.navMenu.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.navMenu.classList.toggle('active');
        this.hamburger.classList.toggle('active');
    }

    closeMenu() {
        this.navMenu.classList.remove('active');
        this.hamburger.classList.remove('active');
    }
}

// Global Auth Manager for Contact Page
class ContactGlobalAuthManager {
    constructor() {
        this.auth = window.auth;
        this.dbService = window.dbService;
        this.init();
    }

    init() {
        if (this.auth) {
            this.auth.onAuthStateChanged((user) => {
                this.updateUI(user);
            });
        }
        this.bindLogout();
    }

    bindLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    async logout() {
        try {
            await this.auth.signOut();
            this.showMessage('Successfully logged out!', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    updateUI(user) {
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (user && user.emailVerified) {
            if (userInfo && userName) {
                userInfo.style.display = 'flex';
                userName.textContent = `Welcome, ${user.displayName || user.email}`;
                if (userAvatar) {
                    userAvatar.src = user.photoURL || 
                        this.dbService.generateAvatar(user.displayName);
                }
            }
        } else {
            if (userInfo) userInfo.style.display = 'none';
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

// Interactive Contact Elements (unchanged from previous version)
class ContactInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.animateOnScroll();
        this.addHoverEffects();
    }

    animateOnScroll() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.contact-method, .stat-item, .form-group').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            observer.observe(el);
        });
    }

    addHoverEffects() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.createRipple(e, btn);
            });
        });
    }

    createRipple(event, element) {
        const circle = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - element.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - element.offsetTop - radius}px`;
        circle.classList.add('ripple');

        const ripple = element.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }

        element.appendChild(circle);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to load
    if (typeof firebase !== 'undefined' && window.dbService) {
        new ContactFormManager();
        new ContactInteractions();
        new ContactMobileMenu();
        new ContactGlobalAuthManager();
    } else {
        // Fallback initialization without Firebase
        console.warn('Firebase not loaded, using fallback functionality');
        new ContactInteractions();
        new ContactMobileMenu();
    }
});
