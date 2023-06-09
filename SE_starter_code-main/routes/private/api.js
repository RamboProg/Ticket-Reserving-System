const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");


const { getSessionToken } = require('../../utils/session');
const { request } = require("express");
const nodemon = require("nodemon");
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
      const users = await db.select('*').from("se_project.users");
      return res.status(200).json(users);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Could not get users");
    }

   
  });
  app.get("/api/v1/subscription",async function(req,res){
    try{

      const user = getUser(req);
      const subscription = await db.select("*").from("se_project.subsription");
      return res.status(200).json(subscription);
    }catch(e){
      return res.status(400).json(e.message);
    }

  });

        //Rambo's Tasks------------------------------------------------------------------------------------------------------------------------------

      //POST for tickets new subscription

      // fetch el tickets then decrement from sub and insert to table tickets, then create upcoming ride and use origin and destination to do so 
     // correct
      app.post('/api/v1/tickets/purchase/subscription', async (req, res) => {
        try {
          const { subID, Origin, destination, tripDate } = req.body;
          const user = await getUser(req);
          let sub = (await db("se_project.subsription").where("id", subID).select("nooftickets").first());
          sub = sub.nooftickets - 1;
          const updatedSub = await db("se_project.subsription").where("id", subID).update({ nooftickets: sub });
          const transaction = {
            amount: 0,
            userid: user.userid,
            purchasediid: subID,
          };
          const ticket = {
            origin: Origin,
            destination: destination,
            userid: user.userid,
            subid: updatedSub.id,
            tripdate: tripDate

          };

          const addedSub = await db('se_project.subsription').insert(newSub).returning('*');
          const nooftickets = await db('se_project.subsription').where({ subID }).select('noOfTickets') - 1;
          const ticket = await db('se_project.tickets').where('subiD', subID).select('*');
          const user = await getUser(req);
          const newTicket = {
            userID: user.id,
            subID,
            origin,
            destination,
            tripDate
          };
          const addedTicket = await db('se_project.tickets').insert(newTicket).returning('*');
          //Create upcoming ride
          const newRide = {
            origin,
            destination,
            tripDate
          }
          const transactionlol = await db("se_project.transactions").insert(transaction).returning("*");
          const ticketlol = await db("se_project.tickets").insert(ticket).returning("*");
           console.log(ticketlol[0].id,"ticket");
          // console.log("hiii");
          // console.log(updatedSub,"Subscription");
          const ride = {
            status: "Upcoming",
            origin: Origin,
            destination: destination,
            userid: user.userid,
            ticketid:ticketlol[0].id,
            tripdate: tripDate
            
          };
          const ridelol = await db("se_project.rides").insert(ride).returning("*");
          return res.status(200).json(ridelol);
        }catch(e){
          return res.status(400).json(e.message);
        }
      });


      //GET for prices
      app.post('/api/v1/tickets/price/:originId&:destinationId', async (req, res) => {
        try {
          const { originId, destinationId } = req.params;
          //Get the amount of stations between the origin and destination
          const stations = await db('se_project.stations').where({ originId, destinationId }).select('*');

          if(stations <= 9){
            const price = 5;
          } else if(stations >16){
            const price = 7;
          } else { const price = 10; }

          return res.status(200).json(price);

        } catch (e) {
          return res.status(400).json(e.message);
        }
      });

      //POST for request refunds
      // correct
      app.post('/api/v1/refund/:ticketId', async (req, res) => {
        try {

          const { ticketId } = req.params;
          const user = await getUser(req);
          const GetDetails = await db("se_project.tickets").where("id",ticketId).select("*").first();
          if(GetDetails[0].tripdate<new Date() ){
          const GetTicket = await db("se_project.transactions").where("userid",user.userid).select("amount").first();
          
          console.log("Ticket",GetTicket);
          const refundReq={
            status:"Pending",
            userid:user.userid,
            refundamount:GetTicket.amount,
            ticketid:ticketId

          }
          console.log(req.params);
          const refund = await db("se_project.refund_requests").insert(refundReq).returning("*")
          console.log(refund);
          return res.status(200).json(refund);
        }else 
          { return res.status(400).send("Outdated ticket")}
        } catch (e) {
          return res.status(400).json(e.message);
        }
        
      });

      //POST for request senior
      //correct
      app.post('/api/v1/senior/request', async (req, res) => {
        try {
          const { nationalId } = req.body;
          console.log(req.body);

          const user = await getUser(req);
          const serioReq={
            status:"Pending",
            userid:user.userid,
            nationalid:nationalId
          }
          const senior = await db('se_project.senior_requests').insert(serioReq).select('*');
          console.log(senior);
          return res.status(200).json(senior);
        } catch (e) {
          console.log("");
          return res.status(400).send(e.message);
        }
      });

      //PUT for rides simulation
      app.put('/api/v1/ride/simulate', async (req, res) => {
        try{

          const { Origin, Destination, tripDate } = req.body;
          
          const currUser = await getUser(req);
          const simulatedRide = await db('se_project.rides').where("origin",Origin).where("destination",Destination).where("tripdate",tripDate).returning('*');
          if(simulatedRide!=null){

            // const updatedRide = await db ("se_project.rides").where("id", currUser.userid).where("origin",Origin).where("destination",Destination).where("tripdate",tripDate).update({status:"Completed"}).returning("*");
            const updateride = await db("se_project.rides").where( {origin : Origin, destination : Destination, tripdate : tripDate}).update({status : "Completed"}).returning("*");
            return res.status(200).json(updateride);
          }
          
          }catch (e) {
            return res.status(400).json(e.message);
          }
        });
  // zaids shit
  //correct
  
  app.put("/api/v1/password/reset",async(req,res)=>{
    console.log("ana ghalat");
    const {newPassword} = req.body;
    const user = await getUser(req);
    try{
      const updateUserPassword = await db("se_project.users").where("id", user.id).update({
        password: newPassword
      });
       console.log(updateUserPassword, "database")
      //const updateUserPassword2 = await db("se_project.users").where("id", 2)
      //console.log(updateUserPassword, "database updated")
      //console.log("");
      const user2 = await getUser(req);
      return res.status(200).json(user2);
    }catch(err){
      
      console.log("error message", err.message);
      return res.status(400).send("Could not update password");
    }
  });
  //correct
  app.post("/api/v1/station",async(req,res)=>{
    try{
      const{stationname} = req.body;
      let newStation = {
        stationname,
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
  //correct
  app.put("/api/v1/station/:stationId", async(req,res)=>{
    try{
      const {stationname} = req.body;
      const {stationId} = req.params; 
      const updatedStation = await db("se_project.stations")
      .where("id", "=", parseInt(stationId))
      .update({ stationname });
      return res.status(200).json(updatedStation);
    }catch(err){
      console.log("Error message", err.message);
      return res.status(404).send("failed to update station")
    }
  
  });


//Check this with Zaid 
  app.delete("/api/v1/station/:stationId", async(req,res)=>{
    try{
      const {StationId} =req.params;
      const selectedStation = await db("se_project.stations").where("toStationid",StationId).select("*");
      if(selectedStation.length > 0){
        const  FromStationID = await db ("se_project.routes").where("fromStationid",StationId).returning("*").first();
        const toStationid = await db ("se_project.routes").where("toStationid",StationId).returning("*").first();
        //wa7wa7 was here hehehehehehe
        //not your babe fr fr
        
        for (let i = 0; i < selectedStation.length; i++) {
          if(element.stationposition == "start"){
            const updatedRoute = await db ("se_project.routes").where("id",element.id).update({fromStationid: FromStationID.toStationid}).returning("*");
            const updatedStation = await db ("se_project.stations").where("id",element.id).update({toStationid: FromStationID.toStationid}).returning("*");
            updatedStation.stationposition = "start";
          }else if(element.stationposition == "end"){
            const updatedRoute = await db ("se_project.routes").where("id",element.id).update({fromStationid: FromStationID.toStationid, toStationid: toStationid.fromStationid}).returning("*");
            const updatedStation = await db ("se_project.stations").where("id",element.id).update({toStationid: toStationid.fromStationid}).returning("*");
            updatedStation.stationposition = "end";
          }else if (element.stationposition == "middle"){
            //delete the middle type station and get the routes that are connected to it and connect it to the station before it and the station after it
            const updatedRoute = await db ("se_project.routes").where("id",element.id).update({fromStationid: FromStationID.toStationid, toStationid: toStationid.fromStationid}).returning("*");
            const updatedRouteOther = await db ("se_project.routes").where("id",element.id).update({toStationid: FromStationID.toStationid, fromStationid: toStationid.fromStationid}).returning("*");
            const updatedStation = await db ("se_project.stations").where("id",element.id).update({toStationid: toStationid.fromStationid}).returning("*");
            updatedStation.stationposition = "middle";
            
          }
        }
      }
        
        console.log("Deleted", selectedStation);
        return res.status(200).json(selectedStation);
        
    }catch(err){
      console.log("Error message ",err.message);
      return res.status(400).send("Failed to deleted station");
    }
  
  
  }); 
//correct
  app.post("/api/v1/route", async(req,res)=>{
    try{
    const {routeName,ConnectedStationId,newStationId} =req.body;
    let newRoute =
    {
      routename:routeName,
      fromstationid: ConnectedStationId,
      tostationid : newStationId
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
// correct
app.get("/api/v1/zones", async(req,res)=>{
  
  try{
    const zones = await db.select("*").from("se_project.zones");
    // console.log(zones.first());
    return res.status(200).json(zones);
  }catch(err){
    console.log("error message", err.message);
    return res.status(400).send("failed to select zones");
  }
});
//correct 
app.post("/api/v1/payment/subscription", async (req, res) => {
  try {
    //subscription
    const { payedAmount, subType, zoneId } = req.body;
    const user = await getUser(req);
    let NumberofTickets = 0;
    if (subType == "annual") {
      NumberofTickets = 100;
    } else if (subType == "quarterly") {
      NumberofTickets = 50;
    } else {
      NumberofTickets = 10;
    }
    let sub = {
      subtype: subType,
      zoneid: zoneId,
      userid: user.userid,
      nooftickets: NumberofTickets,
    };
    // console.log(nooftickets);
    

    
    const subscriptionlol = await db("se_project.subsription").insert(sub).returning("*");
    let transaction = {
      amount: payedAmount,
      userid: user.id,
      purchasediid: subscriptionlol[0].id,
    };
    const transactionlol = await db("se_project.transactions").insert(transaction).returning("*");
    console.log(subscriptionlol);
     console.log(transactionlol);
    return res.status(201).json(subscriptionlol); //+ res.status(201).json(transactionlol);
  } catch (err) {
    console.log("Error message", err.message);
    return res.status(400).send(err.message);
  }
});
//correct
app.post("/api/v1/payment/ticket",async(req,res)=>{
  try{
    const user = await getUser(req);
    const isUserSubscribed = await db
    .select("*")
    .from("se_project.subsription")
    .where("userid", user.id)
    .first();
    if(isUserSubscribed!=null){
    const{purchasedId,creditCardNumber,holderName,payedAmount,origin,destination,tripDate}=req.body;
    const user= await getUser(req);
    let ticket={
      origin,
      destination,
      userid:user.id,
      tripdate:tripDate,
    }
    let transaction={
      amount:payedAmount,
      userid:user.id,
      purchasediid:purchasedId,
    }

    const ticketlol=await db("se_project.tickets").insert(ticket).returning("*");
    const transactionlol=await db("se_project.transactions").insert(transaction).returning("*");
    console.log(ticketlol);
    console.log(transactionlol);

    return res.status(201).json(ticketlol)//+ res.status(201).json(transactionlol);
  }else{
    console.log("user is already subscirbed");
    return res.status(400).send("user is already subscirbed");
  }
  }catch(err){
    console.log("Error message",err.message);
    return res.status(400).send (err.message);
  }
});
//ahmad's part
//update the route name in the database
//correct
  app.put('/api/v1/route/:routeId', async (req, res) => {
    try {
      const {routeId} = req.params;
      const {routeName} = req.body;
      await db("se_project.routes")
        .where("id", routeId)
        .update({ routename: routeName });
      return res.status(200).send('Route updated successfully');
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('An error occurred while updating the route');
    }
  });

// delete the route from the database
//correct
  app.delete('/api/v1/route/:routeId', async (req, res) => {
    try {
      const {routeId} = req.params;
      
     
      await db("se_project.routes").where("id",routeId).del();
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
//for later testing still i have to have a senior request os i can test it
  app.put('/api/v1/requests/senior/:requestId', async (req, res) => {
    try {
      const {requestId} = req.params;
      const {seniorStatus} = req.body;
      await db('se_project.senior_requests')
        .where("id",requestId)
        .update({ status: seniorStatus });
      return res.status(200).send('Senior request updated successfully');
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('An error occurred while updating the senior request');
    }
  });

// update the zone price in the database
// correct
  app.put('/api/v1/zones/:zoneId', async (req, res) => {
    try {
      const {zoneId} = req.params;
      const {newprice} = req.body;
      await db('se_project.zones')
        .where("id",zoneId)
        .update({price: newprice});
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

  app.get('/api/v1/station', async (req, res) => {
    try {
      const station = await db.select('*').from('se_project.stations');
      return res.status(200).json(station);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('Could not get stations');
    }
  });

  };
 


  
  

