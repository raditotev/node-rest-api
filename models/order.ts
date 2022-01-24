import { Schema, Types, model } from 'mongoose';

interface Order {
  quantity: number;
  pid: Types.ObjectId;
}

const orderSchema = new Schema<Order>({
  quantity: { type: Number, required: true },
  pid: { type: Types.ObjectId, required: true, ref: 'Product' },
});

export default model<Order>('Order', orderSchema);
