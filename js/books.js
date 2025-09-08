// ----------- Data Fetching ----------- //
async function fetchBooks(query = '') {
    try {
        showNotification('Loading books...');
        
        const q = query ? `?search=${encodeURIComponent(query)}` : '';
        const response = await fetch(`https://gutendex.com/books${q}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        booksCache = data.results || [];
        
        // Cache the results for offline use
        if (!query) {
            cacheBooks(booksCache);
        }
        
        renderLibrary(booksCache);
        showNotification(`Loaded ${booksCache.length} books`, 'success');
    } catch (err) {
        console.error('Error fetching books:', err);
        
        // Try to use cached books if available
        const cachedBooks = getCachedBooks();
        if (cachedBooks && cachedBooks.length > 0) {
            booksCache = cachedBooks;
            renderLibrary(booksCache);
            showNotification('Using cached books (offline mode)', 'error');
        } else {
            showNotification('Could not fetch books. Please check your connection.', 'error');
        }
    }
}

function loadLibrary() {
    if (booksCache.length > 0) {
        renderLibrary(booksCache);
    } else {
        // Try to use cached books first for faster loading
        const cachedBooks = getCachedBooks();
        if (cachedBooks && cachedBooks.length > 0) {
            booksCache = cachedBooks;
            renderLibrary(booksCache);
        } else {
            fetchBooks();
        }
    }
}

// ----------- Book Rendering ----------- //
function renderLibrary(books) {
    if (!domRefs.libraryDiv) return;
    
    domRefs.libraryDiv.innerHTML = '';
    
    if (!books || books.length === 0) {
        domRefs.libraryDiv.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-500">
                No books found. Try a different search.
            </div>
        `;
        return;
    }
    
    // Apply search filter first
    let filteredBooks = books;
    if (currentSearchQuery) {
        const searchBy = domRefs.searchBy.value || 'all';
        filteredBooks = books.filter(book => {
            const title = (book.title || '').toLowerCase();
            const authorNames = (book.authors || []).map(a => a.name).join(' ').toLowerCase();
            const subjects = (book.subjects || []).join(' ').toLowerCase();
            
            switch (searchBy) {
                case 'title':
                    return title.includes(currentSearchQuery);
                case 'author':
                    return authorNames.includes(currentSearchQuery);
                case 'subject':
                    return subjects.includes(currentSearchQuery);
                default: // 'all'
                    return title.includes(currentSearchQuery) || 
                           authorNames.includes(currentSearchQuery) || 
                           subjects.includes(currentSearchQuery);
            }
        });
    }
    
    // Apply current filter
    if (currentFilter === 'available') {
        filteredBooks = filteredBooks.filter(book => 
            !currentUser.inventory.some(i => i.id === book.id && i.status === 'borrowed')
        );
    } else if (currentFilter === 'borrowed') {
        filteredBooks = filteredBooks.filter(book => 
            currentUser.inventory.some(i => i.id === book.id && i.status === 'borrowed')
        );
    } else if (currentFilter === 'favorites') {
        filteredBooks = filteredBooks.filter(book => 
            currentUser.favorites.some(f => f.id === book.id)
        );
    }
    
    if (filteredBooks.length === 0) {
        domRefs.libraryDiv.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-500">
                No books found matching your criteria. Try a different search or filter.
            </div>
        `;
        return;
    }
    
    filteredBooks.forEach(book => {
        const cover = book.formats && (book.formats['image/jpeg'] || book.formats['image/jpg']) || DEFAULT_AVATAR;
        const authors = (book.authors || []).map(a => a.name).join(', ') || 'Unknown';
        const readLink = safeReadLink(book.formats);
        
        // Check if book is in user's collections
        const isFavorited = currentUser.favorites.some(f => f.id === book.id);
        const isBorrowed = currentUser.inventory.some(i => i.id === book.id && i.status === 'borrowed');
        
        const card = document.createElement('div');
        card.className = 'bg-white rounded shadow p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow relative';
        card.innerHTML = `
            <button class="favorite-btn">${isFavorited ? '❤️' : '🤍'}</button>
            <img src="${cover}" alt="${book.title}" class="card-img mb-3" />
            <h3 class="font-semibold text-lg mb-1 line-clamp-2" title="${book.title}">${book.title}</h3>
            <p class="text-sm italic text-gray-600 mb-3">${authors}</p>
            <div class="flex gap-2 mt-auto">
                <button class="view-btn px-3 py-1 bg-brown-600 text-white rounded hover:bg-brown-700">View</button>
                <button class="borrow-btn px-3 py-1 ${isBorrowed ? 'bg-green-800' : 'bg-green-600'} text-white rounded hover:bg-green-700">
                    ${isBorrowed ? 'Return' : 'Borrow'}
                </button>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.view-btn').addEventListener('click', () => showBookDetails(book, authors, cover));
        card.querySelector('.borrow-btn').addEventListener('click', () => toggleBorrow(book, readLink));
        card.querySelector('.favorite-btn').addEventListener('click', () => toggleFavorite(book));
        
        domRefs.libraryDiv.appendChild(card);
    });
}

function showBookDetails(book, authors, cover) {
    domRefs.detailsTitle.textContent = book.title;
    domRefs.detailsAuthor.textContent = authors;
    domRefs.detailsSummary.textContent = (book.summaries && book.summaries[0]) || 
                                     book.description || 
                                     'No summary available.';
    domRefs.detailsCover.src = cover;
    domRefs.detailsModal.classList.remove('hidden');
}

// ----------- User Interactions ----------- //
function toggleFavorite(book) {
    if (!currentUser) return;
    
    const favoriteIndex = currentUser.favorites.findIndex(f => f.id === book.id);
    
    if (favoriteIndex >= 0) {
        // Remove from favorites
        currentUser.favorites.splice(favoriteIndex, 1);
        saveUser(currentUser);
        showNotification('Removed from favorites', 'success');
        
        // If we're on the favorites view, update it
        if (currentView === 'favorites') {
            renderFavorites();
        }
    } else {
        // Add to favorites
        currentUser.favorites.push({
            id: book.id,
            title: book.title,
            authors: book.authors,
            cover: book.formats && (book.formats['image/jpeg'] || '')
        });
        
        saveUser(currentUser);
        showNotification('Added to favorites', 'success');
    }
    
    // Re-render library to update favorite buttons
    if (currentView === 'library') {
        renderLibrary(booksCache);
    }
}

function toggleBorrow(book, readLink) {
    if (!currentUser) return;
    
    const inventoryIndex = currentUser.inventory.findIndex(i => i.id === book.id);
    const isCurrentlyBorrowed = inventoryIndex >= 0 && 
                               currentUser.inventory[inventoryIndex].status === 'borrowed';
    
    if (isCurrentlyBorrowed) {
        // Return the book
        currentUser.inventory[inventoryIndex].status = 'returned';
        currentUser.inventory[inventoryIndex].returnedAt = new Date().toISOString();
        
        // Remove from reading list
        currentUser.readingList = currentUser.readingList.filter(r => r.id !== book.id);
        
        saveUser(currentUser);
        showNotification('Book returned', 'success');
    } else {
        // Borrow the book
        if (!readLink) {
            showNotification('No readable version available for this book', 'error');
            return;
        }
        
        const newInventoryItem = {
            id: book.id,
            title: book.title,
            status: 'borrowed',
            borrowedAt: new Date().toISOString(),
            returnedAt: null,
            link: readLink
        };
        
        if (inventoryIndex >= 0) {
            // Update existing inventory item
            currentUser.inventory[inventoryIndex] = newInventoryItem;
        } else {
            // Add new inventory item
            currentUser.inventory.push(newInventoryItem);
        }
        
        // Add to reading list if not already there
        if (!currentUser.readingList.some(r => r.id === book.id)) {
            currentUser.readingList.push({
                id: book.id,
                title: book.title,
                link: readLink
            });
        }
        
        saveUser(currentUser);
        showNotification('Book borrowed', 'success');
    }
    
    // Update UI based on current view
    if (currentView === 'library') {
        renderLibrary(booksCache);
    } else if (currentView === 'readingList') {
        renderReadingList();
    } else if (currentView === 'myshelf') {
        renderMyshelf();
    }
}

// ----------- Collection Rendering ----------- //
function renderFavorites() {
    if (!domRefs.favoritesTable) return;
    
    domRefs.favoritesTable.innerHTML = '';
    
    if (!currentUser.favorites || currentUser.favorites.length === 0) {
        domRefs.favoritesTable.innerHTML = `
            <tr>
                <td colspan="3" class="p-4 text-center text-gray-500">
                    No favorites yet. Add books to your favorites from the Library.
                </td>
            </tr>
        `;
        return;
    }
    
    currentUser.favorites.forEach(favorite => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="p-3 font-medium">${favorite.title}</td>
            <td class="p-3">${(favorite.authors || []).map(a => a.name).join(', ') || 'Unknown'}</td>
            <td class="p-3 text-center">
                <button class="view-fav bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600">View</button>
                <button class="remove-fav bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Remove</button>
            </td>
        `;
        
        row.querySelector('.view-fav').addEventListener('click', () => {
            showBookDetails(favorite, 
                (favorite.authors || []).map(a => a.name).join(', '), 
                favorite.cover || DEFAULT_AVATAR);
        });
        
        row.querySelector('.remove-fav').addEventListener('click', () => {
            currentUser.favorites = currentUser.favorites.filter(f => f.id !== favorite.id);
            saveUser(currentUser);
            renderFavorites();
            showNotification('Removed from favorites', 'error');
        });
        
        domRefs.favoritesTable.appendChild(row);
    });
}

function renderReadingList() {
    if (!domRefs.readingListTable) return;
    
    domRefs.readingListTable.innerHTML = '';
    
    if (!currentUser.readingList || currentUser.readingList.length === 0) {
        domRefs.readingListTable.innerHTML = `
            <tr>
                <td colspan="2" class="p-4 text-center text-gray-500">
                    Your reading list is empty. Borrow books to add them here.
                </td>
            </tr>
        `;
        return;
    }
    
    currentUser.readingList.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="p-3 font-medium">${item.title}</td>
            <td class="p-3 text-center">
                <button class="read-btn bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700">Read</button>
                <button class="remove-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Remove</button>
            </td>
        `;
        
        row.querySelector('.read-btn').addEventListener('click', () => {
            domRefs.readerIframe.src = item.link;
            domRefs.readerModal.classList.remove('hidden');
        });
        
        row.querySelector('.remove-btn').addEventListener('click', () => {
            currentUser.readingList = currentUser.readingList.filter(r => r.id !== item.id);
            saveUser(currentUser);
            renderReadingList();
            showNotification('Removed from reading list', 'error');
        });
        
        domRefs.readingListTable.appendChild(row);
    });
}

function renderMyshelf() {
    renderBorrowedBooks();
    renderReturnedBooks();
}

function renderBorrowedBooks() {
    if (!domRefs.myshelfBorrowed) return;
    
    domRefs.myshelfBorrowed.innerHTML = '';
    
    const borrowedBooks = currentUser.inventory.filter(i => i.status === 'borrowed');
    
    if (borrowedBooks.length === 0) {
        domRefs.myshelfBorrowed.innerHTML = `
            <tr>
                <td colspan="3" class="p-4 text-center text-gray-500">
                    No borrowed books at the moment.
                </td>
            </tr>
        `;
        return;
    }
    
    borrowedBooks.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="p-3 font-medium">${item.title}</td>
            <td class="p-3 text-center">${formatDateISO(item.borrowedAt)}</td>
            <td class="p-3 text-center">
                <button class="read-btn bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700">Read</button>
                <button class="return-btn bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Return</button>
            </td>
        `;
        
        row.querySelector('.read-btn').addEventListener('click', () => {
            if (!item.link) {
                showNotification('No read link available for this book', 'error');
                return;
            }
            domRefs.readerIframe.src = item.link;
            domRefs.readerModal.classList.remove('hidden');
        });
        
        row.querySelector('.return-btn').addEventListener('click', () => {
            item.status = 'returned';
            item.returnedAt = new Date().toISOString();
            
            // Remove from reading list
            currentUser.readingList = currentUser.readingList.filter(r => r.id !== item.id);
            
            saveUser(currentUser);
            renderMyshelf();
            
            if (currentView === 'library') {
                renderLibrary(booksCache);
            }
            
            showNotification('Book returned', 'success');
        });
        
        domRefs.myshelfBorrowed.appendChild(row);
    });
}

function renderReturnedBooks() {
    if (!domRefs.myshelfReturned) return;
    
    domRefs.myshelfReturned.innerHTML = '';
    
    const returnedBooks = currentUser.inventory.filter(i => i.status === 'returned');
    
    if (returnedBooks.length === 0) {
        domRefs.myshelfReturned.innerHTML = `
            <tr>
                <td colspan="3" class="p-4 text-center text-gray-500">
                    You haven't returned any books yet.
                </td>
            </tr>
        `;
        return;
    }
    
    returnedBooks.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="p-3 font-medium">${item.title}</td>
            <td class="p-3 text-center">${formatDateISO(item.returnedAt)}</td>
            <td class="p-3 text-center"><span class="returned-badge">Returned</span></td>
        `;
        
        domRefs.myshelfReturned.appendChild(row);
    });
}

// ----------- Search Functionality ----------- //
function doSearch() {
    currentSearchQuery = (domRefs.searchInput.value || '').trim().toLowerCase();
    
    if (!currentSearchQuery) {
        loadLibrary();
        return;
    }
    
    // Filter cached books
    if (booksCache.length > 0) {
        renderLibrary(booksCache);
    } else {
        // Fetch from API with search query
        fetchBooks(currentSearchQuery);
    }
}

function applyFilter(filter) {
    currentFilter = filter;
    
    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Re-render library with the new filter
    renderLibrary(booksCache);
}