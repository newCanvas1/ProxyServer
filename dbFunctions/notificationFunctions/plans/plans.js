const {
  categoryHalfBudgetExceeded,
  categoryBudgetExceeded,
} = require("./functions");

function checkPlansNotifications(info, notificationOptions) {
  console.log(notificationOptions,"hhhhhhh");
  if (notificationOptions.ExceedBudgetLimit) {
  }
  categoryHalfBudgetExceeded(info);
  categoryBudgetExceeded(info);
}

module.exports = {
  checkPlansNotifications,
};
