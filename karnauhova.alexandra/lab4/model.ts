export class Recipe {
    readonly id: string;
    title: string;
    ingredients: string[];
    steps: string[];

    constructor(
        title: string,
        ingredients: string[] = [],
        steps: string[] = [],
        id?: string,
    ) {
        this.title = title;
        this.ingredients = [...ingredients];
        this.steps = [...steps];
        this.id = id ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }

    addIngredient(ingredient: string): void {
        this.ingredients.push(ingredient);
    }

    removeIngredient(ingredient: string): void {
        const i = this.ingredients.indexOf(ingredient);
        if (i != -1) {
            this.ingredients.slice(i, 1);
        }
    }

    get ingredientCount(): number {
        return this.ingredients.length;
    }

    addStep(step: string): void {
        this.steps.push(step);
    }

    removeStep(index: number): void {
        if (index >= 0 && index < this.steps.length) {
            this.steps.splice(index, 1);
        }
    }

    get stepCount(): number {
        return this.steps.length;
    }
}

export function groupRecipesByIngredientCount(recipes: Recipe[]): Map<number, Recipe[]> {
    const map = new Map<number, Recipe[]>();
    for (const r of recipes) {
        const key = r.ingredientCount
        const group = map.get(key);
        if (group) {
            group.push(r);
        }
        else {
            map.set(key, [r]);
        }
    }
    return map;
}

export function getUniqueIngredients(recipes: Recipe[]): string[] {
    return [...new Set(recipes.flatMap((r) => r.ingredients))];
}

export function findRecipesByIngredient(recipes: Recipe[], ingredient: string): Recipe[] {
    return recipes.filter((r) => r.ingredients.includes(ingredient));
}

export function groupRecipesByStepCount(recipes: Recipe[]): Map<number, Recipe[]> {
    const map = new Map<number, Recipe[]>();
    for (const r of recipes) {
        const key = r.stepCount;
        const group = map.get(key);
        if (group) {
            group.push(r);
        }
        else {
            map.set(key, [r]);
        }
    }
    return map;
}

export function getRecipeTitles(recipes: Recipe[]): string[] {
    return recipes.map((r) => r.title);
}