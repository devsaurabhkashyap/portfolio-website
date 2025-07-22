// auth.js - Firebase Authentication System
class FirebaseAuthManager {
    constructor() {
        this.auth = window.auth;
        this.db = window.db;
        this.dbService = window.dbService;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Listen for authentication state changes
        this.auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log('User signed in:', user.email);
                this.currentUser = user;
                
                // Create/update user profile in Firestore
                await this.dbService.createUserProfile(user);
                
                // Update login activity
                await this.dbService.updateLoginActivity(user.uid);
                
                // Log user activity
                await this.dbService.logUserActivity(user.uid, 'login');
                
                // Track page view
                await this.dbService.trackPageView(user.uid, window.location.pathname);
                
                this.updateUI();
                this.handleAuthenticatedUser();
            } else {
                console.log('User signed out');
                this.currentUser = null;
                this.updateUI();
                this.handleUnauthenticatedUser();
            }
        });

        this.bindEvents();
    }

    bindEvents() {
    const loginModal = document.getElementById('loginModal');
    const modalClose = document.getElementById('modalClose');
    
    if (modalClose) {
        modalClose.addEventListener('click', () => this.closeModalAndRedirect());
    }

    // Enhanced event binding with multiple selectors
    document.addEventListener('click', (e) => {
        // Handle auth tab switching
        if (e.target.classList.contains('auth-tab')) {
            e.preventDefault();
            const tabName = e.target.getAttribute('data-tab');
            this.switchTab(tabName);
        }
        
        // Handle link buttons (Sign up here, Back to Login, etc.)
        if (e.target.classList.contains('link-btn')) {
            e.preventDefault();
            const targetTab = e.target.getAttribute('data-switch');
            this.switchTab(targetTab);
        }
        
        // Handle forgot password link
        if (e.target.classList.contains('forgot-password-link')) {
            e.preventDefault();
            this.switchTab('forgot');
        }
        
        // Handle verification buttons
        if (e.target.id === 'resendVerification') {
            e.preventDefault();
            this.resendEmailVerification();
        }
        
        if (e.target.id === 'checkVerificationStatus') {
            e.preventDefault();
            this.checkVerificationStatus();
        }
    });

    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotForm = document.getElementById('forgotForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    }
    
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => this.logout());
    }
}



    // Authentication Methods
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        this.showLoading(e.target, true);
        
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            if (!user.emailVerified) {
                this.showMessage('Please verify your email address before signing in. Check your inbox for a verification link.', 'warning');
                await this.auth.signOut();
                return;
            }
            
            this.showMessage(`Welcome back, ${user.displayName || user.email}!`, 'success');
            
            // Log successful login
            await this.dbService.logUserActivity(user.uid, 'successful_login');
            
        } catch (error) {
            console.error('Login error:', error);
            this.handleAuthError(error);
            
            // Log failed login attempt
            await this.dbService.logUserActivity('anonymous', `failed_login_attempt: ${email}`);
            
        } finally {
            this.showLoading(e.target, false);
        }
    }

    // Replace the existing handleSignup method in auth.js
async handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const sendEmailVerification = document.getElementById('emailVerification').checked;
    
    if (password !== confirmPassword) {
        this.showMessage('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        this.showMessage('Password must be at least 6 characters long', 'error');
        return;
    }

    this.showLoading(e.target, true);
    
    try {
        const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        await user.updateProfile({
            displayName: name
        });
        
        await this.dbService.createUserProfile(user, { name });
        
        if (sendEmailVerification) {
            try {
                await user.sendEmailVerification({
                    url: window.location.origin,
                    handleCodeInApp: false
                });
                
                this.showMessage(`Account created! Verification email sent to ${email}. Please check your inbox and spam folder.`, 'success');
                
                setTimeout(() => {
                    this.showMessage('If you don\'t receive the email within 5 minutes, try clicking "Resend Email" or use a different email address.', 'info');
                }, 3000);
                
                this.switchTab('emailVerification');
                
            } catch (emailError) {
                console.error('Error sending verification email:', emailError);
                this.showMessage(`Account created successfully, but verification email failed to send. You can resend it from the verification page.`, 'warning');
                this.switchTab('emailVerification');
            }
        } else {
            this.showMessage(`Welcome ${name}! Account created successfully!`, 'success');
        }
        
        await this.dbService.logUserActivity(user.uid, 'account_created');
        
    } catch (error) {
        console.error('Signup error:', error);
        this.handleAuthError(error);
    } finally {
        this.showLoading(e.target, false);
    }
}

    async handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgotEmail').value.trim();
        
        this.showLoading(e.target, true);
        
        try {
            await this.auth.sendPasswordResetEmail(email, {
                url: window.location.origin + '/index.html',
                handleCodeInApp: false
            });
            
            this.showMessage('Password reset email sent! Check your inbox for instructions.', 'success');
            
            // Log password reset request
            await this.dbService.logPasswordResetRequest(email);
            await this.dbService.logUserActivity('anonymous', `password_reset_requested: ${email}`);
            
            // Switch back to login after 3 seconds
            setTimeout(() => {
                this.switchTab('login');
            }, 3000);
            
        } catch (error) {
            console.error('Password reset error:', error);
            this.handleAuthError(error);
        } finally {
            this.showLoading(e.target, false);
        }
    }

    async resendEmailVerification() {
        if (this.currentUser) {
            try {
                await this.currentUser.sendEmailVerification();
                this.showMessage('Verification email sent again!', 'success');
            } catch (error) {
                this.handleAuthError(error);
            }
        }
    }

    async logout() {
        try {
            if (this.currentUser) {
                await this.dbService.logUserActivity(this.currentUser.uid, 'logout');
            }
            
            await this.auth.signOut();
            this.showMessage('Successfully logged out!', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            console.error('Logout error:', error);
            this.showMessage('Error signing out. Please try again.', 'error');
        }
    }

    // UI Management
    handleAuthenticatedUser() {
        this.checkAuthentication();
    }

    handleUnauthenticatedUser() {
        this.checkAuthentication();
    }

    checkAuthentication() {
        const workContent = document.getElementById('workContent');
        const blogContent = document.getElementById('blogContent');

        if (workContent || blogContent) {
            if (!this.currentUser || !this.currentUser.emailVerified) {
                if (workContent) workContent.style.display = 'none';
                if (blogContent) blogContent.style.display = 'none';
                
                setTimeout(() => {
                    this.openModal();
                }, 100);
            } else {
                this.showContent();
            }
        }
    }

    showContent() {
        const workContent = document.getElementById('workContent');
        const blogContent = document.getElementById('blogContent');
        const loginModal = document.getElementById('loginModal');

        if (workContent) {
            workContent.style.display = 'block';
            workContent.style.opacity = '0';
            workContent.style.animation = 'contentFadeIn 0.8s ease forwards';
        }
        
        if (blogContent) {
            blogContent.style.display = 'block';
            blogContent.style.opacity = '0';
            blogContent.style.animation = 'contentFadeIn 0.8s ease forwards';
        }
        
        if (loginModal) {
            loginModal.classList.remove('active');
            loginModal.style.display = 'none';
        }
    }

    openModal() {
        const loginModal = document.getElementById('loginModal');
        
        if (loginModal) {
            loginModal.classList.add('active');
            loginModal.style.display = 'flex';
            loginModal.style.animation = 'modalFadeIn 0.3s ease';
            
            setTimeout(() => {
                loginModal.style.animation = '';
            }, 300);
        }
    }

    closeModalAndRedirect() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.remove('active');
            loginModal.style.animation = 'modalFadeOut 0.3s ease';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 300);
        }
    }

    switchTab(tabName) {
        // Handle email verification special case
        if (tabName === 'emailVerification') {
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById('emailVerificationNotice').classList.add('active');
            return;
        }

        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const forgotTab = document.querySelector('.forgot-tab');
        if (tabName === 'forgot') {
            if (forgotTab) {
                forgotTab.style.display = 'block';
                forgotTab.classList.add('active');
            }
        } else {
            if (forgotTab) {
                forgotTab.style.display = 'none';
            }
            const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        }

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        const targetForm = document.getElementById(`${tabName}Form`);
        if (targetForm) {
            targetForm.classList.add('active');
        }

        this.updateCreativeContent(tabName);
    }

    updateCreativeContent(tabName) {
        const title = document.getElementById('creativeTitle');
        const subtitle = document.getElementById('creativeSubtitle');
        
        if (title && subtitle) {
            switch(tabName) {
                case 'forgot':
                    title.textContent = 'Password Recovery';
                    subtitle.textContent = 'Forgot your password? No worries! We\'ll send you a secure reset link via email.';
                    break;
                case 'signup':
                    title.textContent = 'Join Our Community';
                    subtitle.textContent = 'Create your account to unlock exclusive content and connect with other developers.';
                    break;
                default:
                    title.textContent = 'Exclusive Access Awaits';
                    subtitle.textContent = 'Discover my latest projects, insights, and creative processes.';
            }
        }
    }

    async updateUI() {
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        const userWelcomeSection = document.getElementById('userWelcomeSection');
        const bodyWelcomeText = document.getElementById('bodyWelcomeText');
        const bodyUserAvatar = document.getElementById('bodyUserAvatar');
        
        if (this.currentUser && this.currentUser.emailVerified) {
            // Get additional user data from Firestore
            const userData = await this.dbService.getUserProfile(this.currentUser.uid);
            
            if (userInfo && userName) {
                userInfo.style.display = 'flex';
                userName.textContent = `Welcome, ${this.currentUser.displayName || this.currentUser.email}`;
                if (userAvatar) {
                    userAvatar.src = this.currentUser.photoURL || 
                        this.dbService.generateAvatar(this.currentUser.displayName);
                }
            }
            
            if (bodyWelcomeText) {
                bodyWelcomeText.textContent = `Hi, ${this.currentUser.displayName || 'User'}!`;
            }
            if (bodyUserAvatar) {
                bodyUserAvatar.src = this.currentUser.photoURL || 
                    this.dbService.generateAvatar(this.currentUser.displayName);
            }
            if (userWelcomeSection) {
                userWelcomeSection.style.display = 'block';
            }
        } else {
            if (userInfo) userInfo.style.display = 'none';
            if (userWelcomeSection) userWelcomeSection.style.display = 'none';
        }
    }

    // Error Handling
    handleAuthError(error) {
        let message = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No account found with this email address.';
                break;
            case 'auth/wrong-password':
                message = 'Invalid password. Please try again.';
                break;
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists.';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak. Please choose a stronger password.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            case 'auth/user-disabled':
                message = 'This account has been disabled. Please contact support.';
                break;
            case 'auth/too-many-requests':
                message = 'Too many failed attempts. Please try again later.';
                break;
            default:
                message = error.message;
        }
        
        this.showMessage(message, 'error');
    }

    // Utility Methods
    showLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : 
                type === 'warning' ? '#f59e0b' : '#ef4444'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            font-weight: 600;
        `;

        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, type === 'warning' ? 6000 : 4000);
    }
    // Add this method inside the FirebaseAuthManager class in auth.js
async resendEmailVerification() {
    if (!this.auth.currentUser) {
        this.showMessage('No user logged in. Please sign up first.', 'error');
        return;
    }

    try {
        await this.auth.currentUser.reload();
        if (this.auth.currentUser.emailVerified) {
            this.showMessage('Email is already verified! You can now access all content.', 'success');
            this.updateUI();
            return;
        }

        await this.auth.currentUser.sendEmailVerification({
            url: window.location.origin,
            handleCodeInApp: false
        });
        
        this.showMessage('Verification email sent! Please check your inbox and spam folder.', 'success');
        
    } catch (error) {
        console.error('Error sending verification email:', error);
        this.handleAuthError(error);
    }
}
}

// Work Page Filter (unchanged)
class WorkFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.workItems = document.querySelectorAll('.work-item');
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.filter(btn.dataset.filter));
        });
    }

    filter(category) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${category}"]`).classList.add('active');

        this.workItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
                item.style.animation = 'fadeIn 0.5s ease';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to load
    if (typeof firebase !== 'undefined' && window.dbService) {
        window.authManager = new FirebaseAuthManager();
        
        if (document.querySelector('.work-filter')) {
            new WorkFilter();
        }
    } else {
        console.error('Firebase not loaded properly');
    }
});
