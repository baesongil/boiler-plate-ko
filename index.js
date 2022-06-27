const express=require('express')
const app = express()
const port=5000

const mongoose = require('mongoose')

mongoose.connect('mongodb://192.168.1.99:27017/myApp',function(err){
    if(err){
        console.error('mongodb connection error', err)
    }
    console.log('mongodb connected')
})

app.get('/', (req, res) => res.send('Hello World'))

app.listen(port, () => {
    console.log(`Example app listening on port : ${port}` )
})