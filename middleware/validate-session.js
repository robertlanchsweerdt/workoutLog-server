const jwt = require('jsonwebtoken');
const { UserModel } = require('../models');

const validateSession = async (req, res, next) => {
  // pre-flight request with pinging server
  if (req.method === 'OPTIONS') {
    next();
    // begin PRE-FLIGHT ELSE IF
  } else if (req.headers.authorization) {
    const { authorization } = req.headers;
    console.log('Authorization -->', authorization);

    // verify is de-coding
    const payload = authorization
      ? jwt.verify(
          authorization.includes('Bearer')
            ? authorization.split(' ')[1]
            : authorization,
          process.env.JWT_SECRET
        )
      : undefined;

    console.log('Payload -->', payload);

    // begin PAYLOAD if statement
    if (payload) {
      const foundUser = await UserModel.findOne({
        where: {
          id: payload.id,
        },
      });

      // begin FOUND USER if statement
      if (foundUser) {
        req.user = foundUser;
        next();
        // if FOUND USER not found
      } else {
        res.status(400).send({
          message: 'Not Authorized',
        });
      }
      // end FOUND USER

      // if PAYLOAD false
    } else {
      res.status(401).send({
        message: 'Invalid token',
      });
    }
    // end PAYLOAD
  } else {
    // user did not provide token authorization
    res.status(403).send({
      message: 'Forbidden',
    });
  }
  // end PRE-FLIGHT
};

module.exports = validateSession;
