const router = require("express").Router();
const Post = require("../models/post-model");

/*--------------------若是未登入狀態------------------ */
//req.isAuthenticated()，passport語法，代表使用者是否被認證過，預設為true
const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    //未登入時導入至login頁面
    return res.redirect("/auth/login");
  }
};

router.get("/", authCheck, async (req, res) => {
  let postFound = await Post.find({ author: req.user._id });
  return res.render("profile", { user: req.user, posts: postFound }); 
  // deSerializeUser()所儲存
});//render profile.ejs頁面

router.get("/post", authCheck, (req, res) => {
  return res.render("post", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;
  let newPost = new Post({ title, content, author: req.user._id });
  try {
    await newPost.save();
    return res.redirect("/profile");
  } catch (e) {
    req.flash("error_msg", "標題與內容都需要填寫。");
    return res.redirect("/profile/post");
  }
});

module.exports = router;
