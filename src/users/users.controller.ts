import {
  Controller,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Delete,
  Param,
  Res,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { Role, User } from "./entities/user.entity";
import { Response } from "express";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Roles } from "src/auth/decorators";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("User")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // get all users => only admin
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUsers() {
    const users = await this.usersService.getUsers();
    return users.map((user) => new User(user));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(":id")
  @UseGuards(JwtAuthGuard)
  findUserById(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findUserById(id);
  }

  // delete a user
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  removeUser(@Param("id", ParseIntPipe) id: number, @Res() res: Response) {
    this.usersService.deleteUserById(id);
    return res.status(HttpStatus.NO_CONTENT).json({});
  }
}
