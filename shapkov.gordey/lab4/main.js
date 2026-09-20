import {Library} from './model.js';

let libraries = [];

function loadFromStorage() {
  const saved = localStorage.getItem('lab4_libraries');
  if (saved) {
    const parsed = JSON.parse(saved);
    libraries = parsed.map((libData) => {
      const lib = new Library(libData.name);
      lib.books = libData.books || [];
      return lib;
    });
  } else {
    libraries.push(new Library('Основная библиотека'));
  }
}

function saveToStorage() {
  localStorage.setItem('lab4_libraries', JSON.stringify(libraries));
}

function updateLibrarySelect() {
  const select = document.querySelector('select[name="libraryName"]');
  if (!select) {
    return;
  }
  const currentValue = select.value;
  select.innerHTML = '';
  libraries.forEach((lib) => {
    const option = document.createElement('option');
    option.value = lib.name;
    option.textContent = lib.name;
    select.appendChild(option);
  });
  if (currentValue && libraries.some((l) => l.name === currentValue)) {
    select.value = currentValue;
  }
}

function render() {
  const listEl = document.querySelector('[data-testid="entity-list"]');
  listEl.innerHTML = '';

  libraries.forEach((lib) => {
    const libBlock = document.createElement('div');
    libBlock.className = 'library-block';
    libBlock.innerHTML = `
      <h3>${lib.name} (Книг: ${lib.booksCount})</h3>
      <button data-testid="delete-library" data-lib-name="${lib.name}">Удалить библиотеку</button>
    `;

    const booksContainer = document.createElement('div');
    booksContainer.className = 'books-list';

    lib.books.forEach((book) => {
      const card = document.createElement('div');
      card.setAttribute('data-testid', 'entity-card');
      card.className = 'book-card';
      card.innerHTML = `
        <h4>${book.title}</h4>
        <p><strong>Автор:</strong> ${book.author || '—'}</p>
        <p><strong>Год:</strong> ${book.year || '—'}</p>
        <p><strong>Жанр:</strong> ${book.genre || '—'}</p>
        <button data-testid="delete-entity" data-title="${book.title}" data-lib="${lib.name}">Удалить</button>
      `;
      booksContainer.appendChild(card);
    });

    libBlock.appendChild(booksContainer);
    listEl.appendChild(libBlock);
  });

  saveToStorage();
  updateLibrarySelect();
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

document
  .querySelector('[data-testid="entity-form"]')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const book = {
      title: formData.get('name'),
      author: formData.get('author'),
      year: formData.get('year') ? Number(formData.get('year')) : undefined,
      genre: formData.get('genre'),
    };

    await delay(300);

    const targetLibName = formData.get('libraryName') || libraries[0]?.name;
    const lib = libraries.find((l) => l.name === targetLibName);

    if (lib) {
      lib.addBook(book);
      render();
    }

    e.target.reset();
  });

document
  .querySelector('[data-testid="library-form"]')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = new FormData(e.target).get('name');

    await delay(300);

    libraries.push(new Library(name));
    render();
    e.target.reset();
  });

document
  .querySelector('[data-testid="entity-list"]')
  .addEventListener('click', async (e) => {
    if (e.target.getAttribute('data-testid') === 'delete-entity') {
      const title = e.target.getAttribute('data-title');
      const libName = e.target.getAttribute('data-lib');

      await delay(300);

      const lib = libraries.find((l) => l.name === libName);
      if (lib) {
        lib.removeBook(title);
        render();
      }
    }

    if (e.target.getAttribute('data-testid') === 'delete-library') {
      const libName = e.target.getAttribute('data-lib-name');

      await delay(300);

      libraries = libraries.filter((lib) => lib.name !== libName);
      render();
    }
  });

loadFromStorage();
render();
