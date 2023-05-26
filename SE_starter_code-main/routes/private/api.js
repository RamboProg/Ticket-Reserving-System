const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");


const { getSessionToken } = require('../../utils/session')
const getUser = async function (req,res) {
  //not sure abouut this fix because it didnt have res as a parameter
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
  // zaids shit
  app.put("/api/v1/password/reset",async(req,res)=>{
    try{
      console.log("ana ghalat");
      const {newpassword}= req.body;
      const user = await getUser(req);
      const updateUserPassword = await db("se_project.users")
      .where("id",user.id) // is this correct wala la2
      .update({password: newpassword})
      .returning("*");
      return res.status(200).json(updateUserPassword);
    }catch(err){
      console.log("error message", err.message);
      return res.status(400).send("Could not update password");
    }
  });
  
  app.post("/api/v1/station",async(req,res)=>{
    try{
      const{stationName} = req.body;
      let newStation = {
        stationname: stationName,
        stationtype: "Noraml",
        stationposition: null,
        stationstatus: "New",
      };
      const addedStation = await db("se_project.stations").insert(newStation).returning("*");
      console.log(addedStation);
      return res.status(201).json(addedStation);
    }catch(err){
      console.log("error message", err. message);
      return res.status(400).send("Could not create station");
    }
  
  
  });
  app.put("/api/v1/station/:stationId", async(req,res)=>{
    try{
      const {stationName} = req.body;
      const {stationID} = req.params; 
      const updatedStation = await db ("se_project.stations").where("id", stationID).update({stationname:stationName}).returning('*');
      return res.status(200).json(updatedStation);
    }catch(err){
      console.log("Error message", err.message);
      return res.status(404).send("failed to update station")
    }
  
  });

  app.delete("/api/v1/station/:stationId", async(req,res)=>{
    try{
      const {StationId} =req.params;
      
      if(selectedStation.length > 0){
        const  FromStationID = await db ("se_project.routes").where("fromStationid",StationId).returning("*");
        //wa7wa7 was here hehehehehehe
        //not your babe fr fr
        
        
        // continue this later 
        if(selectedStation[0].stationposition =="start"){
          selectedStationStart.toStationid.stationposition = "start";
          
        }else if(selectedStation[0].stationposition=="middle"){
          sele
          
        }else{}
      }
        const deletedStation = await db ("se_project.stations").where("id",StationId).del().returning('*');
        
        console.log("Deleted", deletedStation);
        return res.status(200).json(deletedStation);
        
    }catch(err){
      console.log("Error message ",err.message);
      return res.status(400).send("Failed to deleted station");
    }
  
  
  }); 

  app.post("/api/v1/route", async(req,res)=>{
    try{
    const {newStationID,ConnectedStationId,routeName} =req.params;
    let newRoute =
    {
      routename:routeName,
      fromStationid: ConnectedStationId,
      toStationid : newStationID
    }
    const addedRoute = await db("se_project.routes").insert(newRoute).returning("*");
    console.log(addedRoute);
    return res.status(201).json(newRoute);
  }catch(err){
    console.log("Error message", err.message);
    return res.status(400).send(err.message);
  }


  });
// mariam part 
app.post("/api/v1/payment/subscription",async(req,res)=>{
  try{
    //subscription
    const{purchasedId,creditCardNumber,holderName,payedAmount,subType,zoneId}= req.body;
    const user= await getUser(req);
    let NumberofTickets=0;
    if (subType=="annual"){
      NumberofTickets=100;

    }else if(subType=="quarterly"){
      NumberofTickets=50;
    }else{
      NumberofTickets=10;
    }
    let sub={
      subtype:subType,
      zoneid:zoneId,
      userid:user.id,
      NumberofTickets:NumberofTickets,
    }
    let transaction={
      amount:payedAmount,
      userid:user.id,
      purchasedIid:purchasedId,
    }

    const subscriptionlol=await db("se_project.subsription").insert(sub).returning("*");
    const transactionlol=await db("se_project.transactions").insert(transaction).returning("*");
    console.log(subscriptionlol);
    console.log(transactionlol);
    return res.status(201).json(subscriptionlol)+ res.status(201).json(transactionlol);

    
    
  }catch(err){
    console.log("Error message",err.message);
    return res.status(400).send (err.message);
  }
});
app.post("/api/v1/payment/ticket",async(req,res)=>{
  try{
    const user = await getUser(req);
    const isUserSubscribed = await db
    .select("*")
    .from("se_project.subscription")
    .where("userid", user.id)
    .first();
    if(isUserSubscribed!=null){
    const{purchasedId,creditCardNumber,holderName,payedAmount,origin,destination,tripDate}=req.body;
    const user= await getUser(req);
    let ticket={
      origin,
      destination,
      user:user.id,
      tripdate:tripDate,
    }
    let transaction={
      amount:payedAmount,
      userid:user.id,
      purchasedIid:purchasedId,
    }

    const ticketlol=await db("se_project.tickets").insert(ticket).returning("*");
    const transactionlol=await db("se_project.transactions").insert(transaction).returning("*");
    console.log(ticketlol);
    console.log(transactionlol);

    return res.status(201).json(ticketlol)+ res.status(201).json(transactionlol);
  }else{
    console.log("user is already subscirbed");
    return res.status(400).send("user is already subscirbed");
  }
  }catch(err){
    console.log("Error message",err.message);
    return res.status(400).send (err.message);
  }
});

app.put("/api/v1/password/reset",async(req,res)=>{
  try{
    const{password}= req.body;
    const{userid} = req.params;
    const updatedpassowrd = await db("se_project.users")
    .where("id",userid)
    .update({password:password})
    .returning('*');
    return res.status(200).json(updatedpassowrd);
    
  }catch(err){
    console.log("eror message", err.message);
    return res.status(400).send("Couldnt rest password");
  
  }
});

// ask donia
app.get("/api/v1/zones",async(req,res)=>{
  try{
    const zones =await db.select('*').from("se_project.zones");
    return res.status(200).json(zones);
  }
  catch(err){
    console.log("error message", err.message);
    return res.status(400).send("failed to select zones");
  }
});
//update the route name in the database
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

  // If request doesn't match any of the above routes then render the 404 page
  // app.use(function (req, res, next) {
  //   return res.status(404).render('404');
  // });

  };

  //ahmad's part

  
  

