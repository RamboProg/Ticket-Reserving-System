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
  // this thing
  app.put("/api/v1/password/reset",async(req,res)=>{
    try{
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
  // still not sure about this shit
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
      console.log("error message", err.message);
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
      const selectedStation = db.select('*').from ("se_project.station").where("id",StationID);
      const selectedStationfrom = db.select("*").from("se_project.routes").where("fromStationid",StationId);
      const selectedStationto = db.select("*").from("se_project.routes").where("toStationid",StationId);
      if(selectedStation.length > 0){
        
        
        
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
    const user=getUser(req);
    let sub={
      subtype:subType,
      zoneid:zoneId,
      userid:user.id,
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

    //transaction
    
  }catch(err){
    console.log("Error message",err.message);
    return res.status(400).send (err.message);
  }
});
app.post("/api/v1/payment/ticket",async(req,res)=>{
  try{
    const{purchasedId,creditCardNumber,holderName,payedAmount,origin,destination,tripDate}=req.body;
    const user=getUser(req);
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
  }
  catch(err){
    console.log("Error message",err.message);
    return res.status(400).send (err.message);
  }
});

app.put("/api/v1/password/reset",async(req,res)=>{
  try{
    const{password}= req.body;
    const{userid} = req.params;
    const updatedpassowrd = await db("se_project.users");
    where("id",userid)
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
};
