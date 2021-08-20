const express = require('express');
const generator = require('generate-password');
const User = require('../modules/user');
const router = new express.Router();
const auth = require('../middlewares/auth');
const { sendEmail } = require('../emails/account');

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

// In work
router.post('/users/send', (req, res) => {
  console.log(req.body);
  // sendEmail('denisolexyuk@gmail.com', 'Denis', 'http://localhost:3001', 'password123');

  res.send();
});

// In work
router.post('/users/invite', (req, res) => {
  try {
    const pass = req.header('Authorization').replace('Basic ', '');
    const decoded = new Buffer.from(pass, 'base64').toString().slice(1);
    console.log(decoded);
    const data = Math.random() > 0.5 ? 'Den' : 'Johnny';
    res.send(data);
  } catch (error) {
    res.status(404).send({ error: error.message });
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
