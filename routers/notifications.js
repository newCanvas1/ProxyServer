const express = require("express");
const {
  getNotifications,
  addNotification,
  deleteNotification,
} = require("../dbFunctions/notifications");
const notificationsRouter = express.Router();
notificationsRouter.post("/", async (req, res) => {
  const { uid, planId } = req.body;

  try {
    const notifications = await getNotifications(uid, planId);
    if (notifications == 0) {
      res.json(false);
    } else {
      res.json(notifications);
    }
  } catch (error) {
    res.json({ msg: "invalid" });
    console.log(error);
  }
});
notificationsRouter.post("/delete", async (req, res) => {
  const { uid, planId, notificationId } = req.body;
  const response = await deleteNotification(uid, planId, notificationId);
  if (response) {
    res.json({ msg: "deleted" });
  } else {
    res.json({ msg: "invalid" });
  }
});

notificationsRouter.post("/add", async (req, res) => {
  let { uid, planId, message, importance } = req.body;
  if (message == "" || importance == "") {
    res.status(400).json({ msg: "invalid" });
    return;
  }
  const notification = {
    message: message,
    importance: importance,
    createdAt: new Date(),
  };
  const response = await addNotification(uid, planId, notification);
  if (response) {
    res.json(response);
  } else {
    res.json({ msg: "invalid" });
  }
});
module.exports = notificationsRouter;
