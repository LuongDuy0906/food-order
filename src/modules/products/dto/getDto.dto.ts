import { Product } from "../entities/products.entity";
import { ProductImage } from "../entities/productsImage.entity";

export class GetDTO{
    name: string;
    quantity: number;
    productImage: ProductImage[];

    constructor(product: Product){
        this.name = product.name;
        this.quantity = product.quantity;
        this.productImage = product.productImage;
    }
}