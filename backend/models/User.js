const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,      // ek hi email bar-bar nahi
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,      // kam se kam 6 char
    },
  },
  { timestamps: true }   // createdAt, updatedAt auto add
);

module.exports = mongoose.model('User', userSchema);
