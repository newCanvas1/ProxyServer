const { checkCategoryNotifications } = require("./categories/categories");
const { checkPlansNotifications } = require("./plans/plans");

function checkNotifications(info) {
  checkCategoryNotifications(info);
  checkPlansNotifications(info);
}

module.exports = {
  checkNotifications,
};
