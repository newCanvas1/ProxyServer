const { checkCategoryNotifications } = require("./categories/categories");
const { checkPlansNotifications } = require("./plans/plans");

function checkNotifications(info,notificationOptions) {
  checkCategoryNotifications(info,notificationOptions);
  checkPlansNotifications(info,notificationOptions);
}

module.exports = {
  checkNotifications,
};
