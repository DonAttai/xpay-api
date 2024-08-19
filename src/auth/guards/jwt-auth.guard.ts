import { Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenExpiredError } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
