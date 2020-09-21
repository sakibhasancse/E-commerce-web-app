const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
router.get('/', shopController.getIndex);

router.get('/products/:productId', shopController.getProduct);

router.get('/products', shopController.getProducts);


router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);



router.get('/orders', isAuth, shopController.getOrders);
router.get('/orders/:orderId', isAuth, shopController.getOrderDetails);
router.get('/checkout', isAuth, shopController.checkout);
// router.post('/checkout', isAuth, shopController.postcheckout);
router.get('/checkout/success', isAuth, shopController.getcheckoutsucsess);
router.get('/checkout/cancel', isAuth, shopController.checkout);

router.get('/interior', shopController.interior);
router.get('/travel', shopController.travel);
  router.get('/accessories',shopController.getaccessories);



module.exports = router;
