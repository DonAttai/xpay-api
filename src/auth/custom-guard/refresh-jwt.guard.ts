import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { UsersService } from "src/users/users.service";

@Injectable()
export class RefreshJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new ForbiddenException("No auth token");
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.REFRESH_JWT_SECRET,
      });
      const user = await this.userService.findUserById(payload.sub);
      request.user = user;
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
    return true;
  }

  private extractTokenFromCookie(req: Request) {
    let token = null;
    if (req.signedCookies) {
      token = req.signedCookies.refreshToken;
    }
    return token;
  }
}
