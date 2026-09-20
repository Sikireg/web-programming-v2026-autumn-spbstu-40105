export function zipArrays(...arrays) {
  const result = [];

  for (let i = 0; i < arrays[0].length; i++) {
    const group = [];
    for (const arr of arrays) {
      group.push(arr[i]);
    }
    result.push(group);
  }

  return result;
}
