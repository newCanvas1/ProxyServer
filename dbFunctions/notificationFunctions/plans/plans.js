const { categoryHalfBudgetExceeded } = require("./functions");

function checkPlansNotifications(info) {
    categoryHalfBudgetExceeded(info);
  }
  
  module.exports = {
    checkPlansNotifications,
  };
  