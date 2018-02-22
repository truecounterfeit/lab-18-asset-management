'use strict';

const User = require(__dirname + '/../models/user');
const basicHTTP = require(__dirname + '/../lib/basic-http');
const jsonParser = require('body-parser').json();
const basicAuth = require('../lib/basic-auth-middleware.js');
const httpErrors = require('http-errors');
const Account = require('../model/account.js');
const authRouter = module.exports = require('express').Router();

authRouter.post('/signup', jsonParser, (req, res, next) => {
  const password = req.body.password;
  delete req.body.password;
  (new User(req.body)).generateHash(password)
    .then((user) => {
      user.save()
        .then(user => res.send(user.generateToken))
        .catch(next);
    })
    .catch(next);
});

authRouter.get('/signin', basicHTTP, (req, res, next) => {
  User.findOne({username:  req.auth.username})
    .then(user => {
      if (!user) next ({statusCode: 403, message: 'authoriztion forbidden'});

      user.comparePassword(req.auth.password)
        .then(user => res.send(user.generateToken()))
        .catch(err => next({statusCode: 403, message: 'authoriztion forbidden'}));
    })
    .catch(next);
});

authRouter.post('/signup', jsonParser, (req, res, next) => {
  if(!req.body.username || !req.body.email || !req.body.password)
    return next(httpErrors(400, '__REQUEST_ERROR__ username, email, and password are required'));

  Account.create(req.body)
    .then(user => user.tokenCreate())
    .then(token => res.json({token}))
    .catch(next);
});

authRouter.get('/login', basicAuth, (req, res, next) => {
  if(!req.account)
    return next(httpErrors(401, '__REQUEST_ERROR__ account not found'));
  req.account.tokenCreate()
    .then(token => res.json({token}))
    .catch(next);
});
