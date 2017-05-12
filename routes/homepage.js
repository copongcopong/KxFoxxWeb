'use strict';
//const httpError = require('http-errors');
//const status = require('statuses');
//const errors = require('@arangodb').errors;

const createRouter = require('@arangodb/foxx/router');
const router = createRouter();
module.exports = router;
const $blog = module.context.collection('blog');

router.get('/', function (req, res) {
  try {
    res.view('homepage-blogposts', {posts: $blog.byExample({}).toArray() }, 'main');
  } catch (e) {
    //on error, use local file instead
    res.view('homepage/index.html', {text: "Worldy"}, 'main');
  }
  
})