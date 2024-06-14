import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User } from "./entities/user.entity";
import { MailModule } from "src/mail/mail.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([User]), JwtModule, MailModule],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
