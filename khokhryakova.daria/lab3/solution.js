export function findEquilibriumIndex(arr) {
  let totalSum = 0;
  for (const num of arr) {
    totalSum += num;
  }

  let leftSum = 0;
  for (let i = 0; i < arr.length; i++) {
    const rightSum = totalSum - leftSum - arr[i];

    if (leftSum === rightSum) {
      return i;
    }

    leftSum += arr[i];
  }
  return -1;
}
