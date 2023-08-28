const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
mongoose.set('strictQuery', false); // 或者使用 true，根據你的需求
// ... 其他的 Mongoose 相關代碼
const authRoutes = require("./routes/auth-routes");
const profileRoutes = require("./routes/profile-routes");
require("./config/passport");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");//引入flash 載npm i connect-flash
const cors =require("cors");

// 連結MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/GoogleDB")
  .then(() => {
    console.log("Connecting to mongodb...");
  })
  .catch((e) => {
    console.log(e);
  });

// 設定Middlewares以及排版引擎
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());//讓passport運行驗證功能
app.use(passport.session());//設定session後讓passport可以使用
// 製作form-alert
app.use(flash());
//ejs裡可以使用
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//使用靜態網頁
app.use(express.static('public'));

// 設定routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

//判斷是否為登入狀態=>設定user 屬性為req.user值=>ejs裡判斷user是否存在
app.get("/", (req, res) => {
  return res.render("index", {user: req.user,baseUrl: req.baseUrl });
});

app.get("/gmail-succ", (req,res) =>{
  return res.render("gmail-succ",{ user: req.user });
});

app.listen(8080, () => {
  console.log("Server running on port 8080.");
});
