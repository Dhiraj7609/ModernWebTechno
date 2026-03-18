
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: "secureDocsSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 600000
    }
  })
);

app.use("/", authRoutes);
app.use("/", documentRoutes);

app.get("/dashboard", (req, res) => {
  const lastVisited = req.cookies.lastVisitedDoc;

  if (lastVisited) {
    const doc = JSON.parse(lastVisited);

    return res.json({
      message: `Last visited document: ${doc.title}`,
      reviewedAt: doc.time
    });
  }

  res.json({ message: "No document reviewed yet" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
