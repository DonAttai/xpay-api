import { Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenExpiredError } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException("expired_token");
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
