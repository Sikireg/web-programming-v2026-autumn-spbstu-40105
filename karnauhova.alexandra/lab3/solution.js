export function intersection(arr1, arr2) {
  const set2 = new Set(arr2);
  const resultSet = new Set();

  for (const item of arr1) {
    if (set2.has(item)) {
      resultSet.add(item);
    }
  }

  return Array.from(resultSet);
}
