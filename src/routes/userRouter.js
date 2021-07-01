const express = require('express');
const { body } = require('express-validator');
const { check } = require('express-validator');
const utils = require('../utils');
const tokenService = require('../service/tokenService');
const userService = require('../service/userService');

const userRouter = express.Router();

userRouter.get('/getUser',
  async (req, res) => {
    const resObject = await utils.newRequestWrapper(userService.getUser, req, req.headers,
      tokenService.isRequestTokenValid, true);
    res.status(resObject.code).json(resObject.clientData);
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
