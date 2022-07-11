const { User } = require('../models/User');

let auth = (req, res, next) => {

    // 인증 처리를 하는 곳

    // 클라이언트 cookie 에서 token 을 가져온다.
    let token = req.cookies.x_auth;

    // token 을 복호화(decode) 한 후 유저를 찾는다.
    User.findByToken(token, (err, user) => {
        // 유저가 있으면 인증 OK
        // 유저가 없으면 인증 No
        if(!user) return res.json({ isAuth: false, error: true})

        req.token = token;
        req.user = user;
        next();
    })

}

module.exports = { auth };