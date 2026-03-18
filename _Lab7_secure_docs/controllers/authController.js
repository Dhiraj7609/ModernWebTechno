
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { getUsers, saveUsers } = require("../models/userModel");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!password || password.length < 6) {
    return res.json({ message: "Password must be at least 6 characters" });
  }

  const users = getUsers();

  const exists = users.find(
    u => u.username === username || u.email === email
  );

  if (exists) {
    return res.json({ message: "Username or email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    userId: uuidv4(),
    username,
    email,
    hashedPassword,
    creationDate: new Date()
  };

  users.push(newUser);
  saveUsers(users);

  res.json({ message: "User registered successfully" });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const users = getUsers();

  const user = users.find(
    u => u.username === username || u.email === username
  );

  if (!user) {
    return res.json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.hashedPassword);

  if (!match) {
    return res.json({ message: "Invalid credentials" });
  }

  req.session.userId = user.userId;
  req.session.loginTime = new Date();

  res.json({ message: "Login successful" });
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out successfully" });
};

exports.profile = (req, res) => {
  const users = getUsers();
  const user = users.find(u => u.userId === req.session.userId);
  res.json(user);
};
