import {} from 'knex';
import db from './connectors/db';
const path = require('path');
const express = require('express');
const app = express();
const authMiddleware = require('./middleware/auth');
const privateApiRoutes = require('./routes/private/api');

const publicApiRoutes = require('./routes/public/api');
const publicViewRoutes = require('./routes/public/view');
const privateViewRoutes = require('./routes/private/view');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
// Config setup to allow our HTTP server to serve static files from our public directory
app.use(express.static('public'));
// Config setup to parse JSON payloads from HTTP POST request body
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// All public routes can be accessible without authentication

// uncomment to view frontend
// publicViewRoutes(app);
publicApiRoutes(app);// uncomment

// If the request is not for a public view/api, then it must pass
// through our authentication middleware first
 app.use(authMiddleware); // uncomment

// The routes/views below can only be accessed if the user is authenticated

// uncomment to view frontend
// privateViewRoutes(app);
privateApiRoutes(app);


//Rambo's Tasks------------------------------------------------------------------------------------------------------------------------------
//POST for tickets new subscription
app.post('/api/v1/tickets/purchase/subscription',async (req, res) => {
  const{subID, origin, destination, tripDate} = req.body;
  console.log(req.body);
  let newSub = {
    subID,
    origin,
    destination,
    tripDate
  };
  const addedSub = await db('subscriptions').insert(newSub).returning('*');
  console.log(addedSub);
  return res.status(200).json(addedSub);
});

//POST for prices
app.post('/api/v1/tickets/price/:originId&:destinationId',async (req, res) => {
  const{originId, destinationId} = req.params;
  console.log(req.params);
  const price = await db('prices').where({originId, destinationId}).select('price');
  console.log(price);
  return res.status(200).json(price);
});

//POST for rides

//POST for request refunds
app.post('/api/v1/refund/:ticketId',async (req, res) => {
  const{ticketId} = req.params;
  console.log(req.params);
  const refund = await db('tickets').where({ticketId}).update({status: "Refunded"});
  console.log(refund);
  return res.status(200).json(refund);
});

//POST for request senior
app.post('/api/v1/senior/request',async (req, res) => {
  const{nationalId} = req.body;
  console.log(req.body);
  const senior = await db('seniors').where({nationalId}).select('*');
  console.log(senior);
  return res.status(200).json(senior);
});

//PUT for rides simulation
app.put('/api/v1/ride/simulate',async (req, res) => {
  const{origin, destination, tripDate} = req.body;
  const{rideID} = req.params;
  const simulatedRide = await db('rides').where("id", rideID).returning('*');
  return res.status(200).json(simulatedRide);
});

// If request doesn't match any of the above routes then render the 404 page
app.use(function(req, res, next) {
  return res.status(404).render('404');
});

app.listen(3000);