const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  handle: String,
  title: String,
  body: String,
  vendor: String,
  type: String,
  tags: String,
  variantSKU: String,
  variantPrice: Number,
  imageSrc: String,
});

module.exports = mongoose.model('Product', productSchema);
