const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");
const {getSessionToken}=require('../../utils/session')
const getUser = async function (req) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return res.status(301).redirect("/");
  }
  console.log("hi",sessionToken);
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
        
      return res.status(200).json(users);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Could not get users");
    }
   
  });
<<<<<<< HEAD
=======
  
 // update the route name in the database
  app.put('/api/v1/route/:routeId', async (req, res) => {
    try {
      const routeId = req.params.se_project.routes.id;
      const routeName = req.body.se_project.routes.routename;
      await db('routes')
        .where({ id: routeId })
        .update({ name: routeName });
      return res.status(200).send('Route updated successfully');
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('An error occurred while updating the route');
    }
  });

// delete the route from the database
  app.delete('/api/v1/route/:routeId', async (req, res) => {
    try {
      const routeId = req.params.se_project.routes.id;
      await db('routes')
        .where({ id: routeId })
        .del();
      return res.status(200).send('Route deleted successfully');
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('An error occurred while deleting the route');
    }
  });

// update the refund request in the database     still got adjust for online payment
  app.put('/api/v1/requests/refunds/:requestId', async (req, res) => {
    try {
      const requestId = req.params.se_project.refund_requests.id;
      const isAccepted = req.body === 'accepted'
      await db('refund_requests')
        .where({ id: requestId })
        .update({ is_accepted: isAccepted });
      return res.status(200).send('Refund request updated successfully');
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('An error occurred while updating the refund request');
    }
  });

// update the senior request in the database
  app.put('/api/v1/requests/senior/:requestId', async (req, res) => {
    try {
      const requestId = req.params.se_project.senior_requests.id;
      const seniorStatus = req.body.se_project.senior_requests.status;
      await db('senior_requests')
        .where({ id: requestId })
        .update({ status: seniorStatus });
      return res.status(200).send('Senior request updated successfully');
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('An error occurred while updating the senior request');
    }
  });

// update the zone price in the database
  app.put('/api/v1/zones/:zoneId', async (req, res) => {
    try {
      const zoneId = req.params.se_project.zones.id;
      const price = req.body.se_project.zones.price;
      await db('zones')
        .where({ id: zoneId })
        .update({ price: price });
      return res.status(200).send('Zone price updated successfully');
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('An error occurred while updating the zone price');
    }
>>>>>>> f8dce78663c09f7f0ee45ea67b0b907f2bff9f02

  // update the route name in the database
  app.put('/api/v1/route/:routeId', async (req, res) => {
    try {
      const routeId = req.params.se_project.routes.id;
      const routeName = req.body.se_project.routes.routename;
      await db('routes')
        .where({ id: routeId })
        .update({ name: routeName });
      return res.status(200).send('Route updated successfully');
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('An error occurred while updating the route');
    }
  });

// delete the route from the database
  app.delete('/api/v1/route/:routeId', async (req, res) => {
    try {
      const routeId = req.params.se_project.routes.id;
      await db('routes')
        .where({ id: routeId })
        .del();
      return res.status(200).send('Route deleted successfully');
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('An error occurred while deleting the route');
    }
  });

// update the refund request in the database     still got adjust for online payment
  app.put('/api/v1/requests/refunds/:requestId', async (req, res) => {
    try {
      const requestId = req.params.se_project.refund_requests.id;
      const isAccepted = req.body === 'accepted'
      await db('refund_requests')
        .where({ id: requestId })
        .update({ is_accepted: isAccepted });
      return res.status(200).send('Refund request updated successfully');
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('An error occurred while updating the refund request');
    }
  });

// update the senior request in the database
  app.put('/api/v1/requests/senior/:requestId', async (req, res) => {
    try {
      const requestId = req.params.se_project.senior_requests.id;
      const seniorStatus = req.body.se_project.senior_requests.status;
      await db('senior_requests')
        .where({ id: requestId })
        .update({ status: seniorStatus });
      return res.status(200).send('Senior request updated successfully');
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('An error occurred while updating the senior request');
    }
  });

// update the zone price in the database
  app.put('/api/v1/zones/:zoneId', async (req, res) => {
    try {
      const zoneId = req.params.se_project.zones.id;
      const price = req.body.se_project.zones.price;
      await db('zones')
        .where({ id: zoneId })
        .update({ price: price });
      return res.status(200).send('Zone price updated successfully');
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('An error occurred while updating the zone price');
    }
  });
};
