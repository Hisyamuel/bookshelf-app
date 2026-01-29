import { showToast } from "./notification-toast.js";
import { showConfirm } from "./notification-toast.js";

document.addEventListener('DOMContentLoaded', function () {
    const books = [];
    const RENDER_EVENT = 'render-book';
    const STORAGE_KEY = 'BOOKSHELF_APPS';

    const bookForm = document.getElementById('bookForm');
    const bookFormSubmit = document.getElementById('bookFormSubmit');
    const bookFormIsCompleteCheckbox = document.getElementById('bookFormIsComplete');

    const searchForm = document.getElementById('searchBook');
    const searchInput = document.getElementById('searchBookTitle');

    function isStorageExist() {
        if (typeof (Storage) === 'undefined') {
            showToast('Browser Anda tidak mendukung local storage', 'error');
            return false;
        }
        return true;
    }

    function saveData() {
        if (isStorageExist()) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
        }
    }

    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);

        if (data !== null) {
            books.push(...data);
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    function generateId() {
        return +new Date();
    }

    function generateBookObject(id, title, author, year, isComplete) {
        return {
            id,
            title,
            author,
            year: parseInt(year),
            isComplete
        };
    }

    function findBook(bookId) {
        return books.find(book => book.id === bookId) || null;
    }

    function findBookIndex(bookId) {
        return books.findIndex(book => book.id === bookId);
    }

    function addBook() {
        const title = document.getElementById('bookFormTitle').value;
        const author = document.getElementById('bookFormAuthor').value;
        const year = document.getElementById('bookFormYear').value;
        const isComplete = document.getElementById('bookFormIsComplete').checked;

        const generatedID = generateId();
        const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
        books.push(bookObject);

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        bookForm.reset();
        showToast(`Buku "${title}" berhasil ditambahkan!`, 'success');
    }

    function toggleBookStatus(bookId) {
        const bookTarget = findBook(bookId);
        if (!bookTarget) return;

        bookTarget.isComplete = !bookTarget.isComplete;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        const status = bookTarget.isComplete ? 'selesai dibaca' : 'belum selesai dibaca';
        showToast(`Buku "${bookTarget.title}" dipindahkan ke rak ${status}.`, 'info');
    }

    function removeBook(bookId) {
        const bookIndex = findBookIndex(bookId);
        if (bookIndex === -1) return;

        const bookTitle = books[bookIndex].title;
        books.splice(bookIndex, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        showToast(`Buku "${bookTitle}" telah dihapus.`, 'success');
    }

    function editBook(bookId) {
        const bookToEdit = findBook(bookId);
        if (!bookToEdit) return;

        const options = (title, placeholder, value) => ({
            title,
            confirmText: 'Simpan',
            cancelText: 'Batal',
            prompt: { placeholder, value },
        });

        showConfirm(`Edit judul buku:`, (newTitle) => {
            if (!newTitle) return;
            showConfirm(`Edit penulis buku:`, (newAuthor) => {
                if (!newAuthor) return;
                showConfirm(`Edit tahun terbit:`, (newYear) => {
                    if (!newYear || isNaN(parseInt(newYear))) {
                        showToast('Tahun harus berupa angka.', 'error');
                        return;
                    }
                    
                    bookToEdit.title = newTitle;
                    bookToEdit.author = newAuthor;
                    bookToEdit.year = parseInt(newYear);

                    document.dispatchEvent(new Event(RENDER_EVENT));
                    saveData();
                    showToast(`Buku "${bookToEdit.title}" berhasil diperbarui.`, 'success');
                }, null, options('Edit Tahun Terbit', 'Masukkan tahun baru', bookToEdit.year));
            }, null, options('Edit Penulis', 'Masukkan nama penulis baru', bookToEdit.author));
        }, null, options('Edit Judul', 'Masukkan judul baru', bookToEdit.title));
    }

    function makeBookElement(bookObject) {
        const bookItem = document.createElement('div');
        bookItem.classList.add('book_item');
        bookItem.setAttribute('data-bookid', bookObject.id);
        bookItem.setAttribute('data-testid', 'bookItem');

        bookItem.innerHTML = `
            <h3 data-testid="bookItemTitle">${bookObject.title}</h3>
            <p data-testid="bookItemAuthor">Penulis: ${bookObject.author}</p>
            <p data-testid="bookItemYear">Tahun: ${bookObject.year}</p>
            <div class="action">
                <button class="green" data-testid="bookItemIsCompleteButton">
                    ${bookObject.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca'}
                </button>
                <button class="yellow" data-testid="bookItemEditButton">Edit Buku</button>
                <button class="red" data-testid="bookItemDeleteButton">Hapus Buku</button>
            </div>
        `;

        bookItem.querySelector('[data-testid="bookItemIsCompleteButton"]').addEventListener('click', () => {
            toggleBookStatus(bookObject.id);
        });

        bookItem.querySelector('[data-testid="bookItemEditButton"]').addEventListener('click', () => {
            editBook(bookObject.id);
        });

        bookItem.querySelector('[data-testid="bookItemDeleteButton"]').addEventListener('click', () => {
            showConfirm(`Apakah Anda yakin ingin menghapus buku "${bookObject.title}"?`, () => {
                removeBook(bookObject.id);
            }, null, {
                title: 'Konfirmasi Hapus',
                confirmText: 'Ya, Hapus',
                icon: '🗑️'
            });
        });

        return bookItem;
    }

    bookFormIsCompleteCheckbox.addEventListener('change', function () {
        const submitSpan = bookFormSubmit.querySelector('span');
        submitSpan.innerText = this.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
    });

    bookForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        document.dispatchEvent(new Event(RENDER_EVENT));
    });

    searchInput.addEventListener('input', function () {
        document.dispatchEvent(new Event(RENDER_EVENT));
    });

    document.addEventListener(RENDER_EVENT, function () {
        const incompleteBookList = document.getElementById('incompleteBookList');
        const completeBookList = document.getElementById('completeBookList');

        incompleteBookList.innerHTML = '';
        completeBookList.innerHTML = '';

        const searchQuery = searchInput.value.toLowerCase();
        const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchQuery));

        for (const bookItem of filteredBooks) {
            const bookElement = makeBookElement(bookItem);
            if (bookItem.isComplete) {
                completeBookList.append(bookElement);
            } else {
                incompleteBookList.append(bookElement);
            }
        }
    });
    
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});
