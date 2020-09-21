const Product = require('../models/product');
const Cetagory = require('../models/cetagory');
const Accessories = require('../models/accessories');
const About = require('../models/about');
const User = require('../models/user')
const Order = require('../models/order')
// const mkdir = require('mkdirp')
// const resizeImg = require('resize-image')
const { validationResult } = require('express-validator/check');
const { size } = require('lodash');
// const { Mongoose } = require('mongoose');
const fileHelper =require('../util/file')

const mongoose = require('mongoose');
const about = require('../models/about');


exports.getAddProduct = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  Accessories.find()
    .then(catago => {
      res.render('admin/addproduct', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        accessories: catago,
        hasError: false,
        errorMessage: message

      });
    })

};
exports.addallproduct = (req, res, next) => {
  res.render('admin/addallProduct')
}
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase()
  const imagess = req.files[0];
  const imagess1 = req.files[1];
  const imagess2 = req.files[2];
  const imagess3 = req.files[3];
  const size = req.body.size;
  const price = req.body.price;
  const description = req.body.description;
  // const imagess=req.files[0]
  const accessories = req.body.accessories;
  if (!imagess && !imagess1 && !imagess2) {
    return res.status(422).render('admin/addproduct', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        accessories: accessories,
        description: description,

      },

      errorMessage: 'Attached file is not an image ! pleass add more image',

    })
  }
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/addproduct', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,

        price: price,
        accessories: accessories,
        description: description,
        size: size
      },

      errorMessage: errors.array()[0].msg
    });

  }
  Product.findOne({ slug: slug }, function (err, product) {
    if (product) {
      req.flash('error', 'Product Alrady Exists Try Another One');
      console.log('Product Alrady Exists Try Another One');
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      Accessories.find().then(catago => {
        res.render('admin/addproduct', {
          pageTitle: 'Add Product',
          path: '/admin/add-product',
          editing: false,
          accessories: catago,
          hasError: false,
          errorMessage: message

        });
      })
    } else {
      const imagepath = imagess.path;
      const imagepath1 = imagess1.path;
      const imagepath2 = imagess2.path;
      const imagepath3 = imagess3.path;
      const product = new Product({
        // _id: new mongoose.Types.ObjectId('5ef77a53a6a87110f0c09c30'),
        title: title,
        slug: slug,
        price: price,
        description: description,
        image: imagepath,
        
        accessories: accessories,
        size: size,
        images: {
          imagesl: imagepath1,
          images2: imagepath2,
          images3: imagepath3,

        },
        userId: req.user
      });
      product
        .save().then(result => {
          console.log('Created Product');
          res.redirect('/admin/products');
        })   .catch(err => {
          console.log('somthing is problem');
    
          // return res.status(500).render('admin/addproduct', {
          //   pageTitle: 'Add Product',
          //   path: '/admin/add-product',
          //   editing: false,
          //   hasError: true,
          //   product: {
          //     title: title,
          //     price: price,
          //     accessories: accessories,
          //     description: description,
          //     size: size
          //   },
    
          //   errorMessage: 'Database operation faild ,please try again'
          // });
          // res.redirect('/500')
          const error = new Error(err);
          error.httpStatus = 500;
          return next(error)
    
        });
    }

  })
 
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }

  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/addproduct', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;


  // var slug = updatedTitle.replace(/\s+/g, '-').toLowerCase(); 

  const updatedPrice = req.body.price;
  ;
  const size = req.body.size
  const updatedDesc = req.body.description;
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/addproduct', {
      pageTitle: 'Edit Product',
      path: '/admin/add-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,

        price: updatedPrice,

        description: updatedDesc,

        _id: prodId
      },

      errorMessage: errors.array()[0].msg
    });
  }



  Product.findById(prodId)
    .then(product => {
      const imagess = req.files[0];

      const imagess1 = req.files[1];
      const imagess2 = req.files[2];
      const imagess3 = req.files[3]
      const imagepath = imagess.path;
      const imagepath1 = imagess1.path;
      const imagepath2 = imagess2.path;
      const imagepath3 = imagess3.path;
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.size = size;
      product.slug = updatedTitle.replace(/\s+/g, '-').toLowerCase()
      if (imagess) {
        fileHelper.deleteFile(product.image)
        product.image = imagepath;
      }


      fileHelper.deleteFile(  product.images.imagesl)
      product.images.imagesl = imagepath1;
      fileHelper.deleteFile(  product.images.images2)
      product.images.images2 = imagepath2;
      fileHelper.deleteFile(  product.images.images3)
      product.images.images3 = imagepath3;



      return product.save();
    })
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
};

exports.getAddAccessories = (req, res, next) => {
  Accessories.find()
    .then(accessories => {
      res.render('admin/add-accessories', { path: '/admin/add-accessories', pageTitle: 'Add accessories', accessories: accessories, editing: false })
    })
    .catch(err => {
      console.log(err);

    })


}
exports.postAddAccessories = (req, res, next) => {
  const title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase()

  Accessories.findOne({ title: title }).then(result => {
    if (result) {
      console.log('this title alrady created');
      return res.redirect('/admin/add-accessories')
    }
    const accessories = new Accessories({
      title: title,
      slug: slug

    })
    return accessories.save()
  }).then(result => {
    res.redirect('/admin/add-accessories')
  })
  .catch((err) => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  });


}
exports.editeAccessories = (req, res, next) => {
  const editingMOde = req.query.edit;
  if (!editingMOde) {
    console.log('this is not editing mode');

    return res.redirect('/')
  }
  const catId = req.params.accsessId;
  Accessories.findById(catId).then(acce => {
    if (!acce) {
      console.log('ther is no accesssoris');

      return res.redirect('/')
    }
    res.render('admin/add-accessories',
      { pageTitle: 'edite accessories', path: '/accessories', accessories: acce, editing: editingMOde })
  }) .catch((err) => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  });

}
exports.postediteAccessories = (req, res, next) => {
  const catId = req.body.accsessId;
  const updatetitle = req.body.title;

  Accessories.findById(catId)
    .then(accessories => {
      accessories.title = updatetitle;

      return accessories.save();

    }).then(result => {
      console.log('update Succesfully');
      res.redirect('/admin/add-accessories')
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });

}

exports.postdeleteAccessories = (req, res, next) => {
  const catId = req.body.catId;
  Accessories.findByIdAndRemove(catId)
    .then(result => {
      if (!result) {
        return res.redirect('/')
      }
      res.redirect('/admin/add-accessories')
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
}
exports.getAddCetagory = (req, res, next) => {
  Cetagory.find()
    .then(cetagory => {
      res.render('admin/add-cetagory', { path: '/admin/add-cetagory', pageTitle: 'Add cetagory', cetagory: cetagory, editing: false })
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });


}
exports.postAddCetagory = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  Cetagory.findOne({ title: title }).then(result => {
    if (result) {
      console.log('this title alrady created');
      return res.redirect('/admin/add-cetagory')
    }
    const cetagory = new Cetagory({
      title: title,
      imageUrl: imageUrl
    })
    return cetagory.save()
  }).then(result => {
    res.redirect('/admin/add-cetagory')
  })
  .catch((err) => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  });

}
exports.editeCetagory = (req, res, next) => {
  const editing = req.query.edit;
  if (!editing) {
    return res.redirect('/')
  }
  const catId = req.params.catId;
  Cetagory.findById(catId).then(cetagory => {
    if (!cetagory) {
      return res.redirect('/')
    }
    res.render('admin/add-cetagory',
      { pageTitle: 'edite cetagory', path: '/cetagory', cetagory: cetagory, hasError: false, editing: editing })
  }) .catch((err) => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  });

}
exports.postediteCetagory = (req, res, next) => {
  const catId = req.body.catId;
  const updatetitle = req.body.title;
  const updateimageUrl = req.body.imageUrl

  Cetagory.findById(catId)
    .then(cetagory => {
      cetagory.title = updatetitle;
      cetagory.imageUrl = updateimageUrl;
      return cetagory.save();

    }).then(result => {
      console.log('update Succesfully');
      res.redirect('/admin/add-cetagory')
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });

}
exports.postdeleteCetagory = (req, res, next) => {
  const catId = req.body.catId;
  Cetagory.findByIdAndRemove(catId)
    .then(result => {
      if (!result) {
        return res.redirect('/')
      }
      res.redirect('/admin/add-cetagory')
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
}


exports.addpostaboutus = (req, res, next) => {
  const description = req.body.description
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  About.findOne({ title: title }).then(result => {
    if (result) {
      console.log('this title alrady created');
      return res.redirect('/admin/add-cetagory')
    }
    const about = new About({
      title: title,
      imageUrl: imageUrl,
      description: description
    })
    return about.save()
  }).then(result => {
    res.redirect('/admin/add-about')
  })
  .catch((err) => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  });

}
exports.addgetAbouts = (req, res, next) => {
  About.find().then(about => {
    res.render('admin/addAbout', { path: '/admin/add-about', pageTitle: 'admin  About Us', about: about, editing: false })
  }).catch(err => {
    console.log(err);

  })

}
exports.adminindex = (req, res, next) => {
  res.render('admin/index', { pageTitle: '' });
}

exports.getalluser = (req, res, next) => {
  User.find().then(user => {
    res.render('admin/userTable', { pageTitle: '', user: user });

  }) .catch((err) => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  });
}
exports.postdeleteuser = (req, res, next) => {
  const usersid = req.body.users;
  User.findByIdAndRemove(usersid)
    .then(result => {
      if (!result) {
        return res.redirect('/')
      }
      res.redirect('/admin/alluser')
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
}
exports.editeAbout = (req, res, next) => {
  const editing = req.query.edit;
  if (!editing) {
    return res.redirect('/')
  }
    const catId = req.params.aboutId;
  About.findById(catId).then(about => {
    if (!about) {
        return res.redirect('/')
      }
      res.render('admin/addAbout',
        { pageTitle: 'edite about', path: '/about', about: about  , editing:editing})
    }).catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });

}
exports.postediteAbout = (req, res, next) => {
  const abId = req.body.aboutId;
 
  About.findById(abId)
  .then(about => {
    console.log(about);
      about.title = req.body.title;
      about.imageUrl = req.body.imageUrl;
      about.description = req.body.description;
      return about.save();
      

    }).then(result => {
      console.log('update Succesfully');
      res.redirect('/admin/add-about')
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });

}


exports.postdeleteAbout = (req, res, next) => {
  const aboutID = req.body.aboutId;
  About.findByIdAndRemove(aboutID)
    .then(result => {
      if (!result) {
        return res.redirect('/')
      }
      res.redirect('/admin/add-about')
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
}



exports.eorder = (req, res, next) => {
  Order.find().then(order => {
    let orders =order.products
    res.render('admin/order',{order:order ,orders:orders})
    
  }).catch((err) => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  })
}
exports.postorderDelivary = (req, res, next) => {
 const orderId =req.body.orderId
  Order.findByIdAndUpdate({_id:orderId},{"delivery":"true"}).then(order => {
    if (order) {
    res.redirect('/admin/order')  
    }
 
  }).catch((err) => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  });
}

exports.postdeleteorder = (req, res, next) => {
  const orderId = req.body.orderId;
  Order.findByIdAndRemove(orderId).then(result => {
    if (!result) {
      return res.redirect('/')
    }
    res.redirect('/admin/order')
  }).catch(err => {
    console.log(err);
    
  })
}
exports.orderDetails = (req, res, next) => {
  const orderId = req.params.orderId
  Order.findById(orderId)
  
    .then(result => {
      console.log(result);
      let userss =result.user.userId
      User.findById(userss).then(info => {
        console.log(result);
        console.log(info);
        
       
        res.render('admin/manage-order', { order: result ,userInfo:info })
        
      }).catch((err) => {
        const error = new Error(err);
        error.httpStatus = 500;
        return next(error)
      });
      
    //   const userInformation = result.user.map(i => {
    //     return {usersids:{...i.userId._doc}}
    //   })
    // //   result.populate('user.userId')
    // //     .execPopulate()
    // //     .then(user => {
    // //       const userInformation = user.userId.map(i => {
    // //         return { user: { ...i.user._doc } };
              
    // //       })
    //       console.log(userInformation);
    // // })
  
    
  }).catch((err) => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  });
}
    
// }
// .populate('user.userId')
// .execPopulate()
//     .then(user => {
//       const userInformation = user.map(i => {
//         return {  user: { ...i.user._doc } };
//       });
//       console.log(userInformation);
      

