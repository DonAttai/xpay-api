import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard("jwt-refresh") {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info instanceof Error) {
      throw new ForbiddenException("expired_refresh_token");
    }

    console.log("outside");

    return super.handleRequest(err, user, info, context, status);
  }
}
