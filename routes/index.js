const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const multer = require("multer");

//search
router.get("/search", async (req, res) => {
  try {
    const query = req.query.searchTerm;
    const searchUsers = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
      ],
    });

    const message = req.session.message;
    delete req.session.message;

    // Pagination
    const page = req.query.page || 1;
    const perPage = 3;

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ name: 1 })
      .skip(page * perPage - perPage)
      .limit(perPage)
      .exec();

    const count = searchUsers.length;
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    const prevPage = page - 1;

    res.render("dashboard", {
      title: "Dashboard",
      message,
      users,
      current: page,
      prevPage: prevPage >= 1 ? prevPage : null,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/", async (req, res) => {
  try {
    const message = req.session.message;
    delete req.session.message;

    //Pagination
    const page = req.query.page || 1;
    const perPage = 3;

    const users = await User.find()
      .sort({ name: 1 })
      .skip(page * perPage - perPage)
      .limit(perPage)
      .exec();

    const count = await User.count();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    const prevPage = page - 1;

    res.render("dashboard", {
      title: "Dashboard",
      message,
      users,
      current: page,
      prevPage: prevPage >= 1 ? prevPage : null,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/add", (req, res) => {
  res.render("add", { title: "Add User" });
});

//Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const timestamps = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${timestamps}${extension}`);
  },
});

//middleware upload
const upload = multer({ storage: storage }).single("image");

//insert an user into database
router.post("/add", upload, async (req, res) => {
  const { name, email, phone } = req.body;
  const image = req.file ? req.file.filename : "";

  try {
    const newUser = new User({ name, email, phone, image });
    await newUser.save();

    const uploadsDirectory = path.join(__dirname, "uploads");
    fs.chmodSync(uploadsDirectory, 0o755);

    req.session.message = {
      message: "User added successfully",
    };
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

//edit
router.get("/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    res.render("edit", { title: "Edit User", user });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

//Update
router.post("/update/:id", upload, async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, phone } = req.body;
    const new_image = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, phone, image: new_image },
      { new: true }
    );

    if (!updatedUser) {
      return res.redirect("/");
    }

    const uploadsDirectory = path.join(__dirname, "uploads"); // Ganti dengan path yang sesuai
    fs.chmodSync(uploadsDirectory, 0o755); // Atur izin akses

    req.session.message = { message: "User updated successfully" };
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

//delete
router.get("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deletedUser = await User.findByIdAndRemove(id);

    if (!deletedUser) {
      return res.redirect("/");
    }

    if (deletedUser.image !== "") {
      fs.unlinkSync(`./uploads/${deletedUser.image}`);
    }

    req.session.message = { message: "User deleted successfully" };
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

module.exports = router;
