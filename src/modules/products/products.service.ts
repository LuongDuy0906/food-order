import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PostDTO } from './dto/postDto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/products.entity';
import { PutDTO } from './dto/putDto.dto';
import { ProductImage } from './entities/productsImage.entity';
import * as fs from 'fs';
import { join } from 'path';

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

    async updateProduct(id: number, putDto: PutDTO, files: Express.Multer.File[]){
        const query = this.datasource.createQueryRunner();
        query.connect();
        query.startTransaction();
        
        const newFileUpload: string[] = [];
        try {
            const product = await query.manager.findOne(Product, {
                where: {
                    id: id,
                },
                relations: ['productImage'],
            });

            if(!product){
                throw new NotFoundException("Không tìm thấy sản phẩm");
            };

            const newImages = files.map(file => {
                newFileUpload.push(file.path);
                return query.manager.create(ProductImage, {
                    url: file.path,
                    product: product
                });
            });
            await query.manager.save(ProductImage, newImages);

            let imagesToDelete: ProductImage[] = [];
            let imagesToKeep: ProductImage[] = [];
            const idsToKeep = putDto.idToKeep ? (Array.isArray(putDto.idToKeep) ? putDto.idToKeep.map(Number) : [Number(putDto.idToKeep)]) : [];
            if(putDto.idToKeep !== undefined){
                imagesToDelete = product.productImage.filter(
                    images => !idsToKeep.includes(images.id)
                )
                imagesToKeep = product.productImage.filter(
                    images => idsToKeep.includes(images.id)
                )
            };

            product.productImage = [...newImages, ... imagesToKeep];
            Object.assign(product, {
                ...(putDto.name && {name: putDto.name}),
                ...(putDto.quantity && {quantity: putDto.quantity})
            });
            
            await query.manager.save(product);

            for(const image of imagesToDelete){
                await query.manager.delete(ProductImage, image.id);
            }

            const newProduct = await query.manager.findOne(Product, {
                where: {
                    id: id,
                },
                relations: ['productImage'],
            });

            await query.commitTransaction();

            for(const image of imagesToDelete){
                const filePath = join(process.cwd(), image.url);
                if(fs.existsSync(filePath)){
                    fs.unlinkSync(filePath);
                }
            }

            return newProduct;
        } catch (error) {
            await query.rollbackTransaction();
            newFileUpload.forEach(path => fs.existsSync(path) && fs.unlinkSync(path));
            throw new InternalServerErrorException("Lỗi khi cập nhật sản phẩm: " + error.message);
        } finally {
            await query.release();
        }
    }

    async deleteProduct(id: number){
        const query = this.datasource.createQueryRunner();
        query.connect();
        query.startTransaction();
        
        try {
            const product = await query.manager.findOne(Product, {
                where: {
                    id: id,
                },
                relations: ['productImage'],
            })

            console.log(product);

            if(!product){
                throw new NotFoundException("Không tìm thấy sản phẩm");
            }

            const result = await query.manager.delete(Product, id);

            if(product.productImage.length > 0){
                for(const image of product.productImage){
                    const filePath = join(process.cwd(), image.url);
                    if(fs.existsSync(filePath)){
                        fs.unlinkSync(filePath)
                    }
                }
            }

            await query.commitTransaction();
            return result;
        } catch (error) {
            await query.rollbackTransaction();
            throw new InternalServerErrorException("Lỗi xảy ra khi xóa sản phẩm: " + error.manager);
        }
        finally{
            await query.release();
        }
    }
}
