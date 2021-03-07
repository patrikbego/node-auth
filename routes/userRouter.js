const express = require('express');
const utils = require('../src/utils');
const tokenService = require('../src/service/tokenService');
const userService = require('../src/service/userService');

const userRouter = express.Router();

userRouter.get('/getUser', async (req, res) => {
  // const token = utils.extractTokenFromHeaders(req.headers);
  // const resObject = await utils.requestWrapper(userService.getUser, { phone: token.phone },
  //   req.headers, tokenService.isRequestTokenValid, true);
  // res.status(resObject.code).json(resObject.clientData);

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
