const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async (link, friend, owner) => {
  try {
    if (friend.owner) {
      await transporter.sendMail({
        from: `${owner.name} 👻 ${owner.email}`,
        to: owner.email,
        subject: 'Sending Email using Node.js',
        html: `<a href="${link}">This is your invite link!</a>`,
      });
    } else {
      await transporter.sendMail({
        from: `${owner.name} 👻 ${owner.email}`,
        to: friend.email,
        subject: 'Sending Email using Node.js',
        html: `
        <b>Take your password! ${friend.password}</b>
        <hr />
        <a href="${link}">This is your invite link!</a>
      `,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendEmail;
