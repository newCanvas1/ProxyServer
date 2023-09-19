const express = require("express");
const app = express();
const port = 3000;
const { getNotifications } = require("./function");
app.use(express.json());

require('dotenv').config();

// Define a route
app.get("/getNotifications", async(req, res) => {
   
  res.json(await getNotifications())
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
