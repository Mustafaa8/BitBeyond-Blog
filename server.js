require('dotenv').config()
const express = require('express')
const port = process.env.PORT || 3000
const app = express()
const path = require('path')
const logger = require('morgan')
const expresslayout = require('express-ejs-layouts')
const cookieParser = require('cookie-parser');
const mongoStore = require('connect-mongo')
const router = require('./routes/main')
const adminRouter = require('./routes/admin')
const dbConnection = require('./config/db')
const { default: mongoose } = require('mongoose')
const session = require('express-session') // to create a session for the user 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
// server Connection
dbConnection()
// Logging 
app.use(logger('dev'))
// static folder
app.use(express.static(path.join(__dirname + '/public')))
// Body and Cookie paraser
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave:false,
    saveUninitialized:true,
    store: mongoStore.create({
        mongoUrl: process.env.CONN_URL
    }
)
}))
// Setting Templating engine 
app.use(expresslayout)
app.set('layout','./layout/main')
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
// Routing
app.use('/',router)
app.use('/',adminRouter)

app.use((req,res)=>{
    res.status(404).send("404 Not Found")
})

app.use((err,req,res,next)=>{
    console.error(err)
    res.status(500).send("500 Somthing is Broken ")
})
app.listen(port,()=>{
    console.log(`Server is working on http://localhost:${port}`)
})