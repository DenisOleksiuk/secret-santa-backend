const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async (email, link, password) => {
  try {
    await transporter.sendMail({
      from: '"Fred Foo 👻" denisolexyuk@gmail.com',
      to: email,
      subject: 'Sending Email using Node.js',
      html: `
        <b>Take your password! ${password}</b>
        <hr />
        <a href="${link}">This is your invite link!</a>
      `,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendEmail,
};
