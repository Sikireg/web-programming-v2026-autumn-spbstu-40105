export function toBinary(num) {
  if (typeof num !== 'number' || !Number.isInteger(num)) {
    throw new TypeError('Arg must be an integer');
  }

  if (num === 0) {
    return '0';
  }

  let integ = Math.abs(num);
  let result = '';

  while (integ > 0) {
    result = (integ % 2) + result;
    integ = Math.floor(integ / 2);
  }

  return num < 0 ? `-${result}` : result;
}
