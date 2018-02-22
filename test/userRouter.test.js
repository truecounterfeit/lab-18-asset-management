'use strict';

// requires setup
require('./lib/setup.js');
// require('./lib/setup.mock.aws.js')

// require npm
const superagent = require('superagent');
// app modules
const server = require('../lib/server.js');
const accountMock = require('./lib/accountMock.js');
const userMock = require('./lib/userMock.js');
// test globals
const apiURL = `http://localhost:${process.env.PORT}`;
// tests

describe('/samples', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(userMock.remove);
  afterEach(accountMock.remove);

  test('POST /sample-user  200', () => {
    let tempAccountMock;
    return accountMock.create()
      .then(accountMock => {
        tempAccountMock = accountMock;
        return superagent.post(`${apiURL}/sample-user`)
          .set('Authorization', `Bearer ${accountMock.token}`)
          .field('title', 'dunk says booyea')
          .attach('sample-user', `${__dirname}/asset/booyeah.m4a`)
          .then(res => {
            expect(res.status).toEqual(200);
            expect(res.body.title).toEqual('dunk says booyea');
            expect(res.body._id).toBeTruthy();
            expect(res.body.url).toBeTruthy();
            expect(res.body.account).toEqual(tempAccountMock.account._id.toString());
          });

      });
  });
});
