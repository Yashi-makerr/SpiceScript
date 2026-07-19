const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // guest orders allowed
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },

    // list of items
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        customization: {
          breadOrCrust: String,
          toppings: [String]
        }
      }
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ['cod', 'card', 'upi'],
      required: true,
      default: 'cod',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },

    cardDetails: {
      cardHolder: String,
      last4: String,
    },

    transactionId: {
      type: String,
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'preparing', 'delivered', 'cancelled'],
      default: 'pending',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
