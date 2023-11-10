const express = require("express");
const {
  getNotifications,
  addNotification,
  deleteNotification,
  readNotification,
  readNotificationCount,
} = require("../dbFunctions/notifications");
const notificationsRouter = express.Router();
notificationsRouter.post("/", async (req, res) => {
  const { uid, planId } = req.body;

  try {
    const notifications = await getNotifications(uid, planId);
    if (notifications == 0) {
      res.json(false);
    } else {
      res.json({ success: true, data: notifications });
    }
  } catch (error) {
    res.json({ success: false });
    console.log(error);
  }
});
notificationsRouter.post("/delete", async (req, res) => {
  const { uid, planId, notificationId } = req.body;
  const response = await deleteNotification(uid, planId, notificationId);
  if (response) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

notificationsRouter.post("/read", async (req, res) => {
  const { uid, planId, notificationId } = req.body;

  const response = await readNotification(uid, planId, notificationId);
  if (response) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});
notificationsRouter.post("/readCount", async (req, res) => {
  const { uid, planId } = req.body;

  const response = await readNotificationCount(uid, planId);
  if (response) {
    console.log(response);
    res.json({ success: true, data: response });
  } else {
    res.json({ success: false });
  }
});

notificationsRouter.post("/add", async (req, res) => {
  let { uid, planId, message, importance } = req.body;
  if (message == "" || importance == "") {
    res.status(400).json({ success: false });
    return;
  }
  const notification = {
    message: message,
    importance: importance,
    isRead: false,
    createdAt: new Date(),
  };
  const response = await addNotification(uid, planId, notification);
  if (response) {
    res.json({ success: true, data: response });
  } else {
    res.json({ success: false });
  }
});
module.exports = notificationsRouter;
