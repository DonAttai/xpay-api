import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // get all users
  async getUsers(): Promise<any> {
    const users = await this.usersRepository.find();
    return users;
  }

  // find one  user
  async findUser(email: string): Promise<User | undefined> {
    return await this.usersRepository.findOneBy({ email });
  }

  // create user
  async createUser(createUserDto: CreateUserDto): Promise<any> {
    // check if user exists
    const isUser = await this.findUser(createUserDto.email);

    if (isUser) {
      throw new ConflictException('User exists!');
    }
    // hash password
    const salt = await bcrypt.genSalt(10);
    createUserDto.password = await bcrypt.hash(createUserDto.password, salt);

    // create  & save user
    const user = this.usersRepository.create(createUserDto);
    const newUser = await this.usersRepository.save(user);

    // eslint-disable-next-line no-unused-vars
    const { password, ...result } = newUser;
    return result;
  }
}
