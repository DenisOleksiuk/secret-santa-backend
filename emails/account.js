const nodemailer = require('nodemailer');

//   let info = await transporter.sendMail({
//     from: '"Fred Foo 👻" <foo@example.com>', // sender address
//     to: 'bar@example.com, baz@example.com', // list of receivers
//     subject: 'Hello ✔', // Subject line
//     text: 'Hello world?', // plain text body
//     html: '<b>Hello world?</b>', // html body
//   });

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async (email, name, link, password) => {
  try {
    const res = await transporter.sendMail({
      from: '"Fred Foo 👻" denisolexyuk@gmail.com',
      to: email,
      subject: 'Sending Email using Node.js',
      html: `
        <b>Take your password! ${name} => ${password}</b>
        <hr />
        <a href="${link}">Let's Go!</a>
      `,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendEmail,
};
