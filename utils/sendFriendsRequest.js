const generator = require('generate-password');

function shiftNames(friends, shift) {
  return friends.map((friend, i) => {
    let shiftedIndex = i - shift + friends.length;
    if (shiftedIndex >= friends.length) {
      shiftedIndex -= friends.length;
    }
    return {
      ...friend,
      name: friends[shiftedIndex].name,
    };
  });
}

function generateRandomShift(lengthOfArray) {
  const shift = Math.floor(Math.random() * lengthOfArray + 1);
  if (shift === lengthOfArray) {
    return generateRandomShift(shift);
  }
  return shift;
}

function generateUniquePasswords(numOfPasswords, invites) {
  const passwords = generator.generateMultiple(numOfPasswords, {
    numbers: true,
  });
  return invites.find(({ password }) => passwords.includes(password))
    ? generateUniquePasswords(numOfPasswords, invites)
    : passwords;
}

module.exports = {
  generateRandomShift,
  shiftNames,
  generateUniquePasswords,
};
