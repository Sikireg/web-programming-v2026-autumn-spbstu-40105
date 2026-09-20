import {useState, useMemo} from 'react';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';
import duneCover from '../assets/dune.jpg';
import book1984Cover from '../assets/1984.jpg';
import cleanCodeCover from '../assets/cleancode.jpg';
import tanenbaumCover from '../assets/tanenbaum.jpg';

const INITIAL_BOOKS = [
  {
    id: 1,
    title: 'Дюна',
    rating: 4.8,
    price: 850,
    description: 'Эпическая научная фантастика о пустынной планете.',
    cover: duneCover,
  },
  {
    id: 2,
    title: '1984',
    rating: 4.7,
    price: 600,
    description: 'Знаменитый антиутопический роман Джорджа Оруэлла.',
    cover: book1984Cover,
  },
  {
    id: 3,
    title: 'Чистый код',
    rating: 4.5,
    price: 1200,
    description: 'Создание, анализ и рефакторинг программного обеспечения.',
    cover: cleanCodeCover,
  },
  {
    id: 4,
    title: 'Архитектура компьютера Танненбаума',
    rating: 4.9,
    price: 900,
    description:
      'Иллюстрированное пособие для программистов и любопытствующих.',
    cover: tanenbaumCover,
  },
];

function App() {
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortField(null);
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedBooks = useMemo(() => {
    if (!sortField) {
      return INITIAL_BOOKS;
    }

    return [...INITIAL_BOOKS].sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [sortField, sortOrder]);

  const getArrow = (field) => {
    if (sortField !== field) {
      return ' ⇅';
    }
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const getDirectionText = () => {
    if (!sortField) {
      return 'не задано';
    }
    return sortOrder === 'asc' ? 'по возрастанию' : 'по убыванию';
  };

  return (
    <div className="app-container">
      <h1>Книжный магазин</h1>

      <div className="sort-controls">
        <span className="sort-label">Сортировать: </span>
        <button
          data-testid="sort-title"
          className={sortField === 'title' ? 'active' : ''}
          onClick={() => handleSort('title')}
        >
          Название{getArrow('title')}
        </button>
        <button
          data-testid="sort-price"
          className={sortField === 'price' ? 'active' : ''}
          onClick={() => handleSort('price')}
        >
          Цена{getArrow('price')}
        </button>
        <button
          data-testid="sort-rating"
          className={sortField === 'rating' ? 'active' : ''}
          onClick={() => handleSort('rating')}
        >
          Рейтинг{getArrow('rating')}
        </button>

        <span data-testid="sort-direction" className="direction-indicator">
          ({getDirectionText()})
        </span>
      </div>

      <div className="book-list">
        {sortedBooks.map((book) => (
          <div key={book.id} data-testid="book-card" className="book-card">
            <img src={book.cover} alt={book.title} className="book-cover" />
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="book-description">{book.description}</p>
              <div className="book-meta">
                <span className="book-rating">⭐ {book.rating}</span>
                <span className="book-price">{book.price} ₽</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const rootElement = document.querySelector('[data-testid="app"]');

if (!rootElement) {
  throw new Error('Корневой элемент приложения не найден.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
