const generator = require('generate-password');
const Invite = require('../modules/invite');

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

async function generateUniquePasswords(numOfPasswords) {
  const passwords = generator.generateMultiple(numOfPasswords, {
    numbers: true,
  });
  const invites = await Invite.find({ password: { $in: passwords } });
  return invites.length ? generateUniquePasswords(numOfPasswords) : passwords;
}

module.exports = {
  generateRandomShift,
  shiftNames,
  generateUniquePasswords,
};
