// ----------- App Initialization ----------- //
function initAppForCurrentUser() {
    const username = getCurrentUsername();
    if (!username) {
        showSection('landing');
        return;
    }
    
    const user = getUser(username);
    if (!user) {
        setCurrentUsername(null);
        showSection('landing');
        return;
    }
    
    currentUser = user;
    
    // Ensure user object has all required properties
    currentUser.favorites = currentUser.favorites || [];
    currentUser.readingList = currentUser.readingList || [];
    currentUser.inventory = currentUser.inventory || [];
    
    // Update UI
    domRefs.navUserName.textContent = currentUser.firstname ? `${currentUser.firstname} ${currentUser.lastname}` : currentUser.username;
    domRefs.navAvatar.src = currentUser.avatar || DEFAULT_AVATAR;
    
    // Load library
    loadLibrary();
}

function initEventListeners() {
    // Auth events
    if (domRefs.signupBtn) {
        domRefs.signupBtn.addEventListener('click', handleSignup);
    }
    
    if (domRefs.signinBtn) {
        domRefs.signinBtn.addEventListener('click', handleSignin);
    }
    
    if (domRefs.logoutBtn) {
        domRefs.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Navigation events
    if (domRefs.navLibrary) {
        domRefs.navLibrary.addEventListener('click', () => {
            showAppSub('library');
            loadLibrary();
        });
    }
    
    if (domRefs.navFavorites) {
        domRefs.navFavorites.addEventListener('click', () => {
            showAppSub('favorites');
            renderFavorites();
        });
    }
    
    if (domRefs.navReadingList) {
        domRefs.navReadingList.addEventListener('click', () => {
            showAppSub('readingList');
            renderReadingList();
        });
    }
    
    if (domRefs.navMyshelf) {
        domRefs.navMyshelf.addEventListener('click', () => {
            showAppSub('myshelf');
            renderMyshelf();
        });
    }
    
    // Profile events
    if (domRefs.navUserName) {
        domRefs.navUserName.addEventListener('click', () => {
            prepareProfileView();
            showAppSub('profile');
        });
    }
    
    if (domRefs.profileAvatarInput) {
        domRefs.profileAvatarInput.addEventListener('change', handleAvatarChange);
    }
    
    if (domRefs.profileChangePasswordBtn) {
        domRefs.profileChangePasswordBtn.addEventListener('click', handlePasswordChange);
    }
    
    if (domRefs.profileDeleteAccountBtn) {
        domRefs.profileDeleteAccountBtn.addEventListener('click', handleAccountDeletion);
    }
    
    // Search events
    if (domRefs.searchBtn) {
        domRefs.searchBtn.addEventListener('click', doSearch);
    }
    
    if (domRefs.searchInput) {
        domRefs.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') doSearch();
        });
    }
    
    // Filter events
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyFilter(btn.dataset.filter);
        });
    });
    
    // Modal events
    if (domRefs.detailsCloseBtn) {
        domRefs.detailsCloseBtn.addEventListener('click', () => {
            domRefs.detailsModal.classList.add('hidden');
        });
    }
    
    if (domRefs.readerCloseBtn) {
        domRefs.readerCloseBtn.addEventListener('click', () => {
            domRefs.readerIframe.src = '';
            domRefs.readerModal.classList.add('hidden');
        });
    }
    
    // Back button event
    if (domRefs.backButton) {
        domRefs.backButton.addEventListener('click', goBack);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === domRefs.detailsModal) {
            domRefs.detailsModal.classList.add('hidden');
        }
        if (e.target === domRefs.readerModal) {
            domRefs.readerIframe.src = '';
            domRefs.readerModal.classList.add('hidden');
        }
    });
}

// -----------  initialize App----------- //
function init() {
    initEventListeners();
    
    if (getCurrentUsername()) {
        initAppForCurrentUser();
        showSection('app');
    } else {
        showSection('landing');
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', function() {
    init();
});

// Expose functions to global scope for HTML onclick handlers
window.showSection = showSection;