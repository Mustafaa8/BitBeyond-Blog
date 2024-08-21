const express = require('express')
const User = require('../models/users')
const Post = require('../models/post')
const bcrypt = require('bcrypt')
const adminRouter = express.Router()
const adminLayout = '../views/layout/admin'
const jwt = require('jsonwebtoken')
const jwtSecert = process.env.JWT_SECRET

// Check Login Authentication
const authMiddleware = (req,res,next)=>{
    const token = req.cookies.token;
    if (!token){
        return res.status(401).json({message:"Unauthorized"})
    }
    try {
        const decoded = jwt.verify(token,jwtSecert);
        req.userId = decoded.userId
        next()
    } catch(err){
        res.status(401).json({message:"Unauthorized"})
    }
}


// admin - login GET
adminRouter.get('/admin',async (req,res)=>{
    try {
        const locals={
            title:"Admin Panel"
        }
        res.render('admin/index',{locals,layout:adminLayout})
        //res.json({'message':'you are in the right place'})
    } catch(err){
        console.error(err)
    }
})

// Checking for the user to login
adminRouter.post('/admin',async(req,res)=>{
    try{
        const {username,password} = req.body
        const FooundUser = await User.findOne({username:username})
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
// registering to the website
adminRouter.post('/register',async (req,res,next)=>{
    try{
        const {username , password} = req.body;
        const hashedPassword = await bcrypt.hash(password,10)
        try{
            const newUser = User.create({username:username,password:hashedPassword});
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
        description:"Simple Blog Created using NodeJS and MongoDB"
    }
    try {
        const data = await Post.find()
        res.render('admin/dashboard',{locals,data,layout:adminLayout})
    } catch(err){
        console.error(err)
    }
})
// adding new posts route
adminRouter.get('/add-post',authMiddleware,(req,res)=>{
    try{
    const locals = {
        title:"Adding New Post",
        description:"Simple Blog Created using NodeJS and MongoDB"
    }
    res.render('admin/adding',{locals,layout:adminLayout})
} catch(err){
    next()
}
})
// POST - Adding new posts to the Database
adminRouter.post('/add-post',authMiddleware,async (req,res)=>{
    try{
        const {title,body} = req.body
        const post = await Post.create({title:title,body:body})
        res.redirect(301,'/dashboard')
    } catch(err){
        next()
    }
})
// Get editing post page
adminRouter.get('/edit-post/:id',authMiddleware,async(req,res)=>{
    try{
        const locals = {
            title:"Editing Post",
            description:"Simple Blog Created using NodeJS and MongoDB"
        }
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(400).json({'Message':'No post with this id'})
        }
        res.render('admin/editing',{locals,post,layout:adminLayout})
    } catch(err){
        next()
    }
})
adminRouter.put('/edit-post/:id',authMiddleware,async (req,res)=>{
    try{
        await Post.findByIdAndUpdate(req.params.id,{title:req.body.title,body:req.body.body,updatedAt:Date.now()})
        res.redirect(301,`/edit-post/${req.params.id}`)
    } catch(err){
        next()
    }
})
// Delete - Posts
adminRouter.delete('/delete-post/:id',authMiddleware,async (req,res)=>{
    try{
        await Post.findByIdAndDelete(req.params.id)
        res.redirect(301,`/dashboard`)
    } catch(err){
        next()
    }
})
// logut
adminRouter.get('/logout',(req,res)=>{
    res.clearCookie('token')
    res.redirect(301,'/')
}) 

module.exports = adminRouter;