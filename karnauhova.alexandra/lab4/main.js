import { Recipe } from './model.js';

const STORAGE_KEY = 'lab4_recipes';
let recipes = [];

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

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

function asyncOperation(operation) {
  return new Promise(resolve => {
    setTimeout(() => {
      operation();
      saveState();
      render();
      resolve();
    }, 100);
  });
}

function render() {
  const list = document.querySelector('[data-testid="entity-list"]');
  list.innerHTML = '';

  recipes.forEach((recipe, index) => {
    const card = document.createElement('div');
    card.setAttribute('data-testid', 'entity-card');
    card.className = 'recipe-card';

    card.innerHTML = `
      <h3>${recipe.title}</h3>
      <p><strong>Ингредиенты (${recipe.ingredientCount}):</strong> ${recipe.ingredients.length > 0 ? recipe.ingredients.join(', ') : 'Нет'}</p>
      <p><strong>Шаги (${recipe.steps.length}):</strong></p>
      <ol class="steps-list">
        ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
      </ol>
      
      <div class="card-actions">
        <div class="action-row">
          <input type="text" data-field="new-ing" placeholder="Название ингредиента" />
          <button data-action="add-ing" data-index="${index}">Добавить ингредиент</button>
          <button data-action="remove-ing" data-index="${index}">Удалить ингредиент</button>
        </div>
        <div class="action-row">
          <input type="text" data-field="new-step" placeholder="Описание шага" />
          <button data-action="add-step" data-index="${index}">Добавить шаг</button>
          <button data-action="remove-step" data-index="${index}">Удалить шаг</button>
        </div>
        <div class="action-row">
          <button data-testid="delete-entity" data-action="delete" data-index="${index}" class="btn-danger">Удалить рецепт</button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  render();

  const form = document.querySelector('[data-testid="entity-form"]');
  const list = document.querySelector('[data-testid="entity-list"]');

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
    const card = btn.closest('[data-testid="entity-card"]');

    if (action === 'delete') {
      asyncOperation(() => {
        recipes.splice(index, 1);
      });
    } 
    else if (action === 'add-ing') {
      const input = card.querySelector('[data-field="new-ing"]');
      const val = input.value.trim();
      if (val) {
        asyncOperation(() => {
          recipe.addIngredient(val);
          input.value = '';
        });
      }
    } 
    else if (action === 'remove-ing') {
      const input = card.querySelector('[data-field="new-ing"]');
      const val = input.value.trim();
      if (val) {
        asyncOperation(() => {
          recipe.removeIngredient(val);
          input.value = '';
        });
      }
    } 
    else if (action === 'add-step') {
      const input = card.querySelector('[data-field="new-step"]');
      const val = input.value.trim();
      if (val) {
        asyncOperation(() => {
          recipe.addStep(val);
          input.value = '';
        });
      }
    } 
    else if (action === 'remove-step') {
      const input = card.querySelector('[data-field="new-step"]');
      const val = input.value.trim();
      if (val) {
        asyncOperation(() => {
          recipe.removeStep(val);
          input.value = '';
        });
      }
    }
  });
});