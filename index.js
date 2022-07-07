const express=require('express')
const app = express()
const port=5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');

const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
// mongodb connect
mongoose.connect(config.mongoURI,function(err){
    if(err){
        console.error('mongodb connection error', err)
    }
    else console.log('mongodb connected')
})

/*
// postgresql connect
var { Client } = require('pg');
//const { postgresURI } = require('./config/dev');
//console.log(postgresURI);

const pg = new Client ({
    user: "testuser",
    host: "192.168.1.99",
    database: "testdb",
    password: "testuser",
    port: 5432,
});

pg.connect(function(err){
    if(err){
        console.error('postgresql connection error', err)
    }
    else console.log('postgresql connected')
})

pg.query("select * from teacher",(err, res) => {
    if(!err) console.log(res.rows);
    else console.log(err);
    pg.end();
})
*/

app.get('/', (req, res) => res.send('Hello World!!  Have a good day!'))

app.post('/api/users/register',(req, res) => {
    // 회원 가입 할때 필요한 정보들을 Client에서 가져오면
    // 그 정보들을 DB에 넣어준다.
    const user = new User(req.body)

    user.save((err, userInfo) => {
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/api/users/login', (req, res) => {
    // 요청된 이메일을 데이터베이스에서 조회한다.
    User.findOne({ email: req.body.email}, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

        // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인.

        user.comparePassword(req.body.password, (err, isMatch) => {

            if(!isMatch) {
                res.status(400)
                res.json({loginSuccess: false, message:"비밀번호가 틀렸습니다"})  
                return
            } 
                
            // 비밀번호까지 맞다면 토큰을 생성하기.
            user.generateToken((err, user) => {
                if(err) {
                    return res.status(400).send(err);
                }

                // 토큰을 쿠키에 저장한다. (쿠키 or local storage or session)
                res.cookie("x_auth",user.token)
                .status(200)
                .json({loginSuccess: true, userId: user._id})
            });
        });
    })
})

app.get('/api/users/auth', auth ,(req, res) => {

    // 여기 까지 미들웨어를 통과해 왔다는 얘기는 Authentication 이 True 라는 의미임.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port : ${port}` )
})