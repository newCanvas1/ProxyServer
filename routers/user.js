const express = require("express");
const { getUserData, updateUser } = require("../dbFunctions/user");
const userRouter = express.Router();

userRouter.post("/", async (req, res) => {
  const { uid } = req.body;
  const user = await getUserData(uid);
  console.log(user);
  if (user) {
    res.json({ success: true, data: user });
  } else {
    res.json({ success: false });
  }
});

userRouter.post("/update", async (req, res) => {
  const { uid, updateFields } = req.body;

  const response = await updateUser(uid, updateFields);

  res.json(1);
});
module.exports = userRouter;
