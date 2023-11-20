import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
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
  async getUsers(): Promise<User[]> {
    const users = await this.usersRepository.find({
      relations: {
        wallet: true,
      },
    });
    return users;
  }

  // find a single user
  async findUser(email: string): Promise<User> {
    return await this.usersRepository.findOneBy({ email });
  }

  //Find a user by id
  async findUserById(id: string) {
    return await this.usersRepository.findOneBy({ id });
  }

  // create user
  async createUser(createUserDto: CreateUserDto): Promise<User> {
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
    return newUser;
  }

  // Remove a user
  async removeUser(id: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    await this.usersRepository.delete(id);
  }
}
