export function difference(arr1, arr2) {
  // Преобразуем второй массив в Set для быстрого поиска O(1)
  const set2 = new Set(arr2);

  // Фильтруем первый массив, оставляя только те элементы, которых нет во втором
  return arr1.filter((item) => !set2.has(item));
}
