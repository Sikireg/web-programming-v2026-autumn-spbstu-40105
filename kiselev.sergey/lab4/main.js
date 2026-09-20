import {ClothingItem} from './model.js';

const STORAGE_KEY = 'clothing-items';

let items = [];

function saveToStorage() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items.map((item) => item.toJSON())),
  );
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const data = JSON.parse(raw);
    return data.map((d) => new ClothingItem(d.id, d.name, d.size, d.colors));
  } catch {
    return [];
  }
}

function renderList() {
  const list = document.querySelector('[data-testid="entity-list"]');
  list.innerHTML = '';

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Список пуст';
    list.appendChild(empty);
    return;
  }

  for (const item of items) {
    const card = document.createElement('article');
    card.className = 'entity-card';
    card.dataset.testid = 'entity-card';
    card.dataset.id = item.id;

    const colorList = item.colors.length > 0 ? item.colors.join(', ') : '—';

    card.innerHTML = `
      <div class="card-header">
        <span class="card-title">${item.name}</span>
        <span class="card-size">${item.size}</span>
      </div>
      <dl class="card-details">
        <dt>ID</dt><dd>${item.id}</dd>
        <dt>Цвета</dt><dd class="card-colors">${colorList}</dd>
        <dt>Количество цветов</dt><dd>${item.colorsCount}</dd>
      </dl>
      <button
        class="card-delete"
        data-testid="delete-entity"
        data-id="${item.id}"
        type="button"
      >Удалить товар</button>
    `;

    list.appendChild(card);
  }
}

function asyncOperation(fn) {
  return new Promise((resolve) => {
    setTimeout(() => {
      fn();
      resolve();
    }, 0);
  });
}

function findById(id) {
  return items.find((item) => item.id === Number(id));
}

async function handleAddItem(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);

  const id = Number(data.get('id'));
  const name = data.get('name').trim();
  const size = data.get('size');

  if (!name || !size) {
    return;
  }
  if (findById(id)) {
    alert(`Товар с ID ${id} уже существует`);
    return;
  }

  await asyncOperation(() => {
    items.push(new ClothingItem(id, name, size));
    saveToStorage();
  });

  renderList();
  form.reset();
}

async function handleDeleteItem(id) {
  await asyncOperation(() => {
    items = items.filter((item) => item.id !== Number(id));
    saveToStorage();
  });

  renderList();
}

async function handleAddColor(itemId, color) {
  const item = findById(itemId);
  if (!item) {
    alert(`Товар с ID ${itemId} не найден`);
    return;
  }

  await asyncOperation(() => {
    item.addColor(color.trim());
    saveToStorage();
  });

  renderList();
}

async function handleRemoveColor(itemId, color) {
  const item = findById(itemId);
  if (!item) {
    alert(`Товар с ID ${itemId} не найден`);
    return;
  }

  await asyncOperation(() => {
    item.removeColor(color.trim());
    saveToStorage();
  });

  renderList();
}

function init() {
  items = loadFromStorage();
  renderList();

  const entityForm = document.querySelector('[data-testid="entity-form"]');
  entityForm.addEventListener('submit', handleAddItem);

  const colorForm = document.querySelector('[data-testid="color-form"]');

  colorForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(colorForm);
    const itemId = Number(data.get('itemId'));
    const color = data.get('color');
    await handleAddColor(itemId, color);
    colorForm.reset();
  });

  colorForm
    .querySelector('[data-action="remove"]')
    .addEventListener('click', async () => {
      const data = new FormData(colorForm);
      const itemId = Number(data.get('itemId'));
      const color = data.get('color');
      if (!color.trim()) {
        return;
      }
      await handleRemoveColor(itemId, color);
      colorForm.reset();
    });

  document
    .querySelector('[data-testid="entity-list"]')
    .addEventListener('click', (event) => {
      const btn = event.target.closest('[data-testid="delete-entity"]');
      if (btn) {
        handleDeleteItem(btn.dataset.id);
      }
    });
}

init();
