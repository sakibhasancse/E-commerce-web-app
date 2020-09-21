const express = require('express');
const router = express.Router();
const About = require('../models/about')
router.get('/return', (re, res, next) => {
    res.render('footer/return',{pageTitle:'Returns & Refund',path:''})
})
router.get('/shipping', (re, res, next) => {
    res.render('footer/shopping',{pageTitle:'shipping',path:''})
})
router.get('/terms', (re, res, next) => {
    res.render('footer/terms',{pageTitle:'Terms',path:''})
})
router.get('/privacy', (re, res, next) => {
    res.render('footer/privacydata',{pageTitle:'Privacy',path:''})
})
router.get('/privacy', (re, res, next) => {
    res.render('footer/privacydata',{pageTitle:'Privacy',path:''})
})
router.get('/about', (req, res, next) => {
    About.find().then(ab => {
        res.render('footer/aboutus',{path:'',pageTitle:'About Us' ,about:ab})
    }).catch(err => {
        console.log(err);
        
    })
    
})

module.exports =router