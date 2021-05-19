const express = require('express');
const passport = require('passport');
const utils = require('../utils');
const blogService = require('../service/blogService');
const tokenService = require('../service/tokenService');

const blogRouter = express.Router();

blogRouter.get('/getBlog/:id',
  async (req, res) => {
    const resObject = await utils.requestWrapper(blogService.readById, req.params, req.headers,
      tokenService.isRequestTokenValid, false);
    res.status(resObject.code).json(resObject.clientData);
  });

blogRouter.get('/getBlogs',
  async (req, res) => {
    const resObject = await utils.requestWrapper(blogService.read, req.body, req.headers,
      tokenService.isRequestTokenValid, true);
    res.status(resObject.code).json(resObject.clientData);
  });

blogRouter.get('/getAllBlogs',
  async (req, res) => {
    const resObject = await utils.requestWrapper(blogService.read, req.body, req.headers,
      tokenService.isRequestTokenValid, false);
    res.status(resObject.code).json(resObject.clientData);
  });

blogRouter.put('/updateBlog', async (req, res) => {
  const resObject = await utils.requestWrapper(blogService.update, req.body, req.headers,
    tokenService.isRequestTokenValid, true);
  res.status(resObject.code).json(resObject.clientData);
});

blogRouter.post('/createBlog', async (req, res) => {
  const resObject = await utils.requestWrapper(blogService.create, req.body, req.headers,
    tokenService.isRequestTokenValid, true);
  res.status(resObject.code).json(resObject.clientData);
});

blogRouter.delete('/deleteBlog', async (req, res) => {
  const resObject = await utils.requestWrapper(blogService.delete, req.body, req.headers,
    tokenService.isRequestTokenValid, true);
  res.status(resObject.code).json(resObject.clientData);
});

module.exports = blogRouter;
