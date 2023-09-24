const express = require("express");
const app = express();
const port = 3000;
const expensesRouter = require("./routers/expenses");
const notificationsRouter = require("./routers/notifications");
const plansRouter = require("./routers/plans");
const userRouter = require("./routers/user");

app.use(express.json());

require("dotenv").config();

// Define a route
app.use("/notifications", notificationsRouter);
app.use("/expenses", expensesRouter);
app.use("/plans", plansRouter);
app.use("/user", userRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
