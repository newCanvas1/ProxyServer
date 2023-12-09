const {
  categoryHalfBudgetExceeded,
  categoryBudgetExceeded,
} = require("./functions");

function checkPlansNotifications(info) {

 
  categoryHalfBudgetExceeded(info);
  categoryBudgetExceeded(info);

}
module.exports = {
  checkPlansNotifications,
};
