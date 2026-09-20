export function isIsogram(str) {
  const lowerCaseString = str.toLowerCase();
  const onlyLetters = lowerCaseString.replace(/[^a-zа-яё]/g, '');
  const uniqueLetters = new Set();
  for (const letter of onlyLetters) {
    if (uniqueLetters.has(letter)) {
      return false;
    }
    uniqueLetters.add(letter);
  }
  return true;
}
