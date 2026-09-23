export function isPerfectNumber(num) {
  if (num <= 0 || !Number.isInteger(num)) {
    return false;
  }

  let sum = 0;

  for (let i = 1; i < num; i++) {
    if (num % i === 0) {
      sum += i;
    }
  }

  return sum === num;
}
