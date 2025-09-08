// ----------- Utility Functions ----------- //
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.getElementById('appNotification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'appNotification';
    notification.className = `fixed top-4 right-4 px-4 py-3 rounded shadow-lg z-50 ${
        type === 'error' ? 'bg-red-500 text-white' : 
        type === 'success' ? 'bg-green-500 text-white' : 
        'bg-brown-600 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = () => reject(new Error('Failed to read file'));
        fr.readAsDataURL(file);
    });
}

function formatDateISO(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
}

function safeReadLink(formats) {
    if (!formats) return '';
    // Prefer html variants, then pdf, then plain
    return formats['text/html; charset=utf-8'] || 
           formats['text/html'] || 
           formats['application/pdf'] || 
           formats['application/epub+zip'] || 
           formats['text/plain; charset=utf-8'] || '';
}

// ----------- Navigation & UI Management ----------- //
function showSection(name) {
    // Hide all sections
    Object.values(domRefs).forEach(ref => {
        if (ref && ref.classList && ref.classList.contains('flex')) {
            ref.classList.add('hidden');
        }
    });
    
    // Show requested section
    if (name === 'app') {
        domRefs.app.classList.remove('hidden');
        showAppSub('library');
    } else if (domRefs[name]) {
        domRefs[name].classList.remove('hidden');
    } else {
        // Fallback to landing
        domRefs.landing.classList.remove('hidden');
    }
    
    // Show/hide back button
    if (name === 'landing') {
        domRefs.backButton.classList.add('hidden');
    } else {
        domRefs.backButton.classList.remove('hidden');
    }
    
    // Scroll to top when changing sections
    window.scrollTo(0, 0);
}

function showAppSub(sub) {
    // Store previous view for back navigation
    if (sub !== currentView) {
        previousView = currentView;
    }
    
    // Hide all app sub-views
    ['library', 'favorites', 'readingList', 'myshelf', 'profile'].forEach(view => {
        if (domRefs[view]) {
            domRefs[view].classList.add('hidden');
        }
    });
    
    // Show requested sub-view
    if (domRefs[sub]) {
        domRefs[sub].classList.remove('hidden');
    }
    
    // Show/hide search section based on current view
    if (sub === 'library') {
        domRefs.searchSection.classList.remove('hidden');
    } else {
        domRefs.searchSection.classList.add('hidden');
    }
    
    // Update navigation highlights
    updateNavHighlights(sub);
    currentView = sub;
}

function updateNavHighlights(sub) {
    // Remove active class from all nav buttons
    const navButtons = [
        domRefs.navLibrary,
        domRefs.navFavorites,
        domRefs.navReadingList,
        domRefs.navMyshelf
    ];
    
    navButtons.forEach(btn => {
        if (btn) btn.classList.remove('active');
    });
    
    // Add active class to current nav button
    const activeButtonMap = {
        'library': domRefs.navLibrary,
        'favorites': domRefs.navFavorites,
        'readingList': domRefs.navReadingList,
        'myshelf': domRefs.navMyshelf
    };
    
    if (activeButtonMap[sub]) {
        activeButtonMap[sub].classList.add('active');
    }
}

function prepareProfileView() {
    if (!currentUser) return;
    
    domRefs.profileAvatar.src = currentUser.avatar || DEFAULT_AVATAR;
    domRefs.profileNewPassword.value = '';
    domRefs.profileAvatarInput.value = '';
}

function goBack() {
    if (currentView === 'library' || currentView === 'favorites' || 
        currentView === 'readingList' || currentView === 'myshelf' || currentView === 'profile') {
        // If we're in a subview of the app, go back to previous subview or landing
        if (previousView && previousView !== currentView) {
            showAppSub(previousView);
        } else {
            showSection('landing');
        }
    } else if (currentView === 'signup' || currentView === 'signin') {
        // If we're in auth screens, go back to landing
        showSection('landing');
    } else {
        // Default fallback
        showSection('landing');
    }
}