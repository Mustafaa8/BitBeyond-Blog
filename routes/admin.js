const express = require('express')
const user = require('../models/users')
const bcrypt = require('bcrypt')
const adminRouter = express.Router()
const adminLayout = '../views/layout/admin'
const jwt = require('jsonwebtoken')
const jwtSecert = process.env.JWT_SECRET

// Check Login 
const authMiddleware = (req,res,next)=>{
    const token = req.cookies.token;
    if (!token){
        return res.status(401).json({message:"Unauthorized"})
    }
    try {
        const decoded = jwt.verify(token,jwtSecert);
        console.log(decoded)
        req.userId = decoded.userId
        next()
    } catch(err){
        res.status(401).json({message:"Unauthorized"})
    }
}


// admin - login GET
adminRouter.get('/admin',async (req,res)=>{
    const locals = {
        title:"Admin",
    }
    try {
        res.render('admin/index',{locals,layout:adminLayout})
    } catch(err){
        console.error(err)
    }
})

adminRouter.post('/admin',async(req,res)=>{
    try{
        const {username,password} = req.body
        const FooundUser = await user.findOne({username:username})
        if(!FooundUser){
            return res.status(401).json({message:"Invalid Credintials"})
        }
        const isPasswordValid = await bcrypt.compare(password,FooundUser.password)
        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid Credintials"})
        }
        const token = jwt.sign({userId:FooundUser._id},jwtSecert)
        res.cookie('token',token,{httpOnly:true})
        res.redirect('/dashboard')
        } catch(err){
        console.error(err)
    }
})
adminRouter.post('/register',async (req,res,next)=>{
    try{
        const {username , password} = req.body;
        const hashedPassword = await bcrypt.hash(password,10)
        try{
            const newUser = user.create({username:username,password:hashedPassword});
            res.status(201).json({message:'user created'},newUser)
        } catch(err) {
            if (err.code === 11000){
                res.status(400).json({message:'User already exists'})
            }
            res.status(500).json({message:'Something is broken'})
        }
    } catch(err){
        console.error(err)
    }
})

// Dashboard
adminRouter.get('/dashboard',authMiddleware,async (req,res)=>{
    const locals = {
        title:"Dashboard",
    }
    try {
        res.render('admin/dashboard',{locals,layout:adminLayout})
    } catch(err){
        console.error(err)
    }
})


module.exports = adminRouter;