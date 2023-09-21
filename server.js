const express = require("express");
const app = express();
const port = 3000;
const expensesRouter = require("./routers/expenses");
const notificationsRouter = require("./routers/notifications");

app.use(express.json());

require("dotenv").config();

// Define a route
app.use("/notifications", notificationsRouter);
app.use("/expenses", expensesRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
