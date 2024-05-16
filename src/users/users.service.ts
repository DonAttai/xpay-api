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
    return await this.usersRepository.find({});
  }

  // find a single user
  async findUser(email: string): Promise<User> {
    return await this.usersRepository.findOneBy({ email });
  }

  //Find a user by id
  async findUserById(userId: number) {
    return await this.usersRepository.findOneBy({ id: userId });
  }

  // get user with wallet
  async getUserWithWallet(userId: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['wallet'],
    });
    if (!user) {
      return undefined;
    }
    return user;
  }

  // found user wallet
  async fundWallet(userId: number, amount: number) {
    const user = await this.getUserWithWallet(userId);
    user.wallet.balance = +user.wallet.balance + amount;
    return await this.usersRepository.save(user);
  }

  // create user
  async signUp(createUserDto: CreateUserDto): Promise<User> {
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
  async removeUser(id: number): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    await this.usersRepository.delete(id);
  }
}
