const express = require("express");
const { getNotifications } = require("../dbFunctions");
const notificationsRouter = express.Router();
notificationsRouter.post("/", async (req, res) => {
  const { uid, planId } = req.body;
  console.log(uid, planId);
  const notifications = await getNotifications(uid, planId);
  console.log(notifications.length == 0);
  if (notifications==0) {
    res.json(false)
  } else {
    res.json(notifications);
  }
});
module.exports = notificationsRouter;
