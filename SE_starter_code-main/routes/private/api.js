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
        id,
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
      const deletedStation = await db ("se_project.stations").where("id",StationId).del().returning('*');
      console.log("Deleted", deletedStation);
      return res.status(200).json(deletedStation);
  
    }catch(err){
      console.log("Error message ",err.message);
      return res.status(400).send("Failed to deleted station");
    }
  
  
  }); 
};

