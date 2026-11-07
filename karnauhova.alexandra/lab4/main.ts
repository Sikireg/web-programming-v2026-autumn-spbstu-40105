import {
  Recipe,
  getUniqueIngredients,
  getRecipeTitles,
  groupRecipesByIngredientCount,
  groupRecipesByStepCount,
} from "./model";

const STORAGE_KEY = "recipes";

// ---------- Состояние ----------
let recipes: Recipe[] = load();

// ---------- DOM ----------
const list = document.querySelector<HTMLElement>('[data-testid="entity-list"]')!;
const form = document.querySelector<HTMLFormElement>('form[data-testid="entity-form"]')!;
const summary = document.querySelector<HTMLElement>("#summary")!;

// ---------- Хранилище ----------
function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch (e) {
    console.warn("Не удалось сохранить", e);
  }
}

function load(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    // JSON возвращает «голые» объекты — восстанавливаем экземпляры класса
    return data.map(
      (d: { id?: string; title?: string; ingredients?: string[]; steps?: string[] }) =>
        new Recipe(String(d.title ?? ""), d.ingredients ?? [], d.steps ?? [], d.id),
    );
  } catch {
    return [];
  }
}

// ---------- Асинхронность: Promise + setTimeout ----------
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

// Общая обёртка: изменить данные -> сохранить -> перерисовать
async function mutate(action: () => void): Promise<void> {
  await runAsync(action);
  save();
  render();
}

const byId = (id: string) => recipes.find((r) => r.id === id);

const addRecipe = (r: Recipe) => mutate(() => void recipes.push(r));
const deleteRecipe = (id: string) => mutate(() => void (recipes = recipes.filter((r) => r.id !== id)));
const addIngredient = (id: string, v: string) => mutate(() => byId(id)?.addIngredient(v));
const removeIngredient = (id: string, v: string) => mutate(() => byId(id)?.removeIngredient(v));
const addStep = (id: string, v: string) => mutate(() => byId(id)?.addStep(v));
const removeStep = (id: string, n: number) => mutate(() => byId(id)?.removeStep(n - 1));

// ---------- Рендер ----------
function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// ... (ваш код импортов и состояния остаётся без изменений)

function cardHtml(r: Recipe): string {
  return `
  <article class="card" data-testid="entity-card" data-id="${esc(r.id)}">
    <div class="card-head">
      <h3>${esc(r.title)}</h3>
      <div class="badges">
        <span class="badge">🥕 ${r.ingredientCount}</span>
        <span class="badge">📝 ${r.stepCount}</span>
      </div>
    </div>

    <h4>Ингредиенты</h4>
    <ul class="item-list">
      ${r.ingredients.map((i, idx) => `
        <li>
          <span>${esc(i)}</span>
          <button class="btn-icon" data-action="remove-ingredient" data-index="${idx}" title="Удалить">×</button>
        </li>
      `).join("")}
    </ul>
    <div class="add-row">
      <input data-input="ingredient" placeholder="Новый ингредиент">
      <button type="button" class="btn-primary" data-action="add-ingredient" title="Добавить">+</button>
    </div>

    <h4>Шаги приготовления</h4>
    <ol class="item-list steps">
      ${r.steps.map((s, idx) => `
        <li>
          <span>${esc(s)}</span>
          <button class="btn-icon" data-action="remove-step" data-index="${idx}" title="Удалить шаг">×</button>
        </li>
      `).join("")}
    </ol>
    <div class="add-row">
      <input data-input="step" placeholder="Новый шаг">
      <button type="button" class="btn-primary" data-action="add-step" title="Добавить шаг">+</button>
    </div>

    <button type="button" class="btn-danger" data-testid="delete-entity" data-action="delete-recipe">Удалить рецепт</button>
  </article>`;
}

// ... (renderSummary и render остаются без изменений)

// ---------- События ----------
form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();
  const fd = new FormData(form);
  const title = String(fd.get("title") ?? "").trim();
  if (!title) return;
  const split = (v: FormDataEntryValue | null, re: RegExp) =>
    String(v ?? "").split(re).map((s) => s.trim()).filter(Boolean);

  const recipe = new Recipe(title, split(fd.get("ingredients"), /[,\n]/), split(fd.get("steps"), /\n/));
  form.reset();
  await addRecipe(recipe);
});

list.addEventListener("click", async (e: MouseEvent) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-action]");
  if (!btn) return;
  
  const card = btn.closest<HTMLElement>('[data-testid="entity-card"]')!;
  const id = card.dataset.id!;
  const action = btn.dataset.action!;

  switch (action) {
    case "delete-recipe":
      await deleteRecipe(id);
      break;
      
    case "add-ingredient": {
      const input = card.querySelector<HTMLInputElement>('input[data-input="ingredient"]')!;
      if (input.value.trim()) {
        await addIngredient(id, input.value.trim());
        input.value = ""; // Очищаем поле после добавления
      }
      break;
    }
    
    case "remove-ingredient": {
      const idx = Number(btn.dataset.index);
      const recipe = byId(id);
      // Находим значение по индексу и передаём его в вашу модель
      if (recipe && recipe.ingredients[idx]) {
        await removeIngredient(id, recipe.ingredients[idx]);
      }
      break;
    }
    
    case "add-step": {
      const input = card.querySelector<HTMLInputElement>('input[data-input="step"]')!;
      if (input.value.trim()) {
        await addStep(id, input.value.trim());
        input.value = "";
      }
      break;
    }
    
    case "remove-step": {
      const idx = Number(btn.dataset.index);
      // Ваша модель ожидает номер шага (с 1), поэтому передаём idx + 1
      await removeStep(id, idx + 1);
      break;
    }
  }
});

// Добавление по нажатию Enter в полях ввода
// Добавление по нажатию Enter в полях ввода
list.addEventListener("keypress", async (e: KeyboardEvent) => {
  // Проверяем, что событие произошло именно в input и нажат Enter
  if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
    const input = e.target;
    
    if (input.dataset.input === "ingredient") {
      // Явно указываем тип HTMLElement, чтобы работал .click()
      const btn = input.parentElement?.querySelector('[data-action="add-ingredient"]') as HTMLElement | null;
      if (btn) btn.click();
    } else if (input.dataset.input === "step") {
      const btn = input.parentElement?.querySelector('[data-action="add-step"]') as HTMLElement | null;
      if (btn) btn.click();
    }
  }
});

render();

function renderSummary(): void {
  const fmt = (m: Map<number, Recipe[]>) =>
    [...m].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k} → ${v.length}`).join(", ") || "—";
  summary.innerHTML = `
    <div class="stat"><h5>Всего рецептов</h5><p class="big">${recipes.length}</p></div>
    <div class="stat"><h5>Названия</h5><p>${esc(getRecipeTitles(recipes).join(", ") || "—")}</p></div>
    <div class="stat"><h5>Уникальные ингредиенты</h5><p>${esc(getUniqueIngredients(recipes).join(", ") || "—")}</p></div>
    <div class="stat"><h5>По числу ингредиентов</h5><p>${esc(fmt(groupRecipesByIngredientCount(recipes)))}</p></div>
    <div class="stat"><h5>По числу шагов</h5><p>${esc(fmt(groupRecipesByStepCount(recipes)))}</p></div>`;
}

function render(): void {
  list.innerHTML = recipes.map(cardHtml).join("");
  renderSummary();
}
render();