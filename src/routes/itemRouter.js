const express = require('express');
const utils = require('../utils');
const tokenService = require('../service/tokenService');
const itemsService = require('../service/itemsService');

const itemRouter = express.Router();

itemRouter.get('/getItems', async (req, res) => {
  const ro = await utils.requestWrapper(itemsService.getItems, req.params, req.headers,
    tokenService.isRequestTokenValid, false);
  res.status(ro.code).json(ro.clientData);
});

module.exports = itemRouter;
