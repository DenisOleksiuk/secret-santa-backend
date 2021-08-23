const Invite = require('../modules/invite');

const basicAuth = async (req, res, next) => {
  try {
    const pass = req.header('Authorization').replace('Basic ', '');
    const decodedPass = new Buffer.from(pass, 'base64').toString().slice(1);
    const invite = await Invite.findOne({ password: decodedPass });
    if (!invite) {
      throw new Error('No one invite found');
    }
    req.invite = invite;
    next();
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
};

module.exports = basicAuth;
