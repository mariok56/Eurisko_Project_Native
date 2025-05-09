export interface ProductImage {
  url: string;
  _id: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: ProductImage[];
}