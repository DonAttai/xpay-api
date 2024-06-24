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
  Req,
  Patch,
  Body,
  NotFoundException,
  HttpException,
  ForbiddenException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { Role, User } from "./entities/user.entity";
import { Response } from "express";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Roles } from "src/auth/decorators";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { ApiTags } from "@nestjs/swagger";
import { UpdateUserDto } from "./dto/update-user.dto";

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

  @Get(":id")
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  findUserById(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
    return this.usersService.findUserById(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateUser(
    @Body() body: UpdateUserDto,
    @Param("id", ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    if (req.user.id === id) {
      throw new ForbiddenException("You are not allowed to edit your details");
    }
    try {
      const user = await this.usersService.updateUser(id, body);
      return { message: "User update successful" };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException("user not found");
      }
      throw new HttpException(
        "Failed to update user",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // delete a user
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  removeUser(@Param("id", ParseIntPipe) id: number, @Res() res: Response) {
    this.usersService.deleteUserById(id);
    return res.status(HttpStatus.NO_CONTENT).json({});
  }
}
