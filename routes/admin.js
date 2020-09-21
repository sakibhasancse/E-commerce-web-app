const path = require('path');

const express = require('express');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const admin = require('../middleware/admin-isauth');
const {body}=require('express-validator/check');
const { CustomValidation } = require('express-validator/src/context-items');
const router = express.Router();
const multer = require('multer');
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/[\/\\:]/g, "_") + file.originalname)
  }
});
// const multipaleStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'sliderimages');
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString().replace(/[\/\\:]/g, "_") + file.originalname)
//   }
// });

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: fileStorage, fileFilter : fileFilter });



router.get('/order',isAuth, admin, adminController.eorder)
router.get('/order/:orderId',isAuth, admin, adminController.orderDetails)
router.post('/order/delete', isAuth, admin, adminController.postdeleteorder);

router.get('/index', isAuth, admin, adminController.adminindex)
router.get('/alluser', isAuth, admin, adminController.getalluser)
router.post('/delete-user', isAuth, admin, adminController.postdeleteuser)

router.get('/addallproduct',isAuth,admin,adminController.addallproduct)
// /admin/add-product => GET
router.get('/add-product', [
    body('title').isString().isLength({ min: 3}).withMessage('Tittle maximum 3'),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 600 }),
    
    

], isAuth, admin, adminController.getAddProduct);

// /admin/products => GET
router.get('/products',isAuth,admin, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',upload.any(),body('title').isLength({ min: 3 }),
body('price').isFloat(),
body('description').isLength({ min: 5 ,max:700}), isAuth,admin, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth,admin, adminController.getEditProduct);
router.post('/edit-product',upload.any(),
[
    body('title')
      .isString()
      .isLength({ min: 3 })
   ,
  
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 600 })
    
  ],
    isAuth, admin, adminController.postEditProduct);
router.post('/delete-product', isAuth, admin, adminController.postDeleteProduct);

router.post('/add-cetagory', isAuth,admin, adminController.postAddCetagory);
router.get('/add-cetagory', isAuth,admin, adminController.getAddCetagory);
router.post('/add-cetagory', isAuth, adminController.postAddCetagory);
router.get('/edit-cetagory/:catId',admin, isAuth, adminController.editeCetagory);
router.post('/edit-cetagory', isAuth, admin,adminController.postediteCetagory);
router.post('/delete-catagory', isAuth, admin, adminController.postdeleteCetagory);

router.post('/add-accessories', isAuth,admin, adminController.postAddAccessories);
router.get('/add-accessories', isAuth,admin, adminController.getAddAccessories);
router.post('/add-accessories', isAuth,admin, adminController.postAddAccessories);
router.get('/edit-accessories/:accsessId', admin,isAuth, adminController.editeAccessories);
router.post('/edit-accessories',admin, isAuth, adminController.postediteAccessories);
router.post('/delete-accessories', isAuth, admin, adminController.postdeleteAccessories);

router.post('/order/delivary',isAuth,admin,adminController.postorderDelivary)

router.get('/add-about', isAuth,admin, adminController.addgetAbouts);
router.post('/add-about', isAuth,admin, adminController.addpostaboutus);
router.get('/edit-about/:aboutId',admin, isAuth, adminController.editeAbout);
router.post('/edit-about',admin, isAuth, adminController.postediteAbout);
router.post('/delete-about', isAuth, admin, adminController.postdeleteAbout);



module.exports = router;
