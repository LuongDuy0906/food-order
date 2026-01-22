import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>
  ){}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepo.create(createUserDto);
    const savedUser = await this.userRepo.save(newUser);
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepo.find();
    return users;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: {
        email: email,
      }
    });

    if(!user){
      throw new NotFoundException("Khong tim thay nguoi dung voi email: " + email);
    }

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
