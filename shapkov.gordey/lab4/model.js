export class Library {
  constructor(name) {
    this.name = name;
    this.books = [];
  }

  addBook(book) {
    this.books.push(book);
  }

  removeBook(title) {
    this.books = this.books.filter((book) => book.title !== title);
  }

  get booksCount() {
    return this.books.length;
  }
}

export function groupBooksByGenre(libraries) {
  const map = new Map();
  libraries.forEach((lib) => {
    lib.books.forEach((book) => {
      if (!map.has(book.genre)) {
        map.set(book.genre, []);
      }
      map.get(book.genre).push(book);
    });
  });
  return map;
}

export function getUniqueAuthors(libraries) {
  const authors = new Set();
  libraries.forEach((lib) => {
    lib.books.forEach((book) => authors.add(book.author));
  });
  return Array.from(authors);
}

export function groupBooksByYear(libraries) {
  const grouped = {};
  libraries.forEach((lib) => {
    lib.books.forEach((book) => {
      if (!grouped[book.year]) {
        grouped[book.year] = [];
      }
      grouped[book.year].push(book);
    });
  });
  return grouped;
}

export function getUniqueYears(libraries) {
  const years = new Set();
  libraries.forEach((lib) => {
    lib.books.forEach((book) => years.add(book.year));
  });
  return Array.from(years).sort((a, b) => a - b);
}

export function findBooksByAuthor(libraries, author) {
  const result = [];
  libraries.forEach((lib) => {
    lib.books.forEach((book) => {
      if (book.author === author) {
        result.push(book);
      }
    });
  });
  return result;
}
