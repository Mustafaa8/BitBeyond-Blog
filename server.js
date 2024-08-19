require('dotenv').config()
const express = require('express')
const port = process.env.PORT || 3000
const app = express()
const path = require('path')
const logger = require('morgan')
const expresslayout = require('express-ejs-layouts')
const router = require('./routes/main')


// Logging 
app.use(logger('dev'))
// static folder
app.use(express.static(path.join(__dirname + '/public')))
// Setting Templating engine 
app.use(expresslayout)
app.set('layout','./layout/main')
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use('/',router)

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