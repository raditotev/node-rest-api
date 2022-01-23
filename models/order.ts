import { Schema, Types, model } from 'mongoose';

const orderSchema = new Schema({
  quantity: { type: Number, required: true },
  pid: { type: Types.ObjectId, required: true, ref: 'Product' },
});

export default model('Order', orderSchema);
