const express = require('express');
const passport = require('passport');
const utils = require('../utils');
const tokenService = require('../service/tokenService');
const userService = require('../service/userService');

const userRouter = express.Router();

userRouter.get('/getUser', passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    res.status(200);
  });

userRouter.put('/updateUser', async (req, res) => {
  const resObject = await utils.requestWrapper(userService.updateUser, req.body, req.headers,
    tokenService.isRequestTokenValid, true);
  res.status(resObject.code).json(resObject.clientData);
});

userRouter.delete('/deleteUser', async (req, res) => {
  const resObject = await utils.requestWrapper(userService.deleteUser, req.body, req.headers,
    tokenService.isRequestTokenValid, true);
  res.status(resObject.code).json(resObject.clientData);
});

module.exports = userRouter;
