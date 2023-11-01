const fetch = require("node-fetch");
// user uid
const { API, uid } = require("./testInfo");
// planId, used to set a plan and test its deletion
let planId = "";
let categoryId = "";
let expenseId = "";
let notificationId = "";
let goalId = "";

describe("Plans Test Cases", () => {
  test("add an invalid plan", async () => {
    const plan = { name: "", budget: 1000, createdAt: new Date() };
    const body = { ...plan, uid: uid };
    const request = await fetch(`${API}/plans/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const msg = await request.json();
    expect(msg.msg).toBe("invalid");
  });
  test("add a plan, and return a planId of 20 characters (firestore doc id length)", async () => {
    const plan = { name: "Test plan", budget: 1000, createdAt: new Date() };
    const body = { ...plan, uid: uid };
    const request = await fetch(`${API}/plans/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    planId = await request.json();

    expect(planId.length).toBe(20);
  });
  test("check for after adding a plan, the lastPlan should change to the added plan id", async () => {
    const body = { uid: uid };
    const request = await fetch(`${API}/user/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const response = await request.json();

    const lastPlan = response.lastPlan;

    expect(lastPlan).toBe(planId);
  });

  // test("get plans", async () => {
  //   const body = { uid: uid };
  //   const request = await fetch(`${API}/plans/`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(body),
  //   });
  //   const plans = await request.json();
  //   expect(plans.length).toBe(2);
  // });
  test("get plans fail", async () => {
    const body = {};
    const request = await fetch(`${API}/plans/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const plans = await request.json();
    expect(plans.msg).toBe("invalid");
  });
  test("update a plan", async () => {
    const body = {
      planId: planId,
      uid: uid,
      updateFields: { name: "New name", budget: "2000" },
    };
    const request = await fetch(`${API}/plans/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("updated");
  });

  test("invalid update of a plan", async () => {
    const body = {
      planId: planId,
      uid: uid,
      updateFields: { name: "New name", budget: "" },
    };
    const request = await fetch(`${API}/plans/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("invalid");
  });
});
describe("Categories Test Cases", () => {
  test("add a category", async () => {
    const category = { name: "Test category", icon: "cash" };
    const body = { ...category, planId: planId, uid: uid };
    const request = await fetch(`${API}/categories/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();
    categoryId = status;
    expect(status.length).toBe(20);
  });
  test("add invalid category", async () => {
    const category = { name: "", icon: "" };
    const body = { ...category, planId: planId, uid: uid };
    const request = await fetch(`${API}/categories/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("invalid");
  });
  test("get categories", async () => {
    const body = { planId: planId, uid: uid };
    const request = await fetch(`${API}/categories/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const categories = await request.json();
    expect(categories.length).toBe(1);
  });
  test("get categories failed", async () => {
    const body = { planId: planId };
    const request = await fetch(`${API}/categories/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const categories = await request.json();
    expect(categories.msg).toBe("invalid");
  });
  test("update a category", async () => {
    const body = {
      planId: planId,
      uid: uid,
      categoryId: categoryId,
      updateFields: { name: "New name", icon: "cash" },
    };
    const request = await fetch(`${API}/categories/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("updated");
  });

  test("invalid update of a category", async () => {
    const body = {
      planId: planId,
      uid: uid,
      categoryId: categoryId,

      updateFields: { name: "", icon: "" },
    };
    const request = await fetch(`${API}/plans/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("invalid");
  });
});

describe("Expenses Test Cases", () => {
  test("add expense", async () => {
    const body = {
      planId: planId,
      uid: uid,
      categoryId: categoryId,
      category: "category",
      name: "expense",
      amount: 10,
    };
    const request = await fetch(`${API}/expenses/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();
    expenseId = status;
    expect(status.length).toBe(20);
  });
  test("add expense failed", async () => {
    const body = {
      planId: planId,
      uid: uid,
      categoryId: categoryId,
      name: "expense",
    };
    const request = await fetch(`${API}/expenses/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("invalid");
  });
  test("update expense", async () => {
    const body = {
      planId: planId,
      uid: uid,
      categoryId: categoryId,
      expenseId: expenseId,
      updateFields: { name: "new", amount: 100 },
    };
    const request = await fetch(`${API}/expenses/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();
    expect(status.msg).toBe("updated");
  });
  test("update expense failed", async () => {
    const body = {
      planId: planId,
      uid: uid,
      categoryId: categoryId,
      expenseId: expenseId,
      updateFields: { name: "new", amount: "" },
    };
    const request = await fetch(`${API}/expenses/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();
    expect(status.msg).toBe("invalid");
  });
});
describe("Goals Test Cases", () => {
  test("add goal", async () => {
    const body = {
      planId: planId,
      uid: uid,
      name: "goal 1",
      amount: 1000,
      endDate: new Date(),
    };
    const request = await fetch(`${API}/goals/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();
    goalId = status;
    expect(status.length).toBe(20);
  });
  test("add goal failed", async () => {
    const body = {
      planId: planId,
      uid: uid,
      name: "expense",
    };
    const request = await fetch(`${API}/goals/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("invalid");
  });
  test("update goal", async () => {
    const body = {
      planId: planId,
      uid: uid,
      goalId: goalId,
      updateFields: { name: "new", amount: 2000, endDate: new Date() },
    };
    const request = await fetch(`${API}/goals/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();
    expect(status.msg).toBe("updated");
  });
  test("update expense failed", async () => {
    const body = {
      planId: planId,
      uid: uid,
      goalId: goalId,
      updateFields: { name: "new", amount: "" },
    };
    const request = await fetch(`${API}/goals/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();
    expect(status.msg).toBe("invalid");
  });
});

describe("Notifications Test Cases", () => {
  test("add notification", async () => {
    const body = {
      planId: planId,
      uid: uid,
      message: "Budget as been exceeded",
      importance: "HIGH",
    };
    const request = await fetch(`${API}/notifications/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();
    notificationId = status;
    expect(status.length).toBe(20);
  });

  test("add notification failure", async () => {
    const body = {
      planId: planId,
      uid: uid,
    };
    const request = await fetch(`${API}/notifications/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();
    expect(status.msg).toBe("invalid");
  });
});

describe("Deletion Test Cases", () => {
  test("delete expense failed", async () => {
    const body = {
      planId: planId,
      uid: uid,
      categoryId: categoryId,
    };
    const request = await fetch(`${API}/expenses/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("invalid");
  });
  test("delete goals", async () => {
    const body = {
      planId: planId,
      uid: uid,
      goalId: goalId,
    };
    const request = await fetch(`${API}/goals/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("deleted");
  });
  test("delete goal failed", async () => {
    const body = {
      planId: planId,
      uid: uid,
    };
    const request = await fetch(`${API}/goals/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("invalid");
  });
  test("delete expense", async () => {
    const body = {
      planId: planId,
      uid: uid,
      categoryId: categoryId,
      expenseId: expenseId,
    };
    const request = await fetch(`${API}/expenses/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("deleted");
  });
  test("invalid deletion of a category", async () => {
    const body = { planId: planId };
    const request = await fetch(`${API}/categories/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("invalid");
  });
  test("delete a category", async () => {
    const body = { planId: planId, uid: uid, categoryId: categoryId };
    const request = await fetch(`${API}/categories/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();
    expect(status.msg).toBe("deleted");
  });

  test("delete a notification", async () => {
    const body = { planId: planId, uid: uid, notificationId: notificationId };
    console.log(uid, planId, notificationId);
    const request = await fetch(`${API}/notifications/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();
    expect(status.msg).toBe("deleted");
  });

  test("invalid deletion of a plan", async () => {
    const body = { planId: planId };
    const request = await fetch(`${API}/plans/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("invalid");
  });
  test("delete a plan", async () => {
    const body = { planId: planId, uid: uid };
    const request = await fetch(`${API}/plans/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const status = await request.json();

    expect(status.msg).toBe("deleted");
  });
});
