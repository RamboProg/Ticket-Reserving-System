const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");
const { getSessionToken } = require('../../utils/session')
const getUser = async function (req) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return res.status(301).redirect("/");
  }
  console.log("hi", sessionToken);
  const user = await db
    .select("*")
    .from("se_project.sessions")
    .where("token", sessionToken)
    .innerJoin(
      "se_project.users",
      "se_project.sessions.userid",
      "se_project.users.id"
    )
    .innerJoin(
      "se_project.roles",
      "se_project.users.roleid",
      "se_project.roles.id"
    )
    .first();

  console.log("user =>", user);
  user.isNormal = user.roleid === roles.user;
  user.isAdmin = user.roleid === roles.admin;
  user.isSenior = user.roleid === roles.senior;
  console.log("user =>", user)
  return user;
};

module.exports = function (app) {
  // example
  app.get("/users", async function (req, res) {
    try {
      const user = await getUser(req);
      const users = await db.select('*').from("se_project.users")
      //Rambo's Tasks------------------------------------------------------------------------------------------------------------------------------

      //POST for tickets new subscription

      // fetch el tickets then decrement from sub and insert to table tickets, then create upcoming ride and use origin and destination to do so 
      app.post('/api/v1/tickets/purchase/subscription', async (req, res) => {
        try {

          const { subID, origin, destination, tripDate } = req.body;
          console.log(req.body);
          let newSub = {
            subID,
            origin,
            destination,
            tripDate
          };
          const addedSub = await db('se_project.subsription').insert(newSub).returning('*');
          const nooftickets = await db('se_project.subsription').where({ subID }).select('noOfTickets') - 1;
          //Create upcoming ride
          const newRide = {
            origin,
            destination,
            tripDate
          };
          const addedRide = await db('se_project.rides').insert(newRide).returning('*');

          console.log(addedSub);
          return res.status(200).json(addedSub);
        } catch (e) {
          console.log("error in tickets purchase subscription");
        }
      });

      //POST for prices
      app.post('/api/v1/tickets/price/:originId&:destinationId', async (req, res) => {
        try {
          const { originId, destinationId } = req.params;
          console.log(req.params);
          const price = await db('se_project.zones').where({ originId, destinationId }).select('price');
          console.log(price);
          return res.status(200).json(price);

        } catch (e) {
          console.log("error in tickets price");
        }
      });

      //POST for rides

      //POST for request refunds
      app.post('/api/v1/refund/:ticketId', async (req, res) => {
        try {

          const { ticketId } = req.params;
          console.log(req.params);
          const refund = await db('se_project.tickets').where({ ticketId }).update({ status: "Refunded" });
          console.log(refund);
          return res.status(200).json(refund);
        } catch (e) {
          console.log("error in refund");
        }
      });

      //POST for request senior
      app.post('/api/v1/senior/request', async (req, res) => {
        try {
          const { nationalId } = req.body;
          console.log(req.body);
          const senior = await db('se_project.senior_requests').where(nationalId, getUser() ).select('*');
          console.log(senior);
          return res.status(200).json(senior);
        } catch (e) {
          console.log("error in senior request");
        }
      });

      //PUT for rides simulation
      app.put('/api/v1/ride/simulate', async (req, res) => {
        try{
          const { origin, destination, tripDate } = req.body;
          const { rideID } = req.params;
          const simulatedRide = await db('se_project.rides').where("id", getUser()).returning('*');
          return res.status(200).json(simulatedRide);
        }catch (e) {
          console.log("error in ride simulation");
        }
      });

      return res.status(200).json(users);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Could not get users");
    }

  });


  // If request doesn't match any of the above routes then render the 404 page
  app.use(function (req, res, next) {
    return res.status(404).render('404');
  });




};
