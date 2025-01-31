function shuffleString(inputString) {
  // Convert the string into an array of characters
  const characters = inputString.split('');

  // Shuffle the array using the Fisher-Yates algorithm
  for (let i = characters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
    [characters[i], characters[j]] = [characters[j], characters[i]]; // Swap elements
  }

  // Join the shuffled array back into a string
  return characters.join('');
}
console.log(shuffleString(process.argv[2]));
