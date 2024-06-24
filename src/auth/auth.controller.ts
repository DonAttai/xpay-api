import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  ForbiddenException,
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
import { Response } from "express";
import { SignInDto } from "./dto/signin-user.dto";
import { RequestObject } from "src/types/express";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { RefreshJwtAuthGuard } from "./guards";
import { User } from "src/users/entities/user.entity";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  // login
  @UseInterceptors(ClassSerializerInterceptor)
  @Post("login")
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  async signIn(
    @Body() signInDto: SignInDto,
    @Req() req: RequestObject,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user.isVerified || !req.user.isActive) {
      throw new ForbiddenException("User not verified or deactivated");
    }

    const { userData, refreshToken } = await this.authService.login(req.user);
    this.authService.setRefreshTokenCookie(refreshToken, res);
    return new User(userData);
  }

  // create user
  @Post("register")
  @HttpCode(201)
  async signUp(@Body() body: CreateUserDto) {
    try {
      return await this.usersService.signUp(body);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new BadRequestException("Email already in use ");
      }
      // delete user
      await this.usersService.deleteUserByEmail(body.email);
      throw new InternalServerErrorException("User registration failed");
    }
  }

  // refresh token
  @Post("refresh")
  @UseGuards(RefreshJwtAuthGuard)
  async refreshAccessToken(@Req() req: RequestObject) {
    const { userData } = await this.authService.refreshAccessToken(req.user);
    return { accessToken: userData.accessToken };
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

  @Post("logout")
  async logout(@Res() res: Response) {
    res.cookie("refreshToken", "", {
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  }
}
