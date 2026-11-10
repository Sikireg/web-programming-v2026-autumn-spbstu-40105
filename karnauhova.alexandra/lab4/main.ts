import {
  Recipe,
  getUniqueIngredients,
  getRecipeTitles,
  groupRecipesByIngredientCount,
  groupRecipesByStepCount,
} from './model';

const STORAGE_KEY = 'recipes';

let recipes: Recipe[] = load();

const list = document.querySelector<HTMLElement>(
  '[data-testid="entity-list"]',
)!;
const form = document.querySelector<HTMLFormElement>(
  'form[data-testid="entity-form"]',
)!;
const summary = document.querySelector<HTMLElement>('#summary')!;

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch (e) {
    console.warn('Не удалось сохранить', e);
  }
}

function load(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map(
      (d: {
        id?: string;
        title?: string;
        ingredients?: string[];
        steps?: string[];
      }) =>
        new Recipe(
          String(d.title ?? ''),
          d.ingredients ?? [],
          d.steps ?? [],
          d.id,
        ),
    );
  } catch {
    return [];
  }
}

function runAsync<T>(action: () => T, ms = 300): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(action());
      } catch (e) {
        reject(e);
      }
    }, ms);
  });
}

async function mutate(action: () => void): Promise<void> {
  await runAsync(action);
  save();
  render();
}

const byId = (id: string) => recipes.find((r) => r.id === id);

const addRecipe = (r: Recipe) => mutate(() => void recipes.push(r));
const deleteRecipe = (id: string) =>
  mutate(() => void (recipes = recipes.filter((r) => r.id !== id)));
const addIngredient = (id: string, v: string) =>
  mutate(() => byId(id)?.addIngredient(v));
const removeIngredient = (id: string, v: string) =>
  mutate(() => byId(id)?.removeIngredient(v));
const addStep = (id: string, v: string) => mutate(() => byId(id)?.addStep(v));
const removeStep = (id: string, n: number) =>
  mutate(() => byId(id)?.removeStep(n - 1));

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function plural(n: number, forms: [string, string, string]): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) {
    return forms[0];
  }
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) {
    return forms[1];
  }
  return forms[2];
}

function cardHtml(r: Recipe): string {
  return `
  <article class="card" data-testid="entity-card" data-id="${esc(r.id)}">
    <div class="card-head">
      <h3>${esc(r.title)}</h3>
      <p class="meta">
        ${r.ingredientCount} ${plural(r.ingredientCount, ['ингредиент', 'ингредиента', 'ингредиентов'])}
        <span class="dot">·</span>
        ${r.stepCount} ${plural(r.stepCount, ['шаг', 'шага', 'шагов'])}
      </p>
    </div>

    <h4>Ингредиенты</h4>
    <ul class="item-list">
      ${r.ingredients
        .map(
          (i, idx) => `
        <li>
          <span>${esc(i)}</span>
          <button class="btn-icon" data-action="remove-ingredient" data-index="${idx}" title="Удалить">×</button>
        </li>
      `,
        )
        .join('')}
    </ul>
    <div class="add-row">
      <input type="text" data-input="ingredient" placeholder="Новый ингредиент" />
      <button type="button" class="btn-primary" data-action="add-ingredient" title="Добавить">+</button>
    </div>

    <h4>Шаги приготовления</h4>
    <ol class="item-list steps">
      ${r.steps
        .map(
          (s, idx) => `
        <li>
          <span>${esc(s)}</span>
          <button class="btn-icon" data-action="remove-step" data-index="${idx}" title="Удалить шаг">×</button>
        </li>
      `,
        )
        .join('')}
    </ol>
    <div class="add-row">
      <input type="text" data-input="step" placeholder="Новый шаг" />
      <button type="button" class="btn-primary" data-action="add-step" title="Добавить шаг">+</button>
    </div>

    <button type="button" class="btn-danger" data-testid="delete-entity" data-action="delete-recipe">Удалить рецепт</button>
  </article>`;
}

function renderSummary(): void {
  const fmtDetailed = (m: Map<number, Recipe[]>) =>
    [...m]
      .sort((a, b) => a[0] - b[0])
      .map(([k, v]) => `${k} шт. — ${v.map((r) => r.title).join(', ')}`)
      .join('; ') || '—';

  summary.innerHTML = `
    <div class="stat"><h5>Всего рецептов</h5><p class="big">${recipes.length}</p></div>
    <div class="stat"><h5>Названия</h5><p>${esc(getRecipeTitles(recipes).join(', ') || '—')}</p></div>
    <div class="stat"><h5>Уникальные ингредиенты</h5><p>${esc(getUniqueIngredients(recipes).join(', ') || '—')}</p></div>
    <div class="stat"><h5>По числу ингредиентов</h5><p>${esc(fmtDetailed(groupRecipesByIngredientCount(recipes)))}</p></div>
    <div class="stat"><h5>По числу шагов</h5><p>${esc(fmtDetailed(groupRecipesByStepCount(recipes)))}</p></div>`;
}

function render(): void {
  list.innerHTML = recipes.map(cardHtml).join('');
  renderSummary();
}

form.addEventListener('submit', async (e: SubmitEvent) => {
  e.preventDefault();
  const fd = new FormData(form);
  const title = String(fd.get('title') ?? '').trim();
  if (!title) {
    return;
  }
  const split = (v: FormDataEntryValue | null, re: RegExp) =>
    String(v ?? '')
      .split(re)
      .map((s) => s.trim())
      .filter(Boolean);

  const recipe = new Recipe(
    title,
    split(fd.get('ingredients'), /[,\n]/),
    split(fd.get('steps'), /\n/),
  );
  form.reset();
  await addRecipe(recipe);
});

list.addEventListener('click', async (e: MouseEvent) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
    'button[data-action]',
  );
  if (!btn) {
    return;
  }

  const card = btn.closest<HTMLElement>('[data-testid="entity-card"]')!;
  const id = card.dataset.id!;
  const action = btn.dataset.action!;

  switch (action) {
    case 'delete-recipe':
      await deleteRecipe(id);
      break;

    case 'add-ingredient': {
      const input = card.querySelector<HTMLInputElement>(
        'input[data-input="ingredient"]',
      )!;
      if (input.value.trim()) {
        await addIngredient(id, input.value.trim());
        input.value = '';
      }
      break;
    }

    case 'remove-ingredient': {
      const idx = Number(btn.dataset.index);
      const recipe = byId(id);
      if (recipe && recipe.ingredients[idx]) {
        await removeIngredient(id, recipe.ingredients[idx]);
      }
      break;
    }

    case 'add-step': {
      const input = card.querySelector<HTMLInputElement>(
        'input[data-input="step"]',
      )!;
      if (input.value.trim()) {
        await addStep(id, input.value.trim());
        input.value = '';
      }
      break;
    }

    case 'remove-step': {
      const idx = Number(btn.dataset.index);
      await removeStep(id, idx + 1);
      break;
    }
  }
});

list.addEventListener('keypress', async (e: KeyboardEvent) => {
  if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
    const input = e.target;

    if (input.dataset.input === 'ingredient') {
      const btn = input.parentElement?.querySelector(
        '[data-action="add-ingredient"]',
      ) as HTMLElement | null;
      if (btn) {
        btn.click();
      }
    } else if (input.dataset.input === 'step') {
      const btn = input.parentElement?.querySelector(
        '[data-action="add-step"]',
      ) as HTMLElement | null;
      if (btn) {
        btn.click();
      }
    }
  }
});

render();
