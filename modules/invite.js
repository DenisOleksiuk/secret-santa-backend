const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  recipient: {
    type: String,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length !== 10) {
        throw new Error('The password length less then 10 characters');
      }
    },
  },
});

const Invite = mongoose.model('Invite', inviteSchema);

module.exports = Invite;
