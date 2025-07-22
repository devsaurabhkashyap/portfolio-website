// Contact Form Manager - Fixed Version
class ContactFormManager {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.dbService = window.dbService;
        this.auth = window.auth;
        this.init();
    }

    init() {
        this.bindEvents();
        this.addFormInteractions();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
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
        
        // Add loading state without changing button content
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;

        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);
            
            // Add metadata
            data.timestamp = new Date();
            data.userAgent = navigator.userAgent;
            data.referrer = document.referrer;
            data.userId = this.auth.currentUser ? this.auth.currentUser.uid : 'anonymous';
            data.userEmail = this.auth.currentUser ? this.auth.currentUser.email : data.email;

            // Save to Firebase
            if (this.dbService) {
                await this.dbService.saveContactSubmission(data);
                
                // Log user activity if authenticated
                if (this.auth.currentUser) {
                    await this.dbService.logUserActivity(
                        this.auth.currentUser.uid, 
                        'contact_form_submitted'
                    );
                }
            }
            
            this.showMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
            this.form.reset();
            
            // Remove focused classes
            document.querySelectorAll('.form-group.focused').forEach(group => {
                group.classList.remove('focused');
            });
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.showMessage('Failed to send message. Please try again.', 'error');
        } finally {
            // Remove loading state
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
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

// Mobile Menu for Contact
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
        if (this.hamburger && this.navMenu) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
            
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });
        }
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
            if (this.auth) {
                await this.auth.signOut();
            }
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
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=00d4ff&color=fff&size=128`;
                }
            }
        } else {
            if (userInfo) userInfo.style.display = 'none';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to load
    setTimeout(() => {
        new ContactFormManager();
        new ContactMobileMenu();
        new ContactGlobalAuthManager();
    }, 500);
});
