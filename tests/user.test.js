const fetch = require("node-fetch");
const { API, uid } = require("./testInfo");

test("get user name, phone, last plan", async () => {
  const body = { uid: uid };
  const request = await fetch(`${API}/user/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const response = await request.json();
  const name = response.name;

  const phone = response.phone;
  expect(name).toBe("Test Case");
  expect(phone).toBe("123");
});
test("get user failed", async () => {
  const body = {};
  const request = await fetch(`${API}/user/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const user = await request.json();

  expect(user.msg).toBe("invalid");
});
