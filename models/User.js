const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
     name: {
        type: String,
        maxlength: 50
     },
     email: {
        type: String,
        trim: true,
        unique: 1
     },
     password: {
        type: String,
        minlength: 5
     },
     lastname: {
        type: String,
        maxlength: 50
     },
     role: {
        type: Number,
        default: 0
     },
     image: String,
     token: {
        type: String,
     },
     tokenExp: {
        type: Number
     }
})

userSchema.pre('save', function( next ){
   var user = this;
   if(user.isModified('password')){
       // 비밀번호를 암호화 시킨다.
      bcrypt.genSalt(saltRounds, function(err,salt) {
         if(err) return next(err)

         bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err)
             // Store hash in your password DB.
             user.password = hash;
             next()
         })
      })
   } else {
      next()
   }
})

userSchema.methods.comparePassword = function (plainPassword, cb) {
   // PlainPassword 와 암호호된 비밀번호를 서로 비교
   bcrypt.compare(plainPassword, this.password, function(err, isMatch)  {
      if(err) {
         return cb(err)
      } else {
         return cb(null, isMatch)
      }
   })
}

userSchema.methods.generateToken = function(cb) {
   var user = this;
   // jsonwebtoken 을 이용해서 token을 생성하기
   var token = jwt.sign(user._id.toHexString(), 'secretToken')
   user.token = token
   user.save(function(err, user){
      if(err) 
      {
         return cb(err)
      }
      else {
         return cb(null, user)
      }
   })
}

userSchema.methods.findByToken = function( token, cb) {
   var user = this;
   
   // token 을 decode 한다.
   jwt.verify(token,'secretToken', function(err, decoded) {
      // 유저 아이디를 이용해서 유저를 찾은 다음에
      // 클라이언트에서 가져온 token 과 DB에 보관된 토큰이 일치하는지 확인.
      user.findOne({"_id": decoded, "token": token}, function(err,user) {

         if(err) return cb(err);
         cb(null, user );
      })
   })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }