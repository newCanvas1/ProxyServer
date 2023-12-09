const { catgeoryLimitExceeded } = require("./functions");
function checkCategoryNotifications(info) {

      catgeoryLimitExceeded(info);

  
}

module.exports = {
  checkCategoryNotifications,
};
