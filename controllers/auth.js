const bcrypt = require('bcryptjs');
const _ = require('lodash')
const {validationResult} =require('express-validator/check')

const User = require('../models/user');
const { zip } = require('lodash');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: { email: '', password: '' },
    validationError:[]

  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput:{name:'',email:'',password:'',confirmPassword:''},
    validationError:[]

  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const error = validationResult(req)

  if (!error.isEmpty()) {
    console.log(error.array())
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: error.array()[0].msg,
      oldInput:{email,password},
      validationError:error.array()
    }
    );
    
  }
  
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
       
        return  res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage:'invalid email and password',
          oldInput:{email,password},
          validationError:[]
        }
        );
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            const token = user.genaretJsonAuth()
            console.log(token);
            
            res.cookie('auth', token, {
              httpOnly: true,
              sameSite: true,
              signed:true,
              maxAge: 4* 60 *60 *1000
            })
            
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const phone = req.body.phone;
  const address= req.body.address;
  const zip = req.body.zip;
 
  const error = validationResult(req)
  if (!error.isEmpty()) {
    console.log(error.array())
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: error.array()[0].msg,
      oldInput:{name,email,password,confirmPassword:req.body.confirmPassword},

      validationError:error.array()
    });
  }
  
      // console.log(pickedProparty);
      
    bcrypt
      .hash(password, 12)
      .then(hashedPassword => {
       let newuser= {
        email:email,
         password: hashedPassword,
         name: name,
         phone: phone,
         address: address,
         zip: zip,
        // pickedProparty, 
        cart: { items: [] }
      }
        
          const user = new User(_.pick(newuser,['name','phone','address','zip','email','password','cart'['items:[]']]));
          return user.save();
        })
        .then(result => {
      // res.status(200).send('ragistation sucssess')

          res.redirect('/login');
        }) .catch((err) => {
          const error = new Error(err);
          error.httpStatus = 500;
          return next(error)
        });
   
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
