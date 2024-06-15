import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { UsersService } from "src/users/users.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { SignInDto } from "./dto/signin-user.dto";
import { RequestObject } from "src/types/express";
import { ChangePasswordDto } from "./dto/change-password.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  // login
  @Post("login")
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  async signIn(
    @Body() signInDto: SignInDto,
    @Req() req: RequestObject,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userData, refreshToken } = await this.authService.login(req.user);
    this.authService.setRefreshTokenCookie(refreshToken, res);

    return userData;
  }

  // create user
  @Post("register")
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(201)
  async signUp(@Body() body: CreateUserDto) {
    try {
      return await this.usersService.signUp(body);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new BadRequestException("Email already in use ");
      }
      await this.usersService.deleteUserByEmail(body.email);
      throw new InternalServerErrorException("User registration failed");
    }
  }

  // refresh token
  @Post("refresh")
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.signedCookies["refreshToken"];
    if (!refreshToken) {
      throw new ForbiddenException();
    }
    const result = await this.authService.refreshToken(refreshToken);
    this.authService.setRefreshTokenCookie(result.refreshToken, res);
    return { accessToken: result.userData.accessToken };
  }

  // forgot password
  @Post("forgot-password")
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  // reset password
  @Post("reset-password")
  async resetPassword(
    @Body() body: { password: string; token: string; id: string },
  ) {
    return this.authService.resetPassword({ ...body, userId: Number(body.id) });
  }

  // verify email
  @Post("verify-email")
  async verifyEmail(@Body() body: { token: string; id: string }) {
    return this.authService.verifyEmail({
      ...body,
      userId: Number(body.id),
    });
  }

  // change password
  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: RequestObject,
  ) {
    return this.authService.changePassword({
      ...changePasswordDto,
      userId: req.user.id,
    });
  }
}
