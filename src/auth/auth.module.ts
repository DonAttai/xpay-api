import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "src/users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy, JwtStrategy, RefreshJwtStrategy } from "./strategies";
import { ConfigService } from "@nestjs/config";
import { RolesGuard } from "./guards";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "5m" },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RolesGuard,
    RefreshJwtStrategy,
    // JwtService,  added because of the custom guards
  ],
  controllers: [AuthController],
})
export class AuthModule {}
