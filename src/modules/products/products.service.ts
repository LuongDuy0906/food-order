import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PostDTO } from './dto/postDto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/products.entity';
import { PutDTO } from './dto/putDto.dto';
import { ProductImage } from './entities/productsImage.entity';
import * as fs from 'fs';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepo: Repository<Product>,
        private datasource: DataSource
    ) {}

    async getAll(): Promise<Product[]>{
        return await this.productRepo.find({relations: ['productImage']});
    }

    async createProducts(postDto: PostDTO, files: Express.Multer.File[]): Promise<Product>{
        const query = this.datasource.createQueryRunner();
        await query.connect();
        await query.startTransaction();
        try {
            const product = query.manager.create(Product, {
                name: postDto.name,
                quantity: postDto.quantity
            })
            const saveProduct = await query.manager.save(product);

            const productImages = files.map((file, index) => {
                return query.manager.create(ProductImage, {
                    url: file.path,
                    isPrimary: index === 0,
                    product: saveProduct
                });
            });

            await query.manager.save(ProductImage, productImages);

            await query.commitTransaction();
            return saveProduct;
        } catch (error) {
            await query.rollbackTransaction();

            files.forEach(file => {
                if(!fs.existsSync(file.path)){
                    fs.unlinkSync(file.path);
                }
            })

            throw new InternalServerErrorException("Lỗi khi tạo sản phẩm: " + error.message);
        } finally {
            await query.release();
        }
        
    }

    async getOneById(id: number): Promise<Product>{
        let product = await this.productRepo.findOne({where: {
            id: id
        }, relations: ['productImage']});
        if(!product){
            throw new NotFoundException("Không tìm thấy sản phẩm với id");
        }
        return product; 
    }

    async updateProduct(id: number, putDto: PutDTO){
        let result = await this.productRepo.update({id}, putDto);
        if(result.affected === 0){
            throw new NotFoundException("Không tìm thấy sản phẩm")
        }

        let product = await this.productRepo.findOneBy({id});
        if(!product){
            throw new NotFoundException("Không tìm thấy sản phẩm");
        }

        return product;
    }

    async deleteProduct(id: number){
        let result = await this.productRepo.delete({id});
        return result
    }
}
