export class ClothingItem {
  constructor(id, name, size, colors = []) {
    this.id = id;
    this.name = name;
    this.size = size;
    this.colors = [...colors];
  }

  get colorsCount() {
    return this.colors.length;
  }

  addColor(color) {
    if (!this.colors.includes(color)) {
      this.colors.push(color);
    }
  }

  removeColor(color) {
    this.colors = this.colors.filter((c) => c !== color);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      size: this.size,
      colors: this.colors,
    };
  }
}

export function groupItemsBySize(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.size;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  }
  return map;
}

export function getUniqueColors(items) {
  const all = items.flatMap((item) => item.colors);
  return [...new Set(all)];
}

export function findItemsByColor(items, color) {
  return items.filter((item) => item.colors.includes(color));
}

export function groupItemsByColorCount(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.colorsCount;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  }
  return map;
}

export function findItemsAboveColorCount(items, n) {
  return items.filter((item) => item.colorsCount > n);
}
