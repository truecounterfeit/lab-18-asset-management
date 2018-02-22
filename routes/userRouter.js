'use strict';

const {Router} = require('express');
const multer = require('multer');
const httpErrors = require('http-errors');
const s3 = require('../lib/s3.js');
const User = require('../model/user.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const upload = multer({dest: `${__dirname}/../temp`});

module.exports = new Router()
  .post('/samples', bearerAuth, upload.any(), (req, res, next) => {
  // req.body and req.files
    if(!req.account)
      return next(httpErrors(401, '__REQUEST_ERROR__ no account found'));
    if(!req.body.title || req.files.length > 1 || req.files[0].fieldname !== 'sample')
      return next(httpErrors(400, '__REQUEST_ERROR__ title or sample was not provided'));

    let file = req.files[0];
    console.log(file);

    let key = `${file.filename}.${file.originalname}`;
    return s3.upload(file.path, key)
      .then(url => {
        console.log('url', url);
        return new User({
          title: req.body.title,
          account: req.account._id,
          url,
        }).save();
      })
      .then(user => res.json(user))
      .catch(next);
  });
