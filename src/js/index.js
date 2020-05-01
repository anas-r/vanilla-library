import '../assets/css/styles.css';
import {get, createNewBook} from "./controller";
import * as Cookies from 'js-cookie';
import {Book} from "./book";

import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

var firebaseConfig = {
    apiKey: "AIzaSyCu3Rk4xw-y-zrsTT6zgndnY2q5A1AbDNU",
    authDomain: "basic-library-manager.firebaseapp.com",
    databaseURL: "https://basic-library-manager.firebaseio.com",
    projectId: "basic-library-manager",
    storageBucket: "basic-library-manager.appspot.com",
    messagingSenderId: "764501044227",
    appId: "1:764501044227:web:ef6c4a635d8c7c8be1f236",
    measurementId: "G-PMC4Y82298"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase write data.
function writeData() {
    firebase.database().ref("Library").set({
        idCounter: library.idCounter,
        books: JSON.stringify(library.books),
    })
}

// Fetch data.
function fetchData() {
    firebase.database().ref("Library").once('value')
        .then(function (snapshot) {
            let idCounter = parseInt(snapshot.val().idCounter);
            let books = JSON.parse(snapshot.val().books);
            if (!(snapshot && idCounter && books)) {
                throw new Error();
            }
            return {idCounter, books}
        })
        .then(render)
        .catch(() => {
             render({idCounter: 0, books: []});
        })
}

/*
LIBRARY JS OBJECT
 */

// Local library initializing.
const library = {
    idCounter: 0,
    books: [],
    getBook: (id) => {
        return library.books.filter(book => parseInt(book.id) === parseInt(id))[0]
    },
    getIndex: (book) => {
        return library.books.indexOf(book);
    }
}

// Filling the books from Firebase.
const render = (libraryFirebaseBuffer) => {
    // Library idCounter set.
    library.idCounter = libraryFirebaseBuffer.idCounter;
    // Library books set.
    const booksBuffer = libraryFirebaseBuffer.books.slice();
    booksBuffer.forEach((bookOBJECT) => {
            // Local library.
            const newBookProxy = createNewBook(bookOBJECT);
            library.books.push(newBookProxy);
            // DOM.
            libraryDOM.insertAdjacentHTML("beforeend", bookTemplateNoButton(bookOBJECT));
        }
    )
    // Insertion into the DOM.
    libraryDOM.insertAdjacentHTML('beforeend',
        `
        <div class="btn-wrapper">
            <button><i class="las la-plus la-2x"></i></button>
        </div>`)
}

// Filling the books from local storage.
/*const render = () => {
    const booksCookies = JSON.parse((Cookies.get('books')) ? (Cookies.get('books')) : "[]");
    if (!booksCookies) {
        return;
    }
    booksCookies.forEach((bookOBJECT) => {
            // Local library.
            const newBook = createNewBook(bookOBJECT);
            library.books.push(newBook);
            // DOM.
            libraryDOM.insertAdjacentHTML("beforeend", bookTemplateNoButton(bookOBJECT));
        }
    )
    libraryDOM.insertAdjacentHTML('beforeend',
        `
                <div class="btn-wrapper">
            <button><i class="las la-plus la-2x"></i></button>
        </div>`)
};*/

/*
DOM Constants
 */


const navbarDOM = document.querySelector('nav');
const libraryDOM = document.querySelector('.library');
const headerDOM = document.querySelector('header');

// Book template.
const bookTemplate = (id) => {
    return `
                <ul class="book" id="book-${id}">
            <li class="book-menu">
                <button class="menu-option btn-edit" title="Edit book details">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="menu-option btn-read" title="Declare book read">
                    <i class="fas fa-star"></i>
                </button>
                <button class="menu-option btn-delete" title="Delete book">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
            Title
            <li class="book-option book-title">New book</li>
            Author
            <li class="book-option book-author">Author</li>
            Description
            <li class="book-option book-description" >Description
            </li>
        </ul>
        <div class="btn-wrapper">
            <button><i class="las la-plus la-2x"></i></button>
        </div>`
}


const bookTemplateNoButton = (bookOBJECT) => {
    const isRead = (bookOBJECT.isRead) ? "book-read" : "";
    return `
        <ul class="book ${isRead}" id="book-${bookOBJECT.id}">
    <li class="book-menu">
                   <button class="menu-option btn-edit" title="Edit book details">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="menu-option btn-read" title="Declare book read">
                    <i class="fas fa-star"></i>
                </button>
                <button class="menu-option btn-delete" title="Delete book">
                    <i class="fas fa-trash"></i>
                </button>
    </li>
Title
<li class="book-option book-title">${bookOBJECT.title}</li>
Author
<li class="book-option book-author">${bookOBJECT.author}</li>
Description
<li class="book-option book-description" >${bookOBJECT.description}
    </li>
    </ul>
`
}

// Navigate between all and read books.
navbarDOM.addEventListener('click', (e) => {
    const navOptionDOM = e.target.closest('li');
    if (!navOptionDOM) {
        return;
    }
    navbarDOM.querySelectorAll('li').forEach((el) => el.classList.remove('nav-selected'));
    navOptionDOM.classList.add('nav-selected');
    if (navOptionDOM.textContent === 'Read books') {
        hideReadBooks();
        libraryDOM.querySelector('.btn-wrapper > button').classList.add('hidden');
    } else {
        showReadBooks();
        libraryDOM.querySelector('.btn-wrapper > button').classList.remove('hidden');
    }
})

// Hiding read books.
function hideReadBooks() {
    libraryDOM.querySelectorAll('.book').forEach((bookDOM) => {
            if (!bookDOM.classList.contains('book-read')) bookDOM.classList.add('hidden');
        }
    )
}

// Show all books.
function showReadBooks() {
    libraryDOM.querySelectorAll('.book').forEach((bookDOM) => bookDOM.classList.remove('hidden'))
}


// Adding a book.
libraryDOM.addEventListener("click", (e) => {
    const addBTN = e.target.closest(".btn-wrapper > button");
    if (!addBTN) {
        return;
    }
    const addBTNWrapper = addBTN.parentNode;

    // DOM manipulation.
    libraryDOM.removeChild(addBTNWrapper);
    libraryDOM.insertAdjacentHTML("beforeend", bookTemplate(library.idCounter));

    // Object creation.
    library.books.push(createNewBook(Book(library.idCounter)))

    // Incrementing the id.
    library.idCounter++;
})

// Editing a book.
libraryDOM.addEventListener("click", (e) => {
    const editBTN = e.target.closest('.btn-edit');
    if (!editBTN) {
        return;
    }

    const bookDOM = editBTN.closest('.book');
    const bookID = bookDOM.id.split('-')[1];
    const book = library.getBook(bookID);

    if (!book) {
        return;
    }

    if (editBTN.classList.contains('editable')) {
        editBTN.classList.remove('editable');
        get(bookDOM, 'title').DOM.contentEditable = false;
        book.title = get(bookDOM, 'title').text;
        get(bookDOM, 'author').DOM.contentEditable = false;
        book.author = get(bookDOM, 'author').text;
        get(bookDOM, 'description').DOM.contentEditable = false;
        book.description = get(bookDOM, 'description').text;
        get(bookDOM, 'description').DOM.maxLength = 255;
        editBTN.innerHTML = '<i class="fas fa-edit"></i>';
    } else {
        editBTN.classList.add('editable');
        get(bookDOM, 'title').DOM.contentEditable = true;
        get(bookDOM, 'author').DOM.contentEditable = true;
        get(bookDOM, 'description').DOM.contentEditable = true;
        editBTN.innerHTML = '<i class="fas fa-save"></i>';
    }

})

// Reading a book.
libraryDOM.addEventListener("click", (e) => {
    const readBTN = e.target.closest('.btn-read');
    if (!readBTN) {
        return;
    }

    const bookDOM = readBTN.closest('.book');
    const bookID = bookDOM.id.split('-')[1];
    const book = library.getBook(bookID);

    if (!book) {
        return;
    }

    bookDOM.classList.toggle('book-read');
    book.isRead = !book.isRead;
})

// Deleting a book.
libraryDOM.addEventListener("click", (e) => {
    const deleteBTN = e.target.closest('.btn-delete');
    if (!deleteBTN) {
        return;
    }

    const bookDOM = deleteBTN.closest('.book');
    const bookID = bookDOM.id.split('-')[1];
    const book = library.getBook(bookID);

    if (!book) {
        return;
    }

    const index = library.getIndex(book);
    if (index >= 0) {
        library.books.splice(index, 1);
        libraryDOM.removeChild(bookDOM);
    }
})

// Saving our library (cookies).
headerDOM.addEventListener("click", (e) => {
        const saveAllBTN = e.target.closest('.save');
        if (!saveAllBTN) {
            return;
        }
/*        Cookies.set("id", library.idCounter);
        Cookies.set("books", JSON.stringify(library.books));*/

        // Saving to Firebase.
        writeData();

        // Refreshing the page.
    }
)

fetchData();
// Local library.