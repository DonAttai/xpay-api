import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local-auth.guard";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { UsersService } from "src/users/users.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { ApiTags } from "@nestjs/swagger";
import { User } from "src/users/entities/user.entity";
import { Request } from "express";
import { SignInDto } from "./dto/signin-user.dto";
import { RequestObject } from "src/types/express";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(200)
  async signIn(@Body() signInDto: SignInDto, @Req() req: Request) {
    return await this.authService.login(req.user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post("register")
  @HttpCode(201)
  async signUp(@Body() createUserDto: CreateUserDto) {
    return new User(await this.usersService.signUp(createUserDto));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get("profile")
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
