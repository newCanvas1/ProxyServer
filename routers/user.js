const express = require("express");
const { getUserData, updateUser } = require("../dbFunctions");
const userRouter = express.Router();
userRouter.post("/", async (req, res) => {
  const { uid } = req.body;

  const user = await getUserData(uid);
  if (user) {
    res.json(user);
  } else {
    console.log("User get failed")

    res.json({ msg: "invalid" });
  }
});

userRouter.post("/update", async (req, res) => {
  const { uid, updateFields } = req.body;
  console.log(uid, updateFields);
  const response = await updateUser(uid, updateFields);
  console.log(response);
  res.json(1);
});
module.exports = userRouter;
