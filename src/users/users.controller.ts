import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  Delete,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Response } from 'express';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return new User(await this.usersService.createUser(createUserDto));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getUsers() {
    const users = await this.usersService.getUsers();
    return users.map((user) => new User(user));
  }

  @Delete(':id')
  async removeUser(@Param('id') id: string, @Res() res: Response) {
    await this.usersService.removeUser(id);
    return res.status(HttpStatus.NO_CONTENT).json({});
  }
}
