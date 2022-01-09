const { Schema, Types, model } = require('mongoose');

const orderSchema = new Schema({
  quantity: { type: Number, required: true },
  pid: { type: Types.ObjectId, required: true, ref: 'Product' },
});

module.exports = model('Order', orderSchema);
