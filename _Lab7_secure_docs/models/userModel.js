
const fs = require("fs");
const path = "./data/users.json";

function getUsers() {
  const data = fs.readFileSync(path);
  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync(path, JSON.stringify(users, null, 2));
}

module.exports = { getUsers, saveUsers };
