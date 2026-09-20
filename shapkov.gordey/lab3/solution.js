export function removeDuplicates(arr) {
  const result = [];

  for (const item of arr) {
    if (!result.includes(item)) {
      result.push(item);
    }
  }

  return result;
}
