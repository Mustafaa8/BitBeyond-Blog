const express = require('express')
const post = require('../models/post')
const router = express.Router()


router.get('/',async (req,res)=>{
    const locals = {
        title:"Home",
        description : "This is a home page for the website"
    }
    const perPage = 3;
    let page = req.query.page || 1;
    const data = await post.aggregate([ { $sort: { createdAt: -1 } } ])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec()
    const count = await post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage) 
    try {
        res.render('index',{locals,data,current:page,nextPage:hasNextPage ? nextPage:null})
    } catch(err){
        console.error(err)
    }
})
router.get('/post/:id',async(req,res)=>{
    const id = req.params.id
    const article = await post.findById(id)
    if(article === undefined){
        next()
    }
    const locals = {
        title:article.title,
    }
    res.render('post',{article,locals})
})

router.post('/search',async(req,res)=>{
    try{
        let searchTerm  = req.body.searchTerm;
        console.log(searchTerm)
        const searchClear = searchTerm.replace(/[^a-zA-Z0-9]/g,"")
        const data = await post.find({
            $or:[
                {title:{$regex: new RegExp(searchClear,'i')}},
                {body:{$regex: new RegExp(searchClear,'i')}}
            ]
        })
        const locals = {
            title:"Search Result",
        }
        res.render('search',{locals,data})
} catch(err){
    console.error(err)
}
})

router.get('/about',(req,res)=>{
    res.render('about',{title:"About us"})
})

router.get('/contact',(req,res)=>{
    res.render('contact',{title:"Contact Us"})
})

module.exports = router;