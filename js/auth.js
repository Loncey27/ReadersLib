// ----------- Authentication ----------- //
async function handleSignup() {
    const firstname = domRefs.signupFirstname.value.trim();
    const lastname = domRefs.signupLastname.value.trim();
    const email = domRefs.signupEmail.value.trim();
    const phone = domRefs.signupPhone.value.trim();
    const password = domRefs.signupPassword.value;
    const confirmPassword = domRefs.signupConfirmPassword.value;
    
    if (!firstname || !lastname || !email || !password || !confirmPassword) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 4) {
        showNotification('Password must be at least 4 characters', 'error');
        return;
    }
    
    const users = getUsersObj();
    if (users[email]) {
        showNotification('User already exists — please sign in', 'error');
        showSection('signin');
        return;
    }
    
    // Handle avatar optionally
    let avatarData = DEFAULT_AVATAR;
    if (domRefs.signupAvatar.files && domRefs.signupAvatar.files[0]) {
        try {
            avatarData = await fileToDataURL(domRefs.signupAvatar.files[0]);
        } catch (error) {
            console.error('Error processing avatar:', error);
            showNotification('Failed to process profile picture', 'error');
        }
    }
    
    const user = {
        username: email,
        firstname,
        lastname,
        email,
        phone,
        password,
        avatar: avatarData,
        favorites: [],
        readingList: [],
        inventory: []
    };
    
    saveUser(user);
    showNotification('Account created successfully', 'success');
    
    // Clear fields
    domRefs.signupFirstname.value = '';
    domRefs.signupLastname.value = '';
    domRefs.signupEmail.value = '';
    domRefs.signupPhone.value = '';
    domRefs.signupPassword.value = '';
    domRefs.signupConfirmPassword.value = '';
    domRefs.signupAvatar.value = '';
    
    showSection('signin');
}

function handleSignin() {
    const email = domRefs.signinEmail.value.trim();
    const password = domRefs.signinPassword.value;
    
    if (!email || !password) {
        showNotification('Please fill both fields', 'error');
        return;
    }
    
    const user = getUser(email);
    if (!user || user.password !== password) {
        showNotification('Invalid credentials', 'error');
        return;
    }
    
    setCurrentUsername(email);
    
    // Clear sign in fields
    domRefs.signinEmail.value = '';
    domRefs.signinPassword.value = '';
    
    // Initialize app for the current user
    initAppForCurrentUser();
    showSection('app');
}

function handleLogout() {
    setCurrentUsername(null);
    currentUser = null;
    booksCache = [];
    showSection('landing');
    showNotification('Logged out successfully', 'success');
}

// ----------- Profile Management ----------- //
async function handleAvatarChange(event) {
    if (!currentUser) return;
    
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const avatarData = await fileToDataURL(file);
        currentUser.avatar = avatarData;
        
        // Update UI
        domRefs.profileAvatar.src = avatarData;
        domRefs.navAvatar.src = avatarData;
        
        saveUser(currentUser);
        showNotification('Profile picture updated', 'success');
    } catch (error) {
        console.error('Error updating avatar:', error);
        showNotification('Failed to update profile picture', 'error');
    }
}

function handlePasswordChange() {
    if (!currentUser) return;
    
    const newPassword = domRefs.profileNewPassword.value.trim();
    
    if (newPassword.length < 4) {
        showNotification('Password must be at least 4 characters', 'error');
        return;
    }
    
    currentUser.password = newPassword;
    saveUser(currentUser);
    
    domRefs.profileNewPassword.value = '';
    showNotification('Password updated successfully', 'success');
}

function handleAccountDeletion() {
    if (!currentUser) return;
    
    // Check if user has borrowed books
    const borrowedBooks = currentUser.inventory.filter(i => i.status === 'borrowed');
    if (borrowedBooks.length > 0) {
        showNotification('Please return all borrowed books before deleting your account', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }
    
    removeUser(currentUser.username);
    setCurrentUsername(null);
    currentUser = null;
    
    showNotification('Account deleted successfully', 'success');
    showSection('landing');
}