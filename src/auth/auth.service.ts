import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findUser(email);
    if (!user) {
      throw new NotFoundException("User not found!");
    }
    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword)
      throw new UnauthorizedException("Invalid credentials!");
    if (user && comparePassword) return user;
    return null;
  }

  async login(user: any): Promise<{ accessToken: string }> {
    const payload = { sub: user.id, email: user.email, roles: user.roles };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
