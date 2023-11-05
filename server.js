const express = require("express");
const app = express();
const port = 3000;
const DELAY_ENABLED = true;
const DELAY = 0; // in seconds
const expensesRouter = require("./routers/expenses");
const notificationsRouter = require("./routers/notifications");
const plansRouter = require("./routers/plans");
const userRouter = require("./routers/user");
const categoriesRouter = require("./routers/categories");
const goalsRouter = require("./routers/goals");

app.disable("x-powered-by");

app.use(express.json());

require("dotenv").config();
// add delay to responses
if (DELAY_ENABLED) {
  app.use((req, res, next) => {
    setTimeout(next, DELAY * 1000);
  });
}

// Define a route
app.get("/", (req, res) => {
  res.send("Api Reached!");
});
app.use("/notifications", notificationsRouter);
app.use("/expenses", expensesRouter);
app.use("/plans", plansRouter);
app.use("/user", userRouter);
app.use("/categories", categoriesRouter);
app.use("/goals", goalsRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
