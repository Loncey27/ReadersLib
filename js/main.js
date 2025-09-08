// ----------- State Management ----------- //
let currentUser = null;
let booksCache = [];
let currentView = 'library';
let previousView = 'library';
let currentFilter = 'all';
let currentSearchQuery = '';

// Default avatar SVG
const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="%23f3efe9"/>
        <circle cx="12" cy="9" r="3.2" fill="%238b5736"/>
        <path d="M6 19c0-2.8 2.7-5 6-5s6 2.2 6 5" stroke="%238b5736" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
);

// ----------- DOM References ----------- //
const domRefs = {
    // Sections
    landing: document.getElementById('landingSection'),
    signup: document.getElementById('signupSection'),
    signin: document.getElementById('signinSection'),
    app: document.getElementById('appSection'),
    searchSection: document.getElementById('searchSection'),
    
    // App sub-views
    profile: document.getElementById('profileView'),
    library: document.getElementById('libraryView'),
    favorites: document.getElementById('favoritesView'),
    readingList: document.getElementById('readingListView'),
    myshelf: document.getElementById('myshelfView'),
    
    // Auth elements
    signupBtn: document.getElementById('signupBtn'),
    signupFirstname: document.getElementById('signup_firstname'),
    signupLastname: document.getElementById('signup_lastname'),
    signupEmail: document.getElementById('signup_email'),
    signupPhone: document.getElementById('signup_phone'),
    signupPassword: document.getElementById('signup_password'),
    signupConfirmPassword: document.getElementById('signup_confirm_password'),
    signupAvatar: document.getElementById('signup_avatar'),
    signinBtn: document.getElementById('signinBtn'),
    signinEmail: document.getElementById('signin_email'),
    signinPassword: document.getElementById('signin_password'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // User elements
    navUserName: document.getElementById('navUserName'),
    navAvatar: document.getElementById('navAvatar'),
    profileAvatar: document.getElementById('profileAvatar'),
    profileAvatarInput: document.getElementById('profileAvatarInput'),
    profileNewPassword: document.getElementById('profileNewPassword'),
    profileChangePasswordBtn: document.getElementById('profileChangePasswordBtn'),
    profileDeleteAccountBtn: document.getElementById('profileDeleteAccountBtn'),
    
    // Search elements
    searchInput: document.getElementById('searchInput'),
    searchBy: document.getElementById('searchBy'),
    searchBtn: document.getElementById('searchBtn'),
    
    // Content containers
    libraryDiv: document.getElementById('libraryDiv'),
    favoritesTable: document.getElementById('favoritesTable'),
    readingListTable: document.getElementById('readingListTable'),
    myshelfBorrowed: document.getElementById('myshelfBorrowed'),
    myshelfReturned: document.getElementById('myshelfReturned'),
    
    // Modals
    detailsModal: document.getElementById('detailsModal'),
    detailsCloseBtn: document.getElementById('detailsCloseBtn'),
    detailsTitle: document.getElementById('detailsTitle'),
    detailsAuthor: document.getElementById('detailsAuthor'),
    detailsSummary: document.getElementById('detailsSummary'),
    detailsCover: document.getElementById('detailsCover'),
    readerModal: document.getElementById('readerModal'),
    readerIframe: document.getElementById('readerIframe'),
    readerCloseBtn: document.getElementById('readerCloseBtn'),
    
    // Navigation buttons
    navLibrary: document.getElementById('nav_library'),
    navFavorites: document.getElementById('nav_favorites'),
    navReadingList: document.getElementById('nav_readingList'),
    navMyshelf: document.getElementById('nav_myshelf'),
    
    // Back button
    backButton: document.getElementById('backButton')
};