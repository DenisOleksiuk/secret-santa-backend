const express = require('express');
const User = require('../modules/user');
const auth = require('../middlewares/auth');
const sendEmail = require('../emails/account');
const basicAuth = require('../middlewares/basicAuth');
const {
  generateRandomShift,
  randomize,
  generateUniquePasswords,
} = require('../utils/sendFriendsRequest');

const router = new express.Router();

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/users/me', auth, async (req, res) => {
  try {
    const {
      _doc: { email, name, _id, friendsFormWasSubmitted, receiver, wishes },
    } = req.user;

    res.send({ email, name, _id, friendsFormWasSubmitted, receiver, wishes });
  } catch (e) {
    res.status(401).send({ message: 'Please authenticate', access: false });
  }
});

router.get('/users/receiver/:id', async (req, res) => {
  const receiver = await User.findOne({ email: req.params.id });
  res.send(receiver.wishes);
});

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

router.post('/users/add/wish', async (req, res) => {
  try {
    const owner = await User.findById(req.body.user._id);

    if (owner.wishes.length >= 5) {
      throw new Error('The number of desires has reached its maximum');
    }

    owner.wishes = [...owner.wishes, { wish: req.body.wish }];
    await owner.save();
    res.send(owner);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/users/delete/wish/:id', async (req, res) => {
  try {
    req.body.wishes = req.body.wishes.filter((wish) => wish._id !== req.params.id);
    const user = await User.findByIdAndUpdate(req.body._id, req.body, { new: true });
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/users/send', async (req, res) => {
  const arrayOfFriends = req.body;
  const shift = generateRandomShift(arrayOfFriends.length);
  const randomizedFriends = randomize(arrayOfFriends, shift);
  const passwords = await generateUniquePasswords(arrayOfFriends.length);
  const owner = randomizedFriends.find((person) => person.owner);

  for (let i = 0; i < randomizedFriends.length; i++) {
    if (!randomizedFriends[i].owner) {
      randomizedFriends[i].password = passwords[i];
    }
  }

  try {
    for (let i = 0; i < randomizedFriends.length; i++) {
      const friend = randomizedFriends[i];
      if (friend.owner) {
        await User.findByIdAndUpdate(owner._id, owner);
      } else {
        friend.friendsFormWasSubmitted = true;
        await new User(friend).save();
      }
      await sendEmail(process.env.INVITE_LINK, friend, owner);
    }

    res.send(owner);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch('/users/send', async (req, res) => {
  try {
    const user = await User.findById(req.body._id);
    user.friendsFormWasSubmitted = true;
    await user.save();
    res.send({ ...req.body, friendsFormWasSubmitted: user.friendsFormWasSubmitted });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/users/invite', basicAuth, async (req, res) => {
  try {
    const friend = await User.findOne({ email: req.invite.recipient });
    if (req.invite) {
      const wishesOfFriend = friend ? friend.wishes : [];
      res.send({ wishList: wishesOfFriend, youAreSantaFor: req.invite.name });
    } else {
      throw new Error('Not found');
    }
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
});

module.exports = router;
