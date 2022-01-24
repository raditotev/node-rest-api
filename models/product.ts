import { Schema, model } from 'mongoose';

interface Product {
  name: string;
  price: number;
  image?: string;
}

const productSchema = new Schema<Product>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
});

export default model<Product>('Product', productSchema);
