'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const Page = require('../models/page');
const $H = require('../lib/handlebars.min-latest')

const router = createRouter();
module.exports = router;

router.get('/', function (req, res) {
  res.view('homepage/index.html', {test: "Worldy"}, 'main');
})