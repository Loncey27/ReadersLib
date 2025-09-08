// ----------- Constants & Configuration ----------- //
const USERS_KEY = 'readerslib_users';
const CURR_KEY = 'readerslib_currentUser';
const BOOKS_CACHE_KEY = 'readerslib_books_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// ----------- Local Storage Management ----------- //
function getUsersObj() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
    } catch (e) {
        console.error('Error reading users from localStorage:', e);
        return {};
    }
}

function saveUsersObj(obj) {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(obj));
    } catch (e) {
        console.error('Error saving users to localStorage:', e);
        showNotification('Failed to save data', 'error');
    }
}

function getCurrentUsername() {
    return localStorage.getItem(CURR_KEY);
}

function setCurrentUsername(username) {
    if (username) {
        localStorage.setItem(CURR_KEY, username);
    } else {
        localStorage.removeItem(CURR_KEY);
    }
}

function getUser(username) {
    const users = getUsersObj();
    return users[username] || null;
}

function saveUser(user) {
    const users = getUsersObj();
    users[user.username] = user;
    saveUsersObj(users);
}

function removeUser(username) {
    const users = getUsersObj();
    delete users[username];
    saveUsersObj(users);
}

function getCachedBooks() {
    try {
        const cache = JSON.parse(localStorage.getItem(BOOKS_CACHE_KEY));
        if (cache && cache.timestamp && (Date.now() - cache.timestamp) < CACHE_EXPIRY) {
            return cache.books;
        }
    } catch (e) {
        console.error('Error reading books cache:', e);
    }
    return null;
}

function cacheBooks(books) {
    try {
        localStorage.setItem(BOOKS_CACHE_KEY, JSON.stringify({
            books,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.error('Error caching books:', e);
    }
}