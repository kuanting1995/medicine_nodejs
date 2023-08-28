const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  googleID: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },//google用戶圖片
  thumbnail: {
    type: String,
  },
  // local login
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  mobile:{
    type: String,
  },
  gender:{
    type: String,
  },
  birthday:{
    type: Date,
  },
  city:{
    type: String,
  },
  dist:{
    type: String,
  },
  rd:{
    type: String
  },
  verificationCode:{
    type: String
  }, 
  status:{
    type: String
  },
  isLive:{
    type:Boolean
  }
});

module.exports = mongoose.model("User", userSchema);
