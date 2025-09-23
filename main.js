// Do your work here...

// Memastikan bahwa kode JavaScript baru berjalan setelah seluruh elemen HTML selesai dimuat, sehingga tidak ada error. 
document.addEventListener('DOMContentLoaded', function () {
    const books = []; // Array untuk menyimpan data buku
    const RENDER_EVENT = 'render-book'; // Nama event custom untuk render ulang buku
    const STORAGE_KEY = 'BOOKSHELF_APPS'; // Key untuk localStorage

    // Form dan elemen input
    const bookForm = document.getElementById('bookForm');
    const bookFormSubmit = document.getElementById('bookFormSubmit');
    const bookFormIsCompleteCheckbox = document.getElementById('bookFormIsComplete');

    // Form dan elemen input untuk pencarian
    const searchForm = document.getElementById('searchBook');
    const searchInput = document.getElementById('searchBookTitle');

    /**
     * Mengecek jika browser mendukung localStorage.
       @returns {boolean} //True jika localStorage didukung, false jika tidak.
    */
    function isStorageExist() {
        if (typeof (Storage) === 'undefined') {
            alert('Browser Anda tidak mendukung local storage');
            return false;
        }
        return true;
    }


    //Menyimpan status terkini dari array buku ke localStorage.
    function saveData() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(books);
            localStorage.setItem(STORAGE_KEY, parsed);
        }
    }

    /**
     * Memuat data buku dari localStorage menuju ke array buku.
     */
    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);

        if (data !== null) {
            for (const book of data) {
                books.push(book);
            }
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    /**
     * Membuat ID unik berdasarkan stempel waktu saat ini.
       @returns {number}
    */
    function generateId() {
        return +new Date();
    }

    /**
     * Membuat objek buku dari parameter yang diberikan.
       @param {number} id //ID unik dari buku
       @param {string} title //Judul dari buku
       @param {string} author //Penulis dari buku
       @param {number} year //Tahun terbit dari buku
       @param {boolean} isComplete //Status selesai dibaca atau belum
       @returns {object} //Objek buku yang dibuat
    */
    function generateBookObject(id, title, author, year, isComplete) {
        return {
            id,
            title,
            author,
            year: parseInt(year), // Memastikan tahun disimpan sebagai angka
            isComplete
        };
    }

    /**
     * Mencari buku dalam array books berdasarkan ID-nya.
       @param {number} bookId //ID dari buku yang dicari
       @returns {object|null} //Objek buku jika ditemukan, null jika tidak ditemukan
    */
    function findBook(bookId) {
        for (const bookItem of books) {
            if (bookItem.id === bookId) {
                return bookItem;
            }
        }
        return null;
    }

    /**
     * Mencari index dari buku dalam array buku berdasarkan ID-nya.
       @param {number} bookId //ID dari buku yang dicari
       @returns {number}     //Index dari buku jika ditemukan, -1 jika tidak ditemukan
    */
    function findBookIndex(bookId) {
        for (const index in books) {
            if (books[index].id === bookId) {
                return index;
            }
        }
        return -1;
    }

    /**
     * Menambahkan buku baru ke dalam array books dan memancing event render ulang.
    */
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
    }

    /**
     * Mengubah status selesai dibaca dari sebuah buku dan memindahkannya ke rak yang sesuai.
       @param {number} bookId //ID dari buku yang statusnya ingin diubah.
    */
    function toggleBookStatus(bookId) {
        const bookTarget = findBook(bookId);

        if (bookTarget == null) return;

        bookTarget.isComplete = !bookTarget.isComplete;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    /**
     * Menghapus sebuah buku dari array books berdasarkan ID-nya.
       @param {number} bookId //ID dari buku yang ingin dihapus.
    */
    function removeBook(bookId) {
        const bookIndex = findBookIndex(bookId);

        if (bookIndex === -1) return;

        books.splice(bookIndex, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    /**
     * Mengedit detail dari sebuah buku yang sudah ada berdasarkan ID-nya.
       @param {number} bookId //ID dari buku yang ingin diedit.
     */
    function editBook(bookId) {
        const bookToEdit = findBook(bookId);
        if (!bookToEdit) return;

        const newTitle = prompt("Edit Judul Buku:", bookToEdit.title);
        const newAuthor = prompt("Edit Penulis Buku:", bookToEdit.author);
        const newYear = prompt("Edit Tahun Terbit:", bookToEdit.year);

        if (newTitle && newAuthor && newYear) {
            bookToEdit.title = newTitle;
            bookToEdit.author = newAuthor;
            bookToEdit.year = parseInt(newYear);

            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
        }
    }

    /**
     * Membuat struktur elemen HTML untuk sebuah buku dari satu objek buku.
       @param {object} bookObject //Objek buku yang akan dibuat elemennya.
       @returns {HTMLElement} //Elemen HTML yang merepresentasikan buku tersebut.
    */
    function makeBookElement(bookObject) {
        const bookItem = document.createElement('div');
        bookItem.setAttribute('data-bookid', bookObject.id);
        bookItem.setAttribute('data-testid', 'bookItem');

        const bookTitle = document.createElement('h3');
        bookTitle.setAttribute('data-testid', 'bookItemTitle');
        bookTitle.innerText = bookObject.title;

        const bookAuthor = document.createElement('p');
        bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
        bookAuthor.innerText = `Penulis: ${bookObject.author}`;

        const bookYear = document.createElement('p');
        bookYear.setAttribute('data-testid', 'bookItemYear');
        bookYear.innerText = `Tahun: ${bookObject.year}`;

        const buttonContainer = document.createElement('div');

        const isCompleteButton = document.createElement('button');
        isCompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        isCompleteButton.innerText = bookObject.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
        isCompleteButton.addEventListener('click', () => toggleBookStatus(bookObject.id));

        const deleteButton = document.createElement('button');
        deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
        deleteButton.innerText = 'Hapus Buku';
        deleteButton.addEventListener('click', () => {
            if (confirm(`Apakah Anda yakin ingin menghapus buku "${bookObject.title}"?`)) {
                removeBook(bookObject.id);
            }
        });

        const editButton = document.createElement('button');
        editButton.setAttribute('data-testid', 'bookItemEditButton');
        editButton.innerText = 'Edit Buku';
        editButton.addEventListener('click', () => editBook(bookObject.id));

        buttonContainer.append(isCompleteButton, deleteButton, editButton);
        bookItem.append(bookTitle, bookAuthor, bookYear, buttonContainer);

        return bookItem;
    }

    // --- Event Listeners ---

    // Memperbarui teks pada tombol submit form berdasarkan status checkbox
    bookFormIsCompleteCheckbox.addEventListener('change', function () {
        const submitSpan = bookFormSubmit.querySelector('span b');
        submitSpan.innerText = this.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
    });

    // Mengatur event submit pada form untuk penambahan buku baru
    bookForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    // Mengatur event submit pada form pencarian dan real-time input
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        document.dispatchEvent(new Event(RENDER_EVENT));
    });

    searchInput.addEventListener('keyup', function () {
        document.dispatchEvent(new Event(RENDER_EVENT));
    });

    // Custom event listener merender buku ke rak
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

    // Memuat data dari localStorage saat halaman dimuat
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});
