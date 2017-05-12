'use strict';
//const httpError = require('http-errors');
//const status = require('statuses');
//const errors = require('@arangodb').errors;

const createRouter = require('@arangodb/foxx/router');
const router = createRouter();
module.exports = router;

router.get('/', function (req, res) {
  try {
    res.view('homepage-index', {text: " [Text from data set in homepage route]"}, 'main');
  } catch (e) {
    //on error, use local file instead
    res.view('homepage/index.html', {text: "Worldy"}, 'main');
  }
  
})