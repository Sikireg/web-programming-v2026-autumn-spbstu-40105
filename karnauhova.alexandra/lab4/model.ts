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
}