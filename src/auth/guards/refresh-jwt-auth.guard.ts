import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard("jwt-refresh") {
  handleRequest(err: any, user: any, info: any, context: any) {
    if (err || !user) {
      throw new ForbiddenException("expired refresh token");
    }
    return user;
  }
}
