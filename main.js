'use strict';
global.__ROOT = require('path').dirname(__filename);
//middleware
module.context.use(require('./lib/middleware-template'));

module.context.use('/', require('./routes/homepage'), 'home');
module.context.use('/users', require('./routes/users'), 'users');
module.context.use('/pages', require('./routes/pages'), 'pages');
