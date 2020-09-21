const Product = require('../models/product');
const Order = require('../models/order');
const Cetagory = require('../models/cetagory');
const path = require('path')
const fs = require('fs')
require("dotenv").config({
  path: "./config/config.env",
});
const PDFDoc = require('pdfkit');
const session = require('express-session');
const stripe =require('stripe')(process.env.STRIP_SECRATKEY)
const ItemPerpage = 10;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;

  let totalItem;
  Product.find().countDocuments().then(numProduct => {
    totalItem = numProduct
    return Product.find()
      .skip((page - 1) * ItemPerpage)
      .limit(ItemPerpage)
  }).then(products => {
    console.log(products);
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
      currentPage: page,
      hasNextPage: ItemPerpage * page < totalItem,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItem / ItemPerpage)
    });
  })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
};
module.exports.getaccessories = ((req, res, next) => {
  res.render('shop/accessories', {
    pageTitle: 'Accessories',
    path: '/products'
  })
})



exports.getProduct = (req, res, next) => {

  const prodId = req.params.productId;
  Product.findById(prodId)

    .then(product => {
      product.populate('images')
        .execPopulate()
      const prod = product.images
      res.render('shop/product-detail', {
        product: product,
        prod: prod,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
};

exports.getIndex = (req, res, next) => {

  Cetagory.find()

    .then(cet => {
      res.render('shop/index', {
        cetagory: cet,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
};

exports.getcheckoutsucsess = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
};


exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
};

exports.getOrderDetails = (req, res, next) => {

  const orderId = req.params.orderId;
  Order.findById(orderId).then(order => {
    if (!order) {
      return next(new Error('No Order Found'))
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorized'))

    }
    const DetailsName = 'details-' + orderId + '.pdf'
    const detailspath = path.join('data', 'inv', DetailsName)
    const pdfDoc = new PDFDoc()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline;filename="' + DetailsName + '"')

    pdfDoc.pipe(fs.createWriteStream(detailspath));
    pdfDoc.pipe(res);
  //   pdfDoc.image('data/inv/JPG.jpg', {
  //     fit: [250, 300],
      
  //  });
    pdfDoc.save()
    
    .fill("#FF3300");
    pdfDoc.fontSize(20).text('Your Order Information');
    pdfDoc.fontSize(14).text('----------------------------------');
    let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice += prod.quantity * prod.product.price
      pdfDoc.fontSize(14).text(
      prod.product.title + ' - ' + prod.quantity + ' x ' + ' $' + prod.product.price)
    });
    pdfDoc.fontSize(14).text ('-----')

    pdfDoc.fontSize(20).text ('Total Price: $' +totalPrice)
    pdfDoc.end()
    // fs.readFile(detailspath, (err, data) => {
    //   if (err) {
    //     return next(err)
    //   }
    //   res.setHeader('Content-Type','application/pdf')
    //   res.send(data)
    // })

  }).catch(err => {
    next(err)

  })



}

exports.checkout = (req, res, next) => {
  let products;
  let total = 0;
  const name = req.body.name
console.log(name);

  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user => {
  products = user.cart.items;
     total = 0;
    products.forEach(p => {
      total +=p.quantity * p.productId.price
    })


    
    return stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: products.map(p => {
        // console.log(req.body)
        return {
          name: p.productId.title,
          description: p.productId.description,
          amount: p.productId.price * 100,
          
          currency: 'usd',
          quantity: p.quantity,
          address:req.body.adress1
          // images:p.productId.image
        }
      }),
      success_url:req.protocol + '://'+req.get('host') + '/checkout/success',
      cancel_url :req.protocol + '://'+req.get('host') + '/checkout/cancel'

    })
    
    // console.log(line_items);
 
  }).then(session=> {
    res.render('shop/checkout', {
      path: '/checkout',
      pageTitle: 'Checkout',
      products: products,
      totalSum: total,
      sessionId:session.id
    });
  })
  .catch((err) => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  });
}


exports.travel = (req, res, next) => {

  res.render('shop/commingsoon', {
    path: '/travel',
    pageTitle: 'Travel',

  });

};
exports.interior = (req, res, next) => {

  res.render('shop/commingsoon', {
    path: '/interior',
    pageTitle: 'interior Design',

  });

};

