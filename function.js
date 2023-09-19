const fetch = require("node-fetch");

async function getNotifications(params) {
  const KEY = process.env.KEY;
  const API_HOST = process.env.API_HOST;
  const infoRequest = await fetch(`${API_HOST}/getNotifications`, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      key: KEY,
    },
  });
  try {
    const info = await infoRequest.json();
    console.log(info);
    return info;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { getNotifications };
