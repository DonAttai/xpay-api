import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findUser(email);
    if (!user) {
      throw new NotFoundException('User does not exits!');
    }
    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      throw new UnauthorizedException('Invalid credentials!');
    }
    if (user && comparePassword) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const { firstName, lastName, isActive, roles } = user;

    return {
      accessToken: this.jwtService.sign(payload),
      firstName,
      lastName,
      isActive,
      roles,
    };
  }
}
