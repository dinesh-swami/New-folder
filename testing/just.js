function countChar(str) {
  const count = {};

  for (const char of str) {
    count[char] = (count[char] || 0) + 1;
  }

  let maxChar = "";
  let maxCount = 0;

  for (const char in count) {
    if (count[char] > maxCount) {
      maxCount = count[char];
      maxChar = char;
    }
  }
 console.log(count);
  return maxChar;

}

console.log(countChar("diinnesh")); // a
