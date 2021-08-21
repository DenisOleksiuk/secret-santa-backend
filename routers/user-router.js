const express = require('express');
const User = require('../modules/user');
const auth = require('../middlewares/auth');
const { sendEmail } = require('../emails/account');
const Invite = require('../modules/invite');
const {
  generateRandomShift,
  shiftNames,
  generateUniquePasswords,
} = require('../utils/sendFriendsRequest');

const router = new express.Router();

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/users/me', auth, async (req, res) => {
  try {
    const {
      _doc: { age, email, name },
    } = req.user;

    res.send({ age, email, name });
  } catch (e) {
    res.status(401).send({ message: 'Please authenticate', access: false });
  }
});

router.post('/users/send', async (req, res) => {
  const arrayOfFriends = req.body;
  const shift = generateRandomShift(arrayOfFriends.length);
  const ShiftedArray = shiftNames(arrayOfFriends, shift);
  const invites = await Invite.find({});
  const passwords = generateUniquePasswords(arrayOfFriends.length, invites);
  ShiftedArray.forEach((friend, i) => (friend.password = passwords[i]));
  const inviteLink = 'https://jolly-ride-55b681.netlify.app/invite';

  for (let i = 0; i < ShiftedArray.length; i++) {
    const friend = ShiftedArray[i];
    await sendEmail(friend.email, inviteLink, friend.password);
    await new Invite({ name: friend.name, password: friend.password }).save();
  }
  res.send();
});

router.post('/users/invite', async (req, res) => {
  try {
    const pass = req.header('Authorization').replace('Basic ', '');
    const decodedPass = new Buffer.from(pass, 'base64').toString().slice(1);
    const invite = await Invite.findOne({ password: decodedPass });
    if (invite) {
      res.send(invite.name);
    } else {
      throw new Error('new error');
    }
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
