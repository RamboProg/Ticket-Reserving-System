const { user } = require('pg/lib/defaults');
const db = require('../../connectors/db');
const roles = require('../../constants/roles');
const { getSessionToken } = require('../../utils/session');

const getUser = async function(req) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return res.status(301).redirect('/');
  }

  const user = await db.select('*')
    .from('se_project.sessions')
    .where('token', sessionToken)
    .innerJoin('se_project.users', 'se_project.sessions.userid', 'se_project.users.id')
    .innerJoin('se_project.roles', 'se_project.users.roleid', 'se_project.roles.id')
    .first();
  
  console.log('user =>', user)
  user.isStudent = user.roleid === roles.student;
  user.isAdmin = user.roleid === roles.admin;
  user.isSenior = user.roleid === roles.senior;

  return user;  
}

module.exports = function(app) {
  // Register HTTP endpoint to render /users page
  app.get('/dashboard', async function(req, res) {
    
    const user = await getUser(req);
    return res.render('dashboard', user);
  });
  // Register HTTP endpoint to render /users page
  app.get('/users', async function(req, res) {
    const user = getUser(req);
    if (!user.isAdmin) {
      return res.status(301).redirect('/dashboard');
    }
    const users = await db.select('*').from('se_project.users');
    return res.render('users', { users });
  });

  // Register HTTP endpoint to render /courses page
  app.get('/manage_stations', async function(req, res) {
    const user = await getUser(req);
    if (!user.isAdmin) {
      return res.status(301).redirect('/dashboard');
    }
    //const stations = await db.select('*').from('se_project.stations');
    return res.render('manage_stations', { ...user});
  });
  app.get('/subscriptions', async function(req, res) {
    const user  =await getUser(req);
     const sub = await db.select('*').from('se_project.subsription').where('userid', user.userid);
    return res.render('subscriptions', {user,sub});

  });
  app.get('/TicketPurchase',async function(req,res){
    const user = await getUser(req);
    // how will i send the user to be able to purchase a ticket
    return res.render('TicketPurchase',{user});
  });
  app.get('/subscriptionPurchase',async function(req,res){
    const user = await getUser(req);
    // how will i send the user to be able to purchase a ticket
    return res.render('subscriptionPurchase',{user});
  });
  app.get('/tickets',async function(req,res){
    const user = await getUser(req);
    const ticket= await db.select("*").from("se_project.tickets").where("userid",user.userid);
    console.log("ticket",ticket);
    return res.render('tickets',{user,ticket});
  

  });
  app.get('/manage_stations',async function(req,res){
    const user = await getUser(req);
    if (!user.isAdmin) {
      return res.status(301).redirect('/dashboard');
    }
    return res.render('manage_Stations',{user});
  })
  app.get('/manage_route',async function(req,res){
    const user = await getUser(req);
    if (!user.isAdmin) {
      return res.status(301).redirect('/dashboard');
    }
    return res.render('manage_route',{user});
  });
  app.get('/refund',async function(req,res){
    const user = await getUser(req);
    return res.render('refund',{user});
  })
  app.get('/senior',async function(req,res){
    const user = await getUser(req);
    return res.render('senior',{user});
  });
  app.get('/TicketPurchaseSubscription',async function(req,res){
    const user = await getUser(req);
    return res.render('TicketPurchaseSubscription',user);
  });
  app.get("/add-user",  async function(req, res) {
    const user = await getUser(req);
    if (!user.isAdmin) {
      return res.status(301).redirect('/dashboard');
    }
    return res.render('add-user', user);
  });
  app.get("/rides", async function(req, res) {
    const rides = await db.select('*').from('se_project.rides');
    return res.render('rides', { rides });


  });
  app.get("/CreateRoute", async function(req, res) {
    const user = await getUser(req);
    if (!user.isAdmin) {
      return res.status(301).redirect('/dashboard');
    }
    return res.render('CreateRoute');
  });
  app.get("/mngZones", async function(req, res) {
    const user = await getUser(req);
    if (!user.isAdmin) {
      return res.status(301).redirect('/dashboard');
    }
    return res.render('mngZones');
  });
  app.get("/seniorReq", async function(req, res) {
    const user = await getUser(req);
    if (!user.isAdmin) {
      return res.status(301).redirect('/dashboard');
    }
    return res.render('seniorReq',user);
  });
  app.get('/edit_station',async function(req,res){
    const user = await getUser(req);
    if (user.isAdmin) {
      return res.status(301).redirect('/dashboard');
    }
    return res.render('edit_station',{user});
  });
  app.get('/req_refund',async function(req,res){
    const user = await getUser(req);
    return res.render('req_refund',{user});
  });
};