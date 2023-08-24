require("dotenv").config();
const express = require("express");
const expressEjsLayouts = require("express-ejs-layouts");
const connectDB = require("./database/db");
const session = require("express-session");

const app = express();

//middleware session
app.use(
  session({
    secret: "mycrud",
    resave: false,
    saveUninitialized: true,
  })
);

//Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("public"));
app.use(express.static("uploads"));
app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.set("layout", "./layouts/main.ejs");

app.use("/", require("./routes/index"));

const PORT = process.env.PORT || 3000;
connectDB();
app.listen(PORT, () => console.log(`server started on port ${PORT}`));
