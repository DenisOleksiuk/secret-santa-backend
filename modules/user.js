const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generalTypes = {
  type: String,
  trim: true,
};

const userSchema = new mongoose.Schema(
  {
    name: {
      ...generalTypes,
    },
    email: {
      ...generalTypes,
      unique: true,
      lowercase: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
    },
    password: {
      ...generalTypes,
      required: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('The password must not includes "password" word');
        }
      },
    },
    wishes: [
      {
        wish: {
          ...generalTypes,
        },
      },
    ],
    receiver: {
      email: {
        ...generalTypes,
      },
      name: {
        ...generalTypes,
      },
      wishes: [
        {
          wish: {
            ...generalTypes,
          },
        },
      ],
    },
    friendsFormWasSubmitted: {
      type: Boolean,
      default: false,
    },
    tokens: [
      {
        token: {
          ...generalTypes,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.avatar;
  delete userObject.tokens;

  return userObject;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcryptjs.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Incorrect password');
  }

  return user;
};

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcryptjs.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
