const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname,"/public")));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "sql_delta",
    password: "Phoenix@2003"
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};


// Home Route
app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try{
      connection.query(q, (err, result) => {
          if(err) throw err;
          let count = result[0]["count(*)"];
          res.render("home.ejs", {count});
      })
    }catch(err) {
      console.log(err);
      res.send("Some err in db");
    }
});

// Show Route
app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try{
    connection.query(q, (err, users) => {
        if(err) throw err;
        res.render("show.ejs", {users});
    })
  }catch(err) {
    console.log(err);
    res.send("Some err in db");
  }
});

// New Route
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user", (req, res) => {
  let {username, email, password} = req.body;
  let id = uuidv4();
  let q = `INSERT INTO user(id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;
  try{
    connection.query(q, (err, result) => {
        if(err) throw err;
        console.log("added new user");
        res.redirect("/user");
    })
  }catch(err) {
    console.log(err);
    res.send("Some err in db");
  }
});

// Edit Route
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = "${id}"`;  
  try{
    connection.query(q, (err, result) => {
        if(err) throw err;
        let user = result[0];
        res.render("edit.ejs", {user});
    })
  }catch(err) {
    console.log(err);
    res.send("Some err in db");
  }
});

// Update Route
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let {username: newUsername, password: formPass} = req.body;
  let q = `SELECT * FROM user WHERE id = "${id}"`;  
  try{
    connection.query(q, (err, result) => {
        if(err) throw err;
        let user = result[0];
        if(formPass != user.password){
          res.send("Wrong Password");
        }else{
          let q2 = `UPDATE user SET username = "${newUsername}" where id = "${id}"`;
          connection.query(q2, (err, result) => {
            if(err) throw err;
            res.redirect("/user");
          })
        }
    });
  }catch(err) {
    console.log(err);
    res.send("Some err in db");
  }
})

// Destroy Route
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = "${id}"`;
  try{
    connection.query(q, (err, result) => {
        if(err) throw err;
        let user = result[0];
        console.log(user);
        res.render("delete.ejs", {user});
    })
  }catch(err) {
    console.log(err);
    res.send("Some err in db");
  }
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id = "${id}"`;
  try{
    connection.query(q, (err, result) => {
        if(err) throw err;
        let user = result[0];
        if(user.password != password){
          res.send("Wrong Password");
        }else{
          let q2 = `DELETE FROM user WHERE id = "${id}"`;
          connection.query(q2, (err, result) => {
            if(err) throw err;
            // console.log(result);
            console.log("User Deleted");
            res.redirect("/user");
          })
        }
    });
  }catch(err) {
    console.log(err);
    res.send("Some err in db");
  }
})

app.listen(port, () => {
  console.log(`Server is listening to port ${port}`);
});