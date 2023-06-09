// import {} from 'knex';
// import db from './connectors/db';
const path = require('path');
const express = require('express');
const app = express();
const authMiddleware = require('./middleware/auth');
const privateApiRoutes = require('./routes/private/api');

const publicApiRoutes = require('./routes/public/api');
const publicViewRoutes = require('./routes/public/view');
const privateViewRoutes = require('./routes/private/view');

// view engine setup 
app.set('views', path.join(__dirname, 'views')); //it looks through views for he html file
app.set('view engine', 'hjs');
// Config setup to allow our HTTP server to serve static files from our public directory
app.use(express.static('public')); //so any one can access public
// Config setup to parse JSON payloads from HTTP POST request body
app.use(express.json());
app.use(express.urlencoded({extended:true})); //so it can read any non-json file

// All public routes can be accessible without authentication

// uncomment to view frontend
publicViewRoutes(app);
publicApiRoutes(app);// uncomment

// If the request is not for a public view/api, then it must pass
// through our authentication middleware first
 app.use(authMiddleware); // uncomment

// The routes/views below can only be accessed if the user is authenticated

// uncomment to view frontend
privateViewRoutes(app);
privateApiRoutes(app);

// If request doesn't match any of the above routes then render the 404 page
app.use(function(req, res, next) {
  return res.status(404).render('404');
});

app.listen(3000);
