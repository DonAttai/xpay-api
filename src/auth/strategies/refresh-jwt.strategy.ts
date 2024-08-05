import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { UsersService } from "src/users/users.service";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(
    configService: ConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token = null;
          if (req && req.signedCookies) {
            token = req.signedCookies["refreshToken"];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("REFRESH_JWT_SECRET"),
    });
  }

  async validate(payload: { sub: number }) {
    const user = await this.userService.findUserById(payload.sub);
    return { id: user.id, email: user.email, roles: user.roles };
  }
}
