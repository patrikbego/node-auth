const express = require('express');
const utils = require('../src/utils');
const tokenService = require('../src/service/tokenService');
const itemsService = require('../src/service/itemsService');

const itemRouter = express.Router();

itemRouter.get('/getItems', async (req, res) => {
  const ro = await utils.requestWrapper(itemsService.getItems, req.params, req.headers,
    tokenService.isRequestTokenValid, false);
  res.status(ro.code).json(ro.clientData);
});

module.exports = itemRouter;
