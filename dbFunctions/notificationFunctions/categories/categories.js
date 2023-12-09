const { catgeoryLimitExceeded } = require("./functions");
function checkCategoryNotifications(info,notificationOptions) {
  console.log(notificationOptions);
  if (notificationOptions.ExceedCategories) {
      catgeoryLimitExceeded(info);

  }
}

module.exports = {
  checkCategoryNotifications,
};
