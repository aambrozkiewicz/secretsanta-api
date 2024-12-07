require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3");
const { randomHash, generateSecretSantas } = require("./utils");
const { sendMail } = require("./emails");

const app = express();
const port = 3000;

const db = new sqlite3.Database("db.sqlite3");

app.use(cors());
app.use(express.json());

app.post("/santas", async (req, res) => {
  const { santas } = req.body;

  generateSecretSantas(
    santas.map(({ email, name }) => ({
      hash: randomHash(),
      email,
      name,
    }))
  ).forEach(([santa, receiver]) => {
    sendMail(santa.email, "welcomeEmail", {
      receiver: receiver.name,
      hash: santa.hash,
    });
    db.run(
      "INSERT INTO members (hash, name, email, rhs_hash) values (?, ?, ?, ?)",
      [santa.hash, santa.name, santa.email, receiver.hash],
      (err) => {
        if (err) {
          res.status(500).json(err);
        }
      }
    );
  });

  return res.json({ status: "OK" });
});

app.get("/wishlist/:hash", async (req, res) => {
  db.get(
    "SELECT m1.*, m2.name as receiver, m2.notes as wish FROM members m1 join members m2 on m1.rhs_hash = m2.hash where m1.hash = ?",
    [req.params.hash],
    (_, row) => {
      res.json(row);
    }
  );
});

app.patch("/:hash/notes", async (req, res) => {
  const { notes } = req.body;
  db.run(
    "UPDATE members SET notes = ? WHERE hash = ?",
    [notes, req.params.hash],
    () => {
      db.get(
        "SELECT m1.email, m1.hash, m2.name receiver FROM members m1 JOIN members m2 on m2.hash = m1.rhs_hash WHERE m1.rhs_hash = ?",
        [req.params.hash],
        (_, row) => {
          sendMail(row.email, "wishNotification", {
            hash: row.hash,
            receiver: row.receiver,
          });
        }
      );
      res.json(this.changes);
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
