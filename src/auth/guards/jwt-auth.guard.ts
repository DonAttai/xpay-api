import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      // Handle errors here (e.g., throw custom exceptions)
      if (info?.message) {
        throw new UnauthorizedException(info.message);
      }
      throw new UnauthorizedException("Unauthorized");
    }
    return user; // Pass the authenticated user to the route handler
  }
}
