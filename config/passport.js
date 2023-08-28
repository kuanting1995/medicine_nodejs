//登入strategy (本地 & google)

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");


/*------儲存用戶google登入資料passport套件語法:serializeUser()、deserializeUser()------*/
/*=>要執行GoogleStrategy裡passport的 done來儲存
將用戶id存在session，要載npm i express-session*/
passport.serializeUser((user, done) => {
  console.log("Serialize使用者。。。");
  done(null, user._id); //=>功能: 將mongoDB id，存在session
  // 並且將id簽名後，以Cookie的形式給使用者。。。
});


passport.deserializeUser(async (_id, done) => {
  console.log(
    "Deserialize使用者。。。使用serializeUser儲存的id，去找到資料庫內的資料"
  );
  let foundUser = await User.findOne({ _id });
  done(null, foundUser); // 將req.user這個屬性設定為foundUser =>passport規定的
});

//Serialization>將物件傳輸或儲存前，將其轉為bytes的過程
//deserialization>將bytes轉為物件

/*--------------------------設定 GoogleStrategy---------------------------

GoogleStrategy需要兩個parameter:
1.param1是物件:含clientID、clientSecret、callbackURL。passport完成oath步驟，取得用戶資料。
2.param2是function。passport自動調用此Fn，此Fn參數為accessToken,refreshToken,profile(為passport從google取得的用戶資料),done。

*/
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    /*3.profile會做驗證，4.done須借用expression-session套件功能，自動執行passport.serializeUser()。serializeUser()參數為1)user和2)done
    */
    async (accessToken, refreshToken, profile, done) => {
      console.log("進入Google Strategy的區域");
      //user是使用user-model，在mongodb做搜尋有無profile.id
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
     //user.findOne().exec()是mongoose語法
      if (foundUser) {
        console.log("使用者已經註冊過了。無須存入資料庫內。");
        done(null, foundUser);
      } else {
        console.log("偵測到新用戶。須將資料存入資料庫內");
        let newUser = new User({
          name: profile.displayName,
          googleID: profile.id,
          thumbnail: profile.photos[0].value,
          email: profile.emails[0].value,
        });
        let savedUser = await newUser.save();
        console.log("成功創建新用戶。");
        //done 是passport的語法 done(null //passport預設寫法, 變數 //會被儲存在done裡)
        done(null, savedUser);//此段可簡化為=>await newUser.save();
      }
    }
  )
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    let foundUser = await User.findOne({ email: username });
    if (foundUser) {
      let result = await bcrypt.compare(password, foundUser.password);
      if (result) {
        done(null, foundUser);
      } else {
        done(null, false);
      }
    } else {
      done(null, false);
    }
  })
);
