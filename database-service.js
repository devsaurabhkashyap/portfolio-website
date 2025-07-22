// database-service.js - Database Operations
class DatabaseService {
    constructor() {
        this.db = window.db;
        this.auth = window.auth;
    }

    // User Profile Operations
    async createUserProfile(user, additionalData = {}) {
        if (!user) return;
        
        const userRef = this.db.doc(`users/${user.uid}`);
        const snapshot = await userRef.get();
        
        if (!snapshot.exists) {
            const { displayName, email, photoURL } = user;
            const createdAt = new Date();
            
            try {
                await userRef.set({
                    displayName: displayName || additionalData.name,
                    email,
                    photoURL: photoURL || this.generateAvatar(displayName || additionalData.name),
                    createdAt,
                    lastLogin: createdAt,
                    isEmailVerified: user.emailVerified,
                    loginCount: 1,
                    profile: {
                        bio: '',
                        company: '',
                        location: '',
                        website: ''
                    },
                    preferences: {
                        theme: 'dark',
                        notifications: true
                    },
                    ...additionalData
                });
                
                console.log('User profile created successfully');
            } catch (error) {
                console.error('Error creating user profile:', error);
                throw error;
            }
        }
        
        return userRef;
    }

    async getUserProfile(userId) {
        try {
            const userRef = this.db.doc(`users/${userId}`);
            const snapshot = await userRef.get();
            
            if (snapshot.exists) {
                return { id: snapshot.id, ...snapshot.data() };
            }
            return null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    async updateUserProfile(userId, updateData) {
        try {
            const userRef = this.db.doc(`users/${userId}`);
            await userRef.update({
                ...updateData,
                updatedAt: new Date()
            });
            console.log('User profile updated successfully');
            return true;
        } catch (error) {
            console.error('Error updating user profile:', error);
            return false;
        }
    }

    async updateLoginActivity(userId) {
        try {
            const userRef = this.db.doc(`users/${userId}`);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
                const currentCount = userDoc.data().loginCount || 0;
                await userRef.update({
                    lastLogin: new Date(),
                    loginCount: currentCount + 1
                });
            }
        } catch (error) {
            console.error('Error updating login activity:', error);
        }
    }

    // Activity Logging
    async logUserActivity(userId, activity) {
        try {
            const activityRef = this.db.collection('userActivities').doc();
            await activityRef.set({
                userId,
                activity,
                timestamp: new Date(),
                userAgent: navigator.userAgent,
                ip: 'client-side' // You'd need a server endpoint for real IP
            });
        } catch (error) {
            console.error('Error logging user activity:', error);
        }
    }

    // Contact Form Submissions
    async saveContactSubmission(formData) {
        try {
            const contactRef = this.db.collection('contactSubmissions').doc();
            await contactRef.set({
                ...formData,
                timestamp: new Date(),
                status: 'new',
                replied: false
            });
            return true;
        } catch (error) {
            console.error('Error saving contact submission:', error);
            return false;
        }
    }

    // Analytics Data
    async trackPageView(userId, page) {
        try {
            const analyticsRef = this.db.collection('analytics').doc();
            await analyticsRef.set({
                userId: userId || 'anonymous',
                page,
                timestamp: new Date(),
                userAgent: navigator.userAgent,
                referrer: document.referrer
            });
        } catch (error) {
            console.error('Error tracking page view:', error);
        }
    }

    // Password Reset Tracking
    async logPasswordResetRequest(email) {
        try {
            const resetRef = this.db.collection('passwordResets').doc();
            await resetRef.set({
                email,
                timestamp: new Date(),
                status: 'requested'
            });
        } catch (error) {
            console.error('Error logging password reset:', error);
        }
    }

    // Helper Methods
    generateAvatar(name) {
        if (!name) return 'https://ui-avatars.com/api/?name=User&background=00d4ff&color=fff&size=128';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00d4ff&color=fff&size=128&rounded=true&bold=true`;
    }

    // Get all users (admin function)
    async getAllUsers() {
        try {
            const usersRef = this.db.collection('users');
            const snapshot = await usersRef.orderBy('createdAt', 'desc').get();
            
            const users = [];
            snapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });
            
            return users;
        } catch (error) {
            console.error('Error fetching all users:', error);
            return [];
        }
    }

    // Get user activities
    async getUserActivities(userId, limit = 50) {
        try {
            const activitiesRef = this.db.collection('userActivities')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(limit);
            
            const snapshot = await activitiesRef.get();
            const activities = [];
            
            snapshot.forEach(doc => {
                activities.push({ id: doc.id, ...doc.data() });
            });
            
            return activities;
        } catch (error) {
            console.error('Error fetching user activities:', error);
            return [];
        }
    }
}

// Initialize and export database service
window.DatabaseService = DatabaseService;
window.dbService = new DatabaseService();
