const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const bodyParser = require('body-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cors =require("cors");
const express = require("express");
const app = express();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cors());

//使用靜態網頁
app.use(express.static('public'));

router.get("/login", (req, res) => {
  return res.render("login", { user: req.user });
});

//req.logOut 登出使用者，passport語法，自動刪除session
router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});


/*---------------------GOOGLE登入-------------------------*/
/*authenticate() 是function
scope-->想拿到什麼樣的資料 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

/*---------------------註冊:新增資料post-------------------------*/

router.post('/signup', async (req, res) => {

  try {
    let formData = req.body;
    let { name, email, password, mobile, gender, birthday, city, dist, rd } = formData;
    // 創建數據
    let hashedPassword = await bcrypt.hash(formData.password, 12);
    let newUser = new User({ name, email, password: hashedPassword, mobile, gender, 
       birthday, city, dist, rd });
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/*---------------------email驗證-------------------------*/
// 1.設置郵件傳輸
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
      user: 'a90011147@gmail.com',
      pass: 'txexrzesrgckujsk'
  }
});

// 2.生成驗證碼
function generateVerificationCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}
//3. 發送驗證郵件並更新資料
router.put("/update/:email", async (req,res)=>{
  try {
    let email = req.params.email;
    let regData = req.body;
    let verificationCode = generateVerificationCode();
    
    // 更新 db 用戶數據
    let updatedUser = await User.findOneAndUpdate({ email: email }, regData, { new: true });

    if (!updatedUser) {
        return res.status(404).json({ message: '未找到用戶' });
    }

    const mailOptions = {
        from: 'Zheng Yune',
        to: email,
        subject: 'Email Verification Code',
        text: `正元蔘藥行，驗證碼: ${verificationCode}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send("Failed to send verification email.");
        }
        console.log('Email sent: ' + info.response);
        return res.status(200).json({ message: '用戶數據已更新', user: updatedUser });
    });
} catch (error) {
    res.status(500).json({ error: error.message });
}
  });

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "登入失敗。帳號或密碼不正確。",
  }),
  (req, res) => {
    return res.redirect("/profile");
  }
);

//通過google oath會自動導向至此
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  console.log("進入redirect區域");
  return res.redirect("/gmail-succ");
});

module.exports = router;
