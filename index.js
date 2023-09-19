const express = require("express");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");

const app = express();

const dbPool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "shopee",
  password: "",
});

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "berada pada root",
  });
});

app.post("/", verifyUser, (req, res) => {
  res.json({
    message: "POST terbuat",
    data: req.body,
  });
});

app.post("/login", (req, res) => {
  dbPool.execute("SELECT * FROM users", (err, rows) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    const user = rows[0];
    jwt.sign({ user }, "secret", (err, token) => {
      if (err) {
        console.log(err);
        res.sendStatus(304);
        return;
      }
      const Token = token;
      res.json({
        user: user,
        token: Token,
      });
    });
  });
});

app.post("/register", (req, res) => {
  const { phone, password } = req.body;

  dbPool.execute(
    "INSERT INTO users (phone, password) VALUES (?, ?)",
    [phone, password],
    (error, results) => {
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        res.json({ message: "User berhasil terdaftar" });
      }
    }
  );
});

app.post("/logout", (req, res) => {
  const tokens = [];
  const bearer = req.headers.bearer;
  tokens.splice(tokens.indexOf(bearer), 1);
  res.json({ message: "Logged Out" });
});

function verifyUser(req, res, next) {
  const bearer = req.headers.bearer;
  jwt.verify(bearer, "secret", (err, data) => {
    if (err) {
      console.log(err.message);
      res.sendStatus(403);
      return;
    }
    req.body = data;
    next();
  });
}

app.listen(3002, () => {
  console.log("aplikasi berjalan pada port 3002");
});
