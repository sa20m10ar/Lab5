// GitHub User Finder Application
class GitHubUserFinder {
    constructor() {
        this.apiUrl = 'https://api.github.com/users';
        this.currentUser = null;
        this.initializeElements();
        this.bindEvents();
    }

    // Initialize DOM elements
    initializeElements() {
        this.elements = {
            usernameInput: document.getElementById('usernameInput'),
            searchBtn: document.getElementById('searchBtn'),
            retryBtn: document.getElementById('retryBtn'),
            
            // States
            loadingState: document.getElementById('loadingState'),
            errorState: document.getElementById('errorState'),
            userProfile: document.getElementById('userProfile'),
            initialState: document.getElementById('initialState'),
            
            // Error elements
            errorMessage: document.getElementById('errorMessage'),
            
            // User profile elements
            userAvatar: document.getElementById('userAvatar'),
            userName: document.getElementById('userName'),
            userLogin: document.getElementById('userLogin'),
            userBio: document.getElementById('userBio'),
            userProfileLink: document.getElementById('userProfileLink'),
            userRepos: document.getElementById('userRepos'),
            userFollowers: document.getElementById('userFollowers'),
            userFollowing: document.getElementById('userFollowing'),
            userLocation: document.getElementById('userLocation'),
            userWebsite: document.getElementById('userWebsite'),
            userTwitter: document.getElementById('userTwitter'),
            userCompany: document.getElementById('userCompany'),
            userJoined: document.getElementById('userJoined'),
            
            // Detail rows for conditional display
            locationRow: document.getElementById('locationRow'),
            websiteRow: document.getElementById('websiteRow'),
            twitterRow: document.getElementById('twitterRow'),
            companyRow: document.getElementById('companyRow'),
            
            // Suggestion links
            suggestionLinks: document.querySelectorAll('.suggestion-link')
        };
    }

    // Bind event listeners
    bindEvents() {
        // Search functionality
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Retry functionality
        this.elements.retryBtn.addEventListener('click', () => this.handleSearch());

        // Suggestion links
        this.elements.suggestionLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const username = e.target.dataset.username;
                this.elements.usernameInput.value = username;
                this.handleSearch();
            });
        });

        // Input focus effects
        this.elements.usernameInput.addEventListener('focus', () => {
            this.elements.usernameInput.parentElement.style.transform = 'translateY(-2px)';
        });

        this.elements.usernameInput.addEventListener('blur', () => {
            this.elements.usernameInput.parentElement.style.transform = 'translateY(0)';
        });
    }

    // Handle search functionality
    async handleSearch() {
        const username = this.elements.usernameInput.value.trim();
        
        if (!username) {
            this.showError('Please enter a GitHub username');
            return;
        }

        // Validate username format (basic validation)
        if (!this.isValidUsername(username)) {
            this.showError('Please enter a valid GitHub username (alphanumeric characters, hyphens, and underscores only)');
            return;
        }

        await this.searchUser(username);
    }

    // Validate username format
    isValidUsername(username) {
        // GitHub username rules: alphanumeric characters and hyphens, no consecutive hyphens, no leading/trailing hyphens
        const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-])*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;
        return usernameRegex.test(username) && username.length <= 39;
    }

    // Search for user using GitHub API
    async searchUser(username) {
        try {
            this.showLoading();
            
            const response = await fetch(`${this.apiUrl}/${username}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'GitHub-User-Finder'
                }
            });

            if (!response.ok) {
                throw new Error(await this.getErrorMessage(response));
            }

            const userData = await response.json();
            this.currentUser = userData;
            this.displayUser(userData);

        } catch (error) {
            console.error('Error fetching user data:', error);
            this.showError(error.message);
        }
    }

    // Get appropriate error message based on response status
    async getErrorMessage(response) {
        switch (response.status) {
            case 404:
                return 'User not found. Please check the username and try again.';
            case 403:
                return 'API rate limit exceeded. Please try again later.';
            case 500:
            case 502:
            case 503:
                return 'GitHub servers are temporarily unavailable. Please try again later.';
            default:
                try {
                    const errorData = await response.json();
                    return errorData.message || `Request failed with status ${response.status}`;
                } catch {
                    return `Request failed with status ${response.status}`;
                }
        }
    }

    // Show loading state
    showLoading() {
        this.hideAllStates();
        this.elements.loadingState.classList.remove('hidden');
        this.elements.searchBtn.disabled = true;
        this.elements.searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    }

    // Show error state
    showError(message) {
        this.hideAllStates();
        this.elements.errorState.classList.remove('hidden');
        this.elements.errorMessage.textContent = message;
        this.resetSearchButton();
    }

    // Display user profile
    displayUser(user) {
        this.hideAllStates();
        this.elements.userProfile.classList.remove('hidden');
        this.resetSearchButton();

        // Basic profile information
        this.elements.userAvatar.src = user.avatar_url;
        this.elements.userAvatar.alt = `${user.login}'s avatar`;
        this.elements.userName.textContent = user.name || user.login;
        this.elements.userLogin.textContent = `@${user.login}`;
        this.elements.userBio.textContent = user.bio || 'No bio available';
        this.elements.userProfileLink.href = user.html_url;

        // Stats
        this.elements.userRepos.textContent = this.formatNumber(user.public_repos);
        this.elements.userFollowers.textContent = this.formatNumber(user.followers);
        this.elements.userFollowing.textContent = this.formatNumber(user.following);

        // Additional details
        this.updateDetail(this.elements.locationRow, this.elements.userLocation, user.location);
        this.updateDetailLink(this.elements.websiteRow, this.elements.userWebsite, user.blog, user.blog);
        this.updateDetailLink(this.elements.twitterRow, this.elements.userTwitter, user.twitter_username, 
                             user.twitter_username ? `https://twitter.com/${user.twitter_username}` : null,
                             user.twitter_username ? `@${user.twitter_username}` : null);
        this.updateDetail(this.elements.companyRow, this.elements.userCompany, user.company);

        // Join date
        const joinDate = new Date(user.created_at);
        this.elements.userJoined.textContent = this.formatDate(joinDate);

        // Add animation
        this.elements.userProfile.style.animation = 'none';
        this.elements.userProfile.offsetHeight; // Trigger reflow
        this.elements.userProfile.style.animation = 'slideUp 0.5s ease-out';
    }

    // Update detail row visibility and content
    updateDetail(rowElement, textElement, value) {
        if (value) {
            rowElement.style.display = 'flex';
            textElement.textContent = value;
        } else {
            rowElement.style.display = 'none';
        }
    }

    // Update detail link row
    updateDetailLink(rowElement, linkElement, value, href, displayText) {
        if (value) {
            rowElement.style.display = 'flex';
            linkElement.href = href || value;
            linkElement.textContent = displayText || value;
        } else {
            rowElement.style.display = 'none';
        }
    }

    // Format numbers for display
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Format date for display
    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Hide all state elements
    hideAllStates() {
        this.elements.loadingState.classList.add('hidden');
        this.elements.errorState.classList.add('hidden');
        this.elements.userProfile.classList.add('hidden');
        this.elements.initialState.classList.add('hidden');
    }

    // Reset search button to normal state
    resetSearchButton() {
        this.elements.searchBtn.disabled = false;
        this.elements.searchBtn.innerHTML = '<span class="search-text">Search</span><i class="fas fa-search"></i>';
    }

    // Show initial state
    showInitial() {
        this.hideAllStates();
        this.elements.initialState.classList.remove('hidden');
    }
}

// Utility functions for enhanced user experience
class UIEnhancements {
    static addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('usernameInput').focus();
            }
            
            // Escape to clear search
            if (e.key === 'Escape') {
                const input = document.getElementById('usernameInput');
                if (document.activeElement === input) {
                    input.blur();
                } else {
                    input.value = '';
                    app.showInitial();
                }
            }
        });
    }

    static addProgressiveEnhancement() {
        // Add loading animation to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
        });

        // Add hover effects to clickable elements
        const clickableElements = document.querySelectorAll('.suggestion-link, .profile-link, .detail-link');
        clickableElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(2px)';
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0)';
            });
        });
    }

    static addTooltips() {
        // Add tooltips for better UX
        const tooltipElements = [
            { selector: '#searchBtn', text: 'Search for GitHub user (Ctrl+K)' },
            { selector: '.user-avatar', text: 'User profile picture' },
            { selector: '.stat-item', text: 'Click to view on GitHub' }
        ];

        tooltipElements.forEach(({ selector, text }) => {
            const element = document.querySelector(selector);
            if (element) {
                element.title = text;
            }
        });
    }
}

// Error boundary for better error handling
class ErrorBoundary {
    static init() {
        window.addEventListener('error', (e) => {
            console.error('Application error:', e.error);
            this.showFallbackUI();
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showFallbackUI();
        });
    }

    static showFallbackUI() {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #e74c3c; color: white; padding: 1rem; border-radius: 10px; z-index: 9999; max-width: 300px;">
                <strong>Oops!</strong> Something went wrong. Please refresh the page and try again.
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize application
let app;

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize main application
        app = new GitHubUserFinder();
        
        // Initialize UI enhancements
        UIEnhancements.addKeyboardShortcuts();
        UIEnhancements.addProgressiveEnhancement();
        UIEnhancements.addTooltips();
        
        // Initialize error boundary
        ErrorBoundary.init();
        
        // Show initial state
        app.showInitial();
        
        console.log('GitHub User Finder initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        ErrorBoundary.showFallbackUI();
    }
});