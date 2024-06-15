import {
  Injectable,
  ConflictException,
  NotFoundException,
  HttpException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
import { MailService } from "src/mail/mail.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private mailService: MailService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  // get all users
  async getUsers(): Promise<User[]> {
    return await this.usersRepository.find({});
  }
  async findUserByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOneBy({ email });
  }

  // find a single user
  async findUserWithWalletByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ["wallet"],
    });
  }

  //Find a user by id
  async findUserById(userId: number) {
    return await this.usersRepository.findOneBy({ id: userId });
  }

  // get user with wallet
  async getUserWithWallet(userId: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ["wallet"],
    });

    return user;
  }

  // create user
  async signUp(createUserDto: CreateUserDto) {
    // check if user exists
    const isUser = await this.findUserByEmail(createUserDto.email);

    if (isUser) {
      throw new ConflictException();
    }
    // hash password
    const salt = await bcrypt.genSalt(10);
    createUserDto.password = await bcrypt.hash(createUserDto.password, salt);

    // create  & save user
    const user = this.usersRepository.create(createUserDto);

    const newUser = await this.usersRepository.save(user);
    const token = this.generateToken(newUser, "email");
    const HOSTNAME = this.getHostName();

    const html = `<p>Hello, ${user.firstName.toUpperCase()}, click on the link below to verify your email: ${HOSTNAME}/verify-email?token=${token}&id=${
      newUser.id
    }
      </p>`;

    await this.mailService.sendTransactionalEmail(
      newUser,
      "Confirmation Email",
      html,
    );

    return { message: "X-Pay account was successfully created! " };
  }

  // Remove a user
  async deleteUserById(id: number): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException("User not found!");
    }

    await this.usersRepository.delete(user.id);
  }

  async deleteUserByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException("user not found");
    }
    await this.usersRepository.delete(user.email);
  }

  // save user
  async saveUser(user: User) {
    return await this.usersRepository.save(user);
  }

  generateToken(user: User, type?: "email") {
    const payload = { sub: user.id };

    if (type === "email") {
      const secret =
        this.configService.get<string>("VERIFY_EMAIL_TOKEN_SECRET") +
        user.isVerified;
      return this.jwtService.sign(payload, {
        secret,
        expiresIn: "24h",
      });
    }
    const secret =
      this.configService.get<string>("FORGOT_PASSWORD_TOKEN_SECRET") +
      user.password;
    return this.jwtService.sign(payload, {
      secret,
      expiresIn: "24h",
    });
  }

  getHostName() {
    let hostName: string;
    if (this.configService.get<string>("NODE_ENV") === "development") {
      hostName = this.configService.get<string>("CLIENT_URL_LOCAL");
    } else {
      hostName = this.configService.get<string>("CLIENT_URL_REMOTE");
    }
    return hostName;
  }
}
