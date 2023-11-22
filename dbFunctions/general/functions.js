function checkIfFamilyPlan(planId) {
  return planId.startsWith("family_");
}

module.exports = { checkIfFamilyPlan };
