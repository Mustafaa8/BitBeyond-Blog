const express = require('express')

const router = express.Router()


router.get('/',(req,res)=>{
    const locals = {
        title:"Home",
        description : "This is a home page for the website"
    }
    res.render('index',locals)
})

router.get('/about',(req,res)=>{
    res.render('about',{title:"About us"})
})

router.get('/contact',(req,res)=>{
    res.render('contact',{title:"Contact Us"})
})

module.exports = router;