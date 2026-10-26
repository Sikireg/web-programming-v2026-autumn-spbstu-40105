import { Recipe } from './model.js';

const STORAGE_KEY = 'lab4_recipes';
let recipes = [];

// Загрузка состояния из localStorage
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      recipes = parsed.map(r => new Recipe(r.title, r.ingredients, r.steps));
    } catch (e) {
      console.error('Ошибка парсинга localStorage', e);
      recipes = [];
    }
  }
}

// Сохранение состояния в localStorage
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

// Обертка для асинхронных операций (Promise + setTimeout)
function asyncOperation(operation) {
  return new Promise(resolve => {
    setTimeout(() => {
      operation();
      saveState();
      render();
      resolve();
    }, 100); // Небольшая задержка для имитации асинхронности
  });
}

// Рендеринг списка рецептов
function render() {
  const list = document.querySelector('[data-testid="entity-list"]');
  list.innerHTML = '';

  recipes.forEach((recipe, index) => {
    const card = document.createElement('div');
    card.setAttribute('data-testid', 'entity-card');
    card.className = 'recipe-card';

    card.innerHTML = `
      <h3>${recipe.title}</h3>
      <p><strong>Ингредиенты (${recipe.ingredientCount}):</strong> ${recipe.ingredients.join(', ') || 'Нет'}</p>
      <p><strong>Шаги (${recipe.steps.length}):</strong></p>
      <ol class="steps-list">
        ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
      </ol>
      <div class="card-actions">
        <button data-action="add-ing" data-index="${index}">Добавить ингредиент</button>
        <button data-action="remove-ing" data-index="${index}">Удалить ингредиент</button>
        <button data-action="add-step" data-index="${index}">Добавить шаг</button>
        <button data-action="remove-step" data-index="${index}">Удалить шаг</button>
        <button data-testid="delete-entity" data-action="delete" data-index="${index}" class="btn-danger">Удалить рецепт</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  render();

  const form = document.querySelector('[data-testid="entity-form"]');
  const list = document.querySelector('[data-testid="entity-list"]');

  // Обработка добавления нового рецепта
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    const title = formData.get('title').trim();
    const ingredients = formData.get('ingredients')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const steps = formData.get('steps')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    asyncOperation(() => {
      recipes.push(new Recipe(title, ingredients, steps));
    });

    form.reset();
  });

  // Делегирование событий для кнопок внутри карточек
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const index = parseInt(btn.dataset.index, 10);
    const recipe = recipes[index];

    if (action === 'delete') {
      asyncOperation(() => {
        recipes.splice(index, 1);
      });
    } else if (action === 'add-ing') {
      const ing = prompt('Введите новый ингредиент:');
      if (ing) {
        asyncOperation(() => {
          recipe.addIngredient(ing.trim());
        });
      }
    } else if (action === 'remove-ing') {
      const ing = prompt('Введите ингредиент для удаления:');
      if (ing) {
        asyncOperation(() => {
          recipe.removeIngredient(ing.trim());
        });
      }
    } else if (action === 'add-step') {
      const step = prompt('Введите новый шаг:');
      if (step) {
        asyncOperation(() => {
          recipe.addStep(step.trim());
        });
      }
    } else if (action === 'remove-step') {
      const step = prompt('Введите шаг для удаления (точно как в списке):');
      if (step) {
        asyncOperation(() => {
          recipe.removeStep(step.trim());
        });
      }
    }
  });
});