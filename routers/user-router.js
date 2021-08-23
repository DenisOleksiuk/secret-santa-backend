const express = require('express');
const User = require('../modules/user');
const Invite = require('../modules/invite');
const auth = require('../middlewares/auth');
const sendEmail = require('../emails/account');
const basicAuth = require('../middlewares/basicAuth');
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
      _doc: { email, name, _id },
    } = req.user;

    res.send({ email, name, _id });
  } catch (e) {
    res.status(401).send({ message: 'Please authenticate', access: false });
  }
});

router.post('/users/wish', async (req, res) => {
  const user = req.body;
  const owner = await User.findById(user.user._id);
  owner.wishes.push(user.wishes);
  await owner.save();
  res.send();
});

router.post('/users/send', async (req, res) => {
  const arrayOfFriends = req.body;
  const shift = generateRandomShift(arrayOfFriends.length);
  const shiftedArray = shiftNames(arrayOfFriends, shift);
  const passwords = await generateUniquePasswords(arrayOfFriends.length);
  shiftedArray.map((friend, i) => {
    friend.password = passwords[i];
    friend.friendsEmails = [];
  });

  for (let i = 0; i < shiftedArray.length; i++) {
    const friend = shiftedArray[i];
    for (const user of shiftedArray) {
      if (friend.email !== user.email) {
        friend.friendsEmails.push(user.email);
      }
    }
    await sendEmail(friend.email, process.env.INVITE_LINK, friend.password);
    await new Invite(friend).save();
  }
  res.send();
});

router.post('/users/invite', basicAuth, async (req, res) => {
  try {
    const users = await User.find({ email: { $in: req.invite.friendsEmails } });
    const wishList = users.map((user) => ({ wishes: user.wishes, name: user.name }));
    if (req.invite) {
      res.send({ wishList, youAreSantaFor: req.invite.name });
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
