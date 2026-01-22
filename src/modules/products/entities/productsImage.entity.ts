import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./products.entity";

@Entity("product_images")
export class ProductImage{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;
   
    @Column({nullable: true})
    isPrimary: boolean;

    @ManyToOne(() => Product, (product) => product.productImage, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'productId'})
    product: Product;

}