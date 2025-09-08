ReadersLib is a personal digital library application that allows users to discover, borrow, and enjoy thousands of classic books from Project Gutenberg.

Features
Extensive Book Collection: Access thousands of classic books from around the world

Advanced Search: Search books by title, author, or genre

Personal Library Management:

Add books to favorites

Create reading lists

Track borrowed and returned books

User Profiles: Customizable profiles with avatar support

Responsive Design: Works on desktop and mobile devices

Technology Stack
Frontend: HTML5, Tailwind CSS, Vanilla JavaScript

Storage: Browser localStorage for data persistence

API: Gutenberg Project API (gutendex.com) for book data

Icons: Font Awesome
Usage
For New Users
Click "Get Started" on the landing page

Fill in the registration form

Upload an optional profile picture

Start exploring the library

For Returning Users
Click "Sign In" on the landing page

Enter your email and password

Access your personal library

Library Features
Browse: View all available books in the library

Search: Use the search bar to find specific books

Filter: Filter books by availability, borrowed status, or favorites

Borrow: Click "Borrow" to add a book to your reading list

Read: Click "Read" to open the book in a reader modal

Favorites: Click the heart icon to add/remove books from favorites

Browser Compatibility
ReadersLib works in all modern browsers that support:

ES6 JavaScript features

CSS Grid and Flexbox

localStorage API

Fetch API

Data Storage
All user data is stored locally in the browser's localStorage:

User accounts and profiles

Favorite books

Reading lists

Borrowing history

Cached book data (24-hour expiration)

API Integration
The app integrates with the Gutenberg Project API (gutendex.com) to:

Fetch book data and metadata

Search across the book catalog

Customization
Color Scheme
The app uses a custom brown color palette defined in Tailwind CSS:

javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brown: {
          50: "#fdf8f6",
          100: "#f4e9e3",
          // ... more shades
          900: "#3c2318",
        }
      }
    }
  }
}
Styling
Custom styles are located in styles/main.css and include:

Card styles for books

Modal styles

Custom button styles

Responsive design adjustments

Contributing
To extend or modify ReadersLib:

Follow the modular structure for JavaScript files

Add new styles to main.css

Test localStorage functionality across browsers

Ensure API calls handle errors gracefully

License
This project is for educational purposes. Book content is provided by Project Gutenberg under their terms of use.

Known Limitations
Requires internet connection for initial book loading

localStorage has size limitations (typically 5MB)

No server-side persistence (data is browser-specific)

No image upload compression (large images may affect performance)

Future Enhancements
Potential improvements include:

Social features (sharing, reviews)

Reading progress tracking

Offline reading capability

Export/import of library data
