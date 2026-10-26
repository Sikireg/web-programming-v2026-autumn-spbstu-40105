export class Recipe {
  constructor(title, ingredients = [], steps = []) {
    this.title = title;
    this.ingredients = ingredients;
    this.steps = steps;
  }

  addIngredient(ingredient) {
    if (ingredient && !this.ingredients.includes(ingredient)) {
      this.ingredients.push(ingredient);
    }
  }

  removeIngredient(ingredient) {
    this.ingredients = this.ingredients.filter(ing => ing !== ingredient);
  }

  addStep(step) {
    if (step) {
      this.steps.push(step);
    }
  }

  removeStep(step) {
    this.steps = this.steps.filter(s => s !== step);
  }

  get ingredientCount() {
    return this.ingredients.length;
  }
}

export function groupRecipesByIngredientCount(recipes) {
  return recipes.reduce((acc, recipe) => {
    const count = recipe.ingredientCount;
    if (!acc[count]) {
      acc[count] = [];
    }
    acc[count].push(recipe);
    return acc;
  }, {});
}

export function getUniqueIngredients(recipes) {
  const uniqueSet = new Set();
  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ing => uniqueSet.add(ing));
  });
  return Array.from(uniqueSet);
}

export function getRecipesByIngredient(recipes, ingredient) {
  return recipes.filter(recipe => recipe.ingredients.includes(ingredient));
}

export function groupRecipesByStepCount(recipes) {
  return recipes.reduce((acc, recipe) => {
    const count = recipe.steps.length;
    if (!acc[count]) {
      acc[count] = [];
    }
    acc[count].push(recipe);
    return acc;
  }, {});
}

export function getAllRecipeTitles(recipes) {
  return recipes.map(recipe => recipe.title);
}