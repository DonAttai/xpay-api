import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.user.id === +request.params.userId) return true;
    return false;
  }
}
