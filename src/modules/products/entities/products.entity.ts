import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./productsImage.entity";

@Entity()
export class Product{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('decimal', {default: 0})
    quantity: number;

    @OneToMany(() => ProductImage, (productImage) => productImage.product)
    productImage: ProductImage[];
}