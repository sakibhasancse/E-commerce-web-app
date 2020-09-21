const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  delivery: {
    type: Boolean,
    default:false,
  },
  userOrderIn: [{
    firstname: {
      type:String
    },
    phone: {
      type: String
    }
    ,
    email: {
      type:String
    },
    adress1: {
      type:String
    },
    adress2: {
      type:String
    },
    zip: {
      type:String
    }
  }],
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
     
    }
  ],
 
  user: {
    email: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  }
});

module.exports = mongoose.model('Order', orderSchema);
