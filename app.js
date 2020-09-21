const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const cookieparser = require("cookie-parser");
const errorController = require("./controllers/error");
const User = require("./models/user");
// const multer = require('multer');
const bcrypt = require('bcryptjs');
const fileUpload = require('express-fileupload')
const expressvalidator = require('express-validator')
const Accessories = require('./models/accessories');
const Product =require('./models/product')
const ItemPerpage = 10;

require("dotenv").config({
  path: "./config/config.env",
});

const MONGODB_URI = process.env.MONGODB_DATABASE;

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGODB_DATABASE,
  collection: "sessions",
});

const csrfProtection = csrf();




app.set("view engine", "ejs");
app.set("views", "views");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const mantanes = require("./routes/mantanes");
const { getMaxListeners } = require("./models/product");

app.use(cookieparser(process.env.COOKIS_SECRET));
// app.use(fileUpload())

Accessories.find()
  .then((accessories) => {
    app.locals.accessories = accessories

  }).catch(err => {
    console.log(err);

  })
 

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
// app.use(multer({storage: fileStorage ,fileFilter:fileFilter}).single('image'));
// app.use(multer({storage: multipaleStorage ,fileFilter:fileFilter}).array('sliderimage'));
app.use(express.static(path.join(__dirname, "public")));
app.use('/images',express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(flash());
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfTokenss = req.csrfToken();
  next();
});
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next()
      }
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});


app.use('/admin/*',(req, res, next) => {
  if (!req.session.admin) {
    return next();
  }
  Admin.findById(req.session.admin._id)
    .then(admin => {
      req.admin = admin;
      next();
    })
    .catch(err => console.log(err));
});



app.use("/admin", adminRoutes);

app.use(shopRoutes);
app.use(authRoutes);
app.use(mantanes);
app.get('/500',errorController.get500)

app.get('/:accessories',(req, res, next) => {
  const accessoriesSlug = req.params.accessories;
  const page = +req.query.page || 1;
  let totalItem;
  Accessories.findOne({ slug: accessoriesSlug }, function (err, c) {
    Product.find({ accessories: accessoriesSlug })
      .countDocuments()
      .then(numProduct => {
      totalItem = numProduct;
      return Product.find({ accessories :accessoriesSlug})
        .skip((page - 1) * ItemPerpage)
      .limit(ItemPerpage)
    }) .then(products => {
      
      
      return  res.render('shop/acces-product', {
        prods: products,
        pageTitle: '',
        path: '/products',
        currentPage :page,
        hasNextPage: ItemPerpage * page < totalItem,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage:Math.ceil(totalItem / ItemPerpage)
      });
      
    }) .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    }); 
  })
  
  
  
  
})
app.use((error, req, res, next) => {
  res.redirect('/500')
})
app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })

  .then((result) => {
    User.findOne().then(user => {
      if (!user) {
        bcrypt
          .hash("admin", 12)
          .then(hashedPassword => {
            let newuser =new User ({
              email: "admin12@gmail.com",
              password: hashedPassword,
              name: 'Sakib Hasan',
              phone: '01763553147',
              address: 'Dhata,gazipur',
              zip: '1700',
            
              cart: { items: [] },
              isAdmin:true
            })
            newuser.save();
          })
      }
    })
    app.listen(3000);
    console.log("server is running");
    
  })
  .catch((err) => {
    console.log(err);
  });
