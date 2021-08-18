const express = require('express');
const User = require('../modules/user');
const router = new express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');

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

router.post('/users/me', auth, async (req, res) => {
  try {
    const {
      _doc: { age, email, name },
    } = req.user;

    res.send({ age, email, name });
  } catch (e) {
    res.status(404).send({ message: 'Please authenticate', access: false });
  }
});

router.post('/users/send', (req, res) => {
  const arrayOfFriends = [];
  Object.keys(req.body).forEach((item) => {
    arrayOfFriends.push({ [item]: req.body[item] });
  });
  console.log(qwe);
  res.send();
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
