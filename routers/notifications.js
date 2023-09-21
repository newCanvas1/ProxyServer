const express = require("express");
const { getNotifications } = require("../dbFunctions");
const notificationsRouter = express.Router();
notificationsRouter.get("/",async(req,res)=>{
    // const uid = req.headers.uid
    const uid = "DROsWLcyHiQGdhE8ikDKfmy86pj2"
    const notifications = await getNotifications(uid);
    res.json(notifications);
  
})
module.exports = notificationsRouter;
