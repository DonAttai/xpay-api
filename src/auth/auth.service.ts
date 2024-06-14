import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JsonWebTokenError, JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import * as bcrypt from "bcrypt";
import { User } from "src/users/entities/user.entity";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { MailService } from "src/mail/mail.service";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);

    const comparePassword = await bcrypt.compare(password, user?.password);

    if (user && (await bcrypt.compare(password, user.password))) return user;
    return null;
  }

  async login(user: Partial<User>) {
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    return {
      user,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.generateRefreshToken(user.id),
    };
  }

  async refreshToken(token: string) {
    const payload = await this.jwtService.verify(token, {
      secret: this.configService.get<string>("REFRESH_JWT_SECRET"),
    });
    const user = await this.userService.findUserById(payload.sub);

    if (!user) {
      throw new ForbiddenException("Invalid token");
    }
    return this.login(user);
  }

  // verify email
  async verifyEmail(data: { token: string; userId: number }) {
    const user = await this.userService.findUserById(data.userId);

    const secret =
      this.configService.get<string>("VERIFY_EMAIL_TOKEN_SECRET") +
      user?.isVerified;
    try {
      await this.jwtService.verify(data.token, { secret });
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    user.isVerified = true;
    await this.userService.saveUser(user);
    return { message: "Your email has been successfully verified, login" };
  }

  // reset password
  async resetPassword(data: {
    token: string;
    password: string;
    userId: number;
  }) {
    const user = await this.userService.findUserById(data.userId);

    if (!user) {
      throw new NotFoundException("user not found!");
    }

    const secret =
      this.configService.get<string>("FORGOT_PASSWORD_TOKEN_SECRET") +
      user?.password;

    try {
      await this.jwtService.verify(data.token, { secret });
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    user.password = await bcrypt.hash(data.password, 10);
    await this.userService.saveUser(user);
    return { message: "You have successfully changed your password" };
  }

  // forgot password
  async forgotPassword(email: string) {
    try {
      const user = await this.userService.findUserByEmail(email);
      if (!user) {
        return {
          message:
            "If email exist, a link has been sent to the email to reset password",
        };
      }

      const token = this.userService.generateToken(user);
      const HOSTNAME = this.userService.getHostName();
      const html = `<p>Hello, ${user.firstName.toUpperCase()}, click on the link below to reset your password: ${HOSTNAME}/reset-password?token=${token}&id=${
        user.id
      }
      </p>
      `;

      await this.mailService.sendTransactionalEmail(
        user,
        "Forgot Password",
        html,
      );

      return {
        message: "A link has been sent to email to reset your password",
      };
    } catch (error) {
      throw new HttpException(error.message, error.message);
    }
  }

  // change password
  async changePassword(data: ChangePasswordDto) {
    const user = await this.userService.findUserById(data.userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      throw new ForbiddenException("Invalid credentials!");
    }

    user.password = await bcrypt.hash(data.newPassword, 10);
    await this.userService.saveUser(user);

    return { message: "You have successfully changed your password!" };
  }

  // generate referesh token
  generateRefreshToken(userId: number) {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>("REFRESH_JWT_SECRET"),
      expiresIn: "7d",
    });
  }

  // set refresh token cookie
  setRefreshTokenCookie(refreshToken: string, res: Response) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Prevent client-side JavaScript access
      signed: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // Mitigate CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // Set cookie to expire in 7 days (matches refresh token expiration)
    });
  }
}
