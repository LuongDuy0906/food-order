import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res, UploadedFiles, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PostDTO } from './dto/postDto.dto';
import { GetDTO } from './dto/getDto.dto';
import { Product } from './entities/products.entity';
import type { Response } from 'express';
import { PutDTO } from './dto/putDto.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/common/utils/file-upload.utils';

@Controller('products')
export class ProductsController {
    constructor(private readonly productService: ProductsService) {}

    @Get("/")
    async getAll(): Promise<GetDTO[]>{
        const products = await this.productService.getAll();
        return products.map(product => new GetDTO(product));
    }

    @Post("/")
    @UseInterceptors(FilesInterceptor('images', 5, {
        storage: diskStorage({
                destination: './upload/products',
                filename: editFileName
            }),
            fileFilter: imageFileFilter,
        }),
    )
    async add(@Body() body: PostDTO, @UploadedFiles() files: Express.Multer.File[], @Res() res: Response ){
        let product: Product;
        try{
            product = await this.productService.createProducts(body, files);
            return res.status(HttpStatus.CREATED).json({message: "Tạo sản phẩm thành công", product: new GetDTO(product)});
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({message: error.message});
        }
    }

    @Get('/:id')
    async getOneById(@Param('id') id: number, @Res() res: Response){
        let product: Product;
        try {
            product = await this.productService.getOneById(id);
            return res.status(HttpStatus.OK).json(new GetDTO(product));
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({error: error.message});
        }
    }

    @Put('/:id')
    async update(@Param('id') id: number, @Body() body: PutDTO, @Res() res: Response){
        let product: Product;
        try {
            product = await this.productService.updateProduct(id, body);
            return res.status(HttpStatus.ACCEPTED).json(new GetDTO(product));
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({error: error.message});
        }
    }

    @Delete('/:id')
    async delete(@Param('id') id: number, @Res() res: Response){
        try {
            await this.productService.deleteProduct(id);
            return res.status(HttpStatus.OK).json({message: "Xóa sản phẩm thành công"});
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({error: error.message});
        }
    }
}
