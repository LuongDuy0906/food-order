import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./products.entity";

@Entity("product_images")
export class ProductImage{
    @PrimaryGeneratedColumn()
    id: number;

   @Column()
   url: string;
   
   @Column()
   isPrimary: boolean;

   @ManyToOne(() => Product, (product) => product.productImage, {onDelete: 'CASCADE'})
   product: Product;

}