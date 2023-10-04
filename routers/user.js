const express = require("express");
const {  getUserData, updateUser } = require("../dbFunctions");
const userRouter = express.Router();
userRouter.post("/", async (req, res) => {
  const { uid } = req.body;
console.log(uid,'here')
  try {
    const user = await getUserData(uid);
    res.json(user);
  } catch (error) {
    res.send("no response");
    console.log(error);
  }
});
// userRouter.post("/field", async (req, res) => {
//   const { uid,field } = req.body;

//   try {
//     const user = await getUserField(uid,field);
//     console.log(user)
//     res.json(user);
//   } catch (error) {
//     res.send("no response");
//     console.log(error);
//   }
// });
userRouter.post("/update", async (req, res) => {
    const { uid, updateFields } = req.body;
    console.log(uid,updateFields)
    const response = await updateUser(uid, updateFields);
    console.log(response);
    res.json(1);
  });
module.exports = userRouter;
