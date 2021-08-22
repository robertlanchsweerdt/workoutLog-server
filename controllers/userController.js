const express = require('express');
const router = express.Router();
const { UserModel } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize');

/*
=========================
   REGISTER USER
=========================
*/

router.post('/register', async (req, res) => {
  const { username, passwordhash } = req.body;

  try {
    // new user created inside User table
    const newUser = await UserModel.create({
      username,
      passwordhash: bcrypt.hashSync(passwordhash, 13),
    });
    // create token
    const token = jwt.sign(
      {
        id: newUser.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 60 * 60 * 24,
      }
    );

    res.status(200).json({
      message: 'New user registered',
      user: newUser,
      token,
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      res.status(409).json({
        message: 'Username already in use',
      });
    } else {
      res.status(500).json({
        message: 'Unable to register user',
        error: err,
      });
    }
  }
});

/*
=========================
   LOGIN USER
=========================
*/

router.post('/login', async (req, res) => {
  const { username, passwordhash } = req.body;

  try {
    //find username in table
    const loginUser = await UserModel.findOne({
      where: {
        username,
      },
    });

    // does user password match password stored in table
    if (loginUser) {
      const passwordComparison = await bcrypt.compare(
        passwordhash,
        loginUser.passwordhash
      );

      // if passwordComparison is true then create token
      if (passwordComparison) {
        const token = jwt.sign(
          {
            id: loginUser.id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: 60 * 60 * 24,
          }
        );
        res.status(200).json({
          user: loginUser,
          message: 'User successfully loged in',
          token,
        });
        // if passwordComparison is false then give 401 error
      } else {
        res.status(401).json({
          message: 'Your username or password is incorrect',
        });
      }
      // if loginUser is false then give 401 error
    } else {
      res.status(401).json({
        message: 'Your username or password is incorrect',
      });
    }
  } catch (err) {
    res.status(500).json({
      message: 'Server error logging in user',
    });
  }
});

module.exports = router;
